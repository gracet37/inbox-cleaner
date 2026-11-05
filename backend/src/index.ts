import "dotenv/config";
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { expressMiddleware } from "@as-integrations/express4";
import cors from "cors";
import express from "express";
import session from "express-session";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import FileStoreFactory from "session-file-store";
import { authRouter } from "./auth.js";
import { config } from "./config.js";
import { resolvers, typeDefs } from "./schema.js";

const FileStore = FileStoreFactory(session);
const sessionDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.sessions");
const sessionTtlSeconds = 7 * 24 * 60 * 60;

const app = express();
const httpServer = createServer(app);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

const corsOptions: cors.CorsOptions = {
  origin: config.frontendOrigin,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(
  session({
    store: new FileStore({
      path: sessionDir,
      ttl: sessionTtlSeconds,
      retries: 0,
      secret: config.sessionSecret,
      logFn: () => {},
    }),
    name: "inbox.sid",
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: sessionTtlSeconds * 1000,
    },
  }),
);
app.use(express.json());
app.use("/auth", authRouter);

app.use(
  "/graphql",
  expressMiddleware(server, {
    context: async ({ req }) => ({ session: req.session }),
  }),
);

httpServer.listen(config.port, () => {
  console.log(`GraphQL listening on http://localhost:${config.port}/graphql`);
  console.log(`Gmail OAuth start: http://localhost:${config.port}/auth/google`);
});
