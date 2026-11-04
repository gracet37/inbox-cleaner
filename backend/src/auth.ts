import { randomBytes } from "node:crypto";
import { Router } from "express";
import { assertGoogleOAuthConfigured, config } from "./config.js";
import { authorizationUrl, exchangeCode } from "./gmail.js";

export const authRouter = Router();

authRouter.get("/google", (req, res) => {
  try {
    assertGoogleOAuthConfigured();
  } catch (error) {
    res.status(500).send(error instanceof Error ? error.message : "OAuth is not configured");
    return;
  }

  const state = randomBytes(16).toString("hex");
  req.session.oauthState = state;
  req.session.save((saveError) => {
    if (saveError) {
      res.status(500).send("Could not start Gmail sign-in");
      return;
    }
    res.redirect(authorizationUrl(state));
  });
});

authRouter.get("/google/callback", async (req, res) => {
  const { code, state, error } = req.query;
  const frontend = config.frontendOrigin;

  if (typeof error === "string") {
    res.redirect(`${frontend}/?gmail=error&reason=${encodeURIComponent(error)}`);
    return;
  }

  if (typeof code !== "string" || typeof state !== "string" || state !== req.session.oauthState) {
    res.redirect(`${frontend}/?gmail=error&reason=invalid_state`);
    return;
  }

  try {
    const gmail = await exchangeCode(code);
    const previous = req.session.gmail;
    req.session.gmail = {
      ...gmail,
      refreshToken: gmail.refreshToken ?? previous?.refreshToken,
    };
    delete req.session.oauthState;
    req.session.save((saveError) => {
      if (saveError) {
        res.redirect(`${frontend}/?gmail=error&reason=session`);
        return;
      }
      res.redirect(`${frontend}/?gmail=connected`);
    });
  } catch {
    res.redirect(`${frontend}/?gmail=error&reason=token_exchange`);
  }
});

