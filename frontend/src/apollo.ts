import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { apiOrigin } from "./config";

export const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: `${apiOrigin}/graphql`,
    credentials: "include",
  }),
  cache: new InMemoryCache(),
});
