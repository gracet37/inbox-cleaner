import type { GmailSession } from "./types.js";

declare module "express-session" {
  interface SessionData {
    oauthState?: string;
    gmail?: GmailSession;
  }
}
