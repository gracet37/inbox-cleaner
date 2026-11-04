import { ApolloProvider } from "@apollo/client/react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { apolloClient } from "./apollo";
import { theme } from "./theme";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ApolloProvider client={apolloClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </ApolloProvider>
  </StrictMode>,
);
