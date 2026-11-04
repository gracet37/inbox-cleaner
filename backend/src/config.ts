const frontendOrigin = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";

export const config = {
  port: Number(process.env.PORT) || 3001,
  frontendOrigin,
  sessionSecret: process.env.SESSION_SECRET ?? "dev-session-secret-change-me",
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    redirectUri:
      process.env.GOOGLE_REDIRECT_URI ?? "http://localhost:3001/auth/google/callback",
  },
};


export function assertGoogleOAuthConfigured() {
  if (!config.google.clientId || !config.google.clientSecret) {
    throw new Error(
      "Gmail OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
    );
  }
}
