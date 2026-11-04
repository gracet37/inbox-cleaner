import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1f5c48", dark: "#164536", light: "#3d7a64" },
    secondary: { main: "#dceee4" },
    background: { default: "#f3f6f2", paper: "#ffffff" },
    text: { primary: "#1a2e26", secondary: "#5b6b64" },
    divider: "#e4ebe6",
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: '"DM Sans", "Segoe UI", system-ui, sans-serif',
    h3: { fontWeight: 700, letterSpacing: "-0.03em" },
    h4: { fontWeight: 700, letterSpacing: "-0.03em" },
    h6: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 999 },
      },
    },
  },
});
