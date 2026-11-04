# Inbox Clean

Web app for reviewing and cleaning Gmail clutter.

- Frontend: React, TypeScript, MUI, Apollo Client
- Backend: Node.js, TypeScript, Express, Apollo Server
- Gmail: OAuth 2.0 with `gmail.modify` (read inbox + archive mail)

## Run locally

```bash
cp backend/.env.example backend/.env
npm install
npm run dev
```

- App: http://localhost:5173
- GraphQL: http://localhost:3001/graphql
- Gmail connect: http://localhost:3001/auth/google

## Gmail OAuth setup

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/).
2. Enable the **Gmail API**.
3. Configure the OAuth consent screen. Add scopes:
   - `https://www.googleapis.com/auth/gmail.modify`
   - `https://www.googleapis.com/auth/userinfo.email`
4. Create an OAuth **Web application** client.
5. Add authorized JavaScript origin `http://localhost:5173`.
6. Add authorized redirect URI `http://localhost:3001/auth/google/callback`.
7. Put the client ID and secret in `backend/.env`.
