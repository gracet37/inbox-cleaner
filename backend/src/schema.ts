import { GraphQLError } from "graphql";
import type { Session, SessionData } from "express-session";
import { archiveMessages, emptyInbox, listInbox } from "./gmail.js";

type Context = {
  session: Session & Partial<SessionData>;
};

function requireGmail(session: Context["session"]) {
  if (!session.gmail?.accessToken && !session.gmail?.refreshToken) {
    throw new GraphQLError("Connect Gmail to read and clean this inbox.", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
  return session.gmail;
}

export const typeDefs = `#graphql
  enum MessageCategory {
    primary
    newsletter
    promotion
    social
  }

  type Message {
    id: ID!
    from: String!
    email: String!
    subject: String!
    snippet: String!
    receivedAt: String!
    unread: Boolean!
    category: MessageCategory!
  }

  type InboxStats {
    total: Int!
    unread: Int!
    newsletters: Int!
    promotions: Int!
  }

  type Inbox {
    messages: [Message!]!
    stats: InboxStats!
  }

  type Health {
    ok: Boolean!
    service: String!
  }

  type Auth {
    connected: Boolean!
    email: String
  }

  type CleanResult {
    removed: Int!
    inbox: Inbox!
  }

  type Query {
    health: Health!
    auth: Auth!
    inbox: Inbox!
  }

  type Mutation {
    cleanMessages(ids: [ID!]!): CleanResult!
    disconnectGmail: Auth!
  }
`;

export const resolvers = {
  Query: {
    health: () => ({ ok: true, service: "inbox-clean-api" }),
    auth: (_parent: unknown, _args: unknown, context: Context) => ({
      connected: Boolean(context.session.gmail?.accessToken || context.session.gmail?.refreshToken),
      email: context.session.gmail?.email ?? null,
    }),
    inbox: async (_parent: unknown, _args: unknown, context: Context) => {
      if (!context.session.gmail?.accessToken && !context.session.gmail?.refreshToken) {
        return emptyInbox;
      }
      return listInbox(context.session.gmail);
    },
  },
  Mutation: {
    cleanMessages: async (_parent: unknown, args: { ids: string[] }, context: Context) => {
      const gmail = requireGmail(context.session);
      const inbox = await archiveMessages(gmail, args.ids);
      return { removed: args.ids.length, inbox };
    },
    disconnectGmail: (_parent: unknown, _args: unknown, context: Context) => {
      context.session.gmail = undefined;
      return { connected: false, email: null };
    },
  },
};
