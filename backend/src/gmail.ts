import type { Credentials } from "google-auth-library";
import { google, type gmail_v1 } from "googleapis";
import { config } from "./config.js";
import type {
  GmailSession,
  InboxStats,
  Message,
  MessageCategory,
} from "./types.js";

type EmailBySender = Map<string, Message[]>

type SenderStat = {
  sender: string;
  email: string;
  count: number;
  readRate: number;
  readTag: ReadTag | null;
  lastReceived: string;
}

enum ReadTag {
  RARE = "Rare"
}

export const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/userinfo.email",
];

export function createOAuthClient() {
  return new google.auth.OAuth2(
    config.google.clientId,
    config.google.clientSecret,
    config.google.redirectUri,
  );
}

export function authorizationUrl(state: string) {
  const client = createOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GMAIL_SCOPES,
    include_granted_scopes: true,
    state,
  });
}

export async function exchangeCode(code: string): Promise<GmailSession> {
  const client = createOAuthClient();
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);
  const email = await fetchEmail(client);
  return toSession(tokens, email);
}

function authFromSession(session: GmailSession) {
  const client = createOAuthClient();
  client.setCredentials({
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
    expiry_date: session.expiryDate,
  });
  return client;
}

async function fetchEmail(client: ReturnType<typeof createOAuthClient>) {
  const oauth2 = google.oauth2({ version: "v2", auth: client });
  const { data } = await oauth2.userinfo.get();
  return data.email ?? "";
}

function toSession(tokens: Credentials, email: string): GmailSession {
  return {
    accessToken: tokens.access_token ?? undefined,
    refreshToken: tokens.refresh_token ?? undefined,
    expiryDate: tokens.expiry_date ?? undefined,
    email,
  };
}

async function persistRefreshedTokens(
  session: GmailSession,
  client: ReturnType<typeof createOAuthClient>,
) {
  const tokens = client.credentials;
  if (tokens.access_token) session.accessToken = tokens.access_token;
  if (tokens.refresh_token) session.refreshToken = tokens.refresh_token;
  if (tokens.expiry_date) session.expiryDate = tokens.expiry_date;
}

export function groupMessageBySender(messages: Message[]): EmailBySender {

  const emailMap = new Map<string, Message[]>()

  for (const item of messages) {
    const grouped = emailMap.get(item.email)
    if (grouped) {
      grouped.push(item)
    } else {
      emailMap.set(item.email, [item])
    }
  }

  return emailMap;
}

function calculateReadRate(messages: Message[]) {
  let unreadCount = 0;
  const totalCount = messages.length

  for (let i = 0; i < messages.length; i++) {
    if (messages[i].unread) {
      unreadCount += 1
    }
  }

  const readRate = (totalCount - unreadCount) / totalCount;

  // Read Tag - < 15% read rate = rare

  const readTag = readRate < 15 ? ReadTag.RARE : null;

  return {
    readRate: (totalCount - unreadCount) / totalCount,
    readTag
  }
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function getLastReceived(message: Message): string {
  const received = new Date(message.receivedAt);
  if (Number.isNaN(received.getTime())) return message.receivedAt;

  const today = startOfLocalDay(new Date());
  const receivedDay = startOfLocalDay(received);
  const diffDays = Math.round((today - receivedDay) / 86_400_000);

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(received);
}

function getSenderStats(messages: Message[]): SenderStat[] {

  const emailBySender = groupMessageBySender(messages);

  const calculatedReadRate = calculateReadRate(messages);

  const senderStats = [];

  for (const [email, messages] of emailBySender) {
    for (const message of messages) {
      const stats = {
        sender: message.from,
        email: message.email,
        count: messages.length,
        readRate: calculatedReadRate.readRate,
        readTag: calculatedReadRate.readTag,
        lastReceived: getLastReceived(message)
      }

      senderStats.push(stats)
    }
  }

  return senderStats;
}

export async function listInbox(session: GmailSession): Promise<{
  messages: Message[];
  stats: InboxStats;
  senderStats: SenderStat[]
}> {
  const client = authFromSession(session);
  const gmail = google.gmail({ version: "v1", auth: client });
  const listed = await gmail.users.messages.list({
    userId: "me", // "me" is the authenticated user
    labelIds: ["INBOX"],
    maxResults: 100, //TODO: Update this 
  });
  await persistRefreshedTokens(session, client);

  const ids =
    listed.data.messages
      ?.map((message) => message.id)
      .filter((id): id is string => Boolean(id)) ?? [];
  const messages = (
    await Promise.all(ids.map((id) => getMessage(gmail, id)))
  ).filter((message): message is Message => message !== null);

  const emailBySender = groupMessageBySender(messages)

  const senderStats = getSenderStats(messages)
  console.log("🚀 ~ listInbox ~ senderStats:", emailBySender)

  return { messages, stats: inboxStats(messages), senderStats };
}

export async function archiveMessages(session: GmailSession, ids: string[]) {
  if (ids.length === 0) {
    return listInbox(session);
  }

  const client = authFromSession(session);
  const gmail = google.gmail({ version: "v1", auth: client });
  await gmail.users.messages.batchModify({
    userId: "me",
    requestBody: {
      ids,
      removeLabelIds: ["INBOX"],
    },
  });
  await persistRefreshedTokens(session, client);
  return listInbox(session);
}

async function getMessage(gmail: gmail_v1.Gmail, id: string): Promise<Message | null> {
  const { data } = await gmail.users.messages.get({
    userId: "me",
    id,
    format: "metadata",
    metadataHeaders: ["From", "Subject", "Date"],
  });
  if (!data.id) return null;

  const headers = data.payload?.headers ?? [];
  const { from, email } = parseFrom(headerValue(headers, "From"));
  const subject = headerValue(headers, "Subject") || "(no subject)";
  const receivedAt = toIsoDate(headerValue(headers, "Date"));
  const labels = data.labelIds ?? [];

  return {
    id: data.id,
    from,
    email,
    subject,
    snippet: data.snippet ?? "",
    receivedAt,
    unread: labels.includes("UNREAD"),
    category: categoryFromLabels(labels),
  };
}

function headerValue(
  headers: Array<{ name?: string | null; value?: string | null }>,
  name: string,
) {
  return headers.find((header) => header.name?.toLowerCase() === name.toLowerCase())?.value ?? "";
}

export function parseFrom(value: string): { from: string; email: string } {
  const trimmed = value.trim();
  const angled = trimmed.match(/^(.*)<([^>]+)>\s*$/);
  if (angled) {
    const name = angled[1].replaceAll('"', "").trim();
    const email = angled[2].trim();
    return { from: name || email, email };
  }
  return { from: trimmed || "Unknown", email: trimmed };
}

function toIsoDate(value: string) {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? new Date().toISOString() : new Date(parsed).toISOString();
}

function categoryFromLabels(labelIds: string[]): MessageCategory {
  if (labelIds.includes("CATEGORY_PROMOTIONS")) return "promotion";
  if (labelIds.includes("CATEGORY_SOCIAL")) return "social";
  if (labelIds.includes("CATEGORY_UPDATES") || labelIds.includes("CATEGORY_FORUMS")) {
    return "newsletter";
  }
  return "primary";
}

function inboxStats(messages: Message[]): InboxStats {
  return {
    total: messages.length,
    unread: messages.filter((message) => message.unread).length,
    newsletters: messages.filter((message) => message.category === "newsletter").length,
    promotions: messages.filter((message) => message.category === "promotion").length,
  };
}

export const emptyInbox = {
  messages: [] as Message[],
  stats: { total: 0, unread: 0, newsletters: 0, promotions: 0 } satisfies InboxStats,
};

