import type { Message } from "./types";

export type SenderStatus = "active" | "unsubscribed" | "kept";

export type SenderRow = {
  email: string;
  from: string;
  emailsPerMonth: number;
  readRate: number;
  lastReceived: string;
  rarelyRead: boolean;
  category: string;
  messageIds: string[];
  sizeEstimate: number;
  status: SenderStatus;
};

const avatarPalette = ["#1f5c48", "#e8b89a", "#c9b8e8", "#cfe8d8", "#f0d3b8", "#d7efe3"];

export function avatarColor(email: string) {
  const sum = [...email].reduce((total, char) => total + char.charCodeAt(0), 0);
  return avatarPalette[sum % avatarPalette.length];
}

export function initials(from: string) {
  const parts = from.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toLowerCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toLowerCase();
}

export function formatLastReceived(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startToday.getTime() - startDate.getTime()) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}

export function sendersFromMessages(messages: Message[]): SenderRow[] {
  const grouped = new Map<string, Message[]>();
  for (const message of messages) {
    const list = grouped.get(message.email) ?? [];
    list.push(message);
    grouped.set(message.email, list);
  }

  return [...grouped.entries()]
    .map(([email, list]) => {
      const latest = list.reduce((newest, message) =>
        Date.parse(message.receivedAt) > Date.parse(newest.receivedAt) ? message : newest,
      );
      const readCount = list.filter((message) => !message.unread).length;
      const readRate = list.length === 0 ? 0 : readCount / list.length;
      return {
        email,
        from: latest.from,
        emailsPerMonth: list.length,
        readRate,
        lastReceived: latest.receivedAt,
        rarelyRead: readRate <= 0.15,
        category: latest.category,
        messageIds: list.map((message) => message.id),
        sizeEstimate: Math.max(...list.map((message) => message.sizeEstimate)),
        status: "active" as const,
      };
    })
    .sort((a, b) => b.emailsPerMonth - a.emailsPerMonth);
}

export const demoSenders: SenderRow[] = [
  {
    email: "hello@everlane.com",
    from: "Everlane",
    emailsPerMonth: 28,
    readRate: 0,
    lastReceived: new Date().toISOString(),
    rarelyRead: true,
    category: "promotion",
    messageIds: [],
    sizeEstimate: 180_000,
    status: "active",
  },
  {
    email: "email@westelm.com",
    from: "West Elm",
    emailsPerMonth: 24,
    readRate: 0,
    lastReceived: new Date(Date.now() - 86_400_000).toISOString(),
    rarelyRead: true,
    category: "promotion",
    messageIds: [],
    sizeEstimate: 1_600_000,
    status: "active",
  },
  {
    email: "hello@classpass.com",
    from: "ClassPass",
    emailsPerMonth: 20,
    readRate: 0,
    lastReceived: new Date(Date.now() - 86_400_000).toISOString(),
    rarelyRead: true,
    category: "newsletter",
    messageIds: [],
    sizeEstimate: 6_200_000,
    status: "active",
  },
  {
    email: "hello@allbirds.com",
    from: "Allbirds",
    emailsPerMonth: 18,
    readRate: 0.06,
    lastReceived: "2026-10-26T12:00:00.000Z",
    rarelyRead: true,
    category: "promotion",
    messageIds: [],
    sizeEstimate: 540_000,
    status: "active",
  },
  {
    email: "hello@headspace.com",
    from: "Headspace",
    emailsPerMonth: 16,
    readRate: 0.12,
    lastReceived: "2026-10-25T12:00:00.000Z",
    rarelyRead: true,
    category: "newsletter",
    messageIds: [],
    sizeEstimate: 2_400_000,
    status: "active",
  },
  {
    email: "hello@thesill.com",
    from: "The Sill",
    emailsPerMonth: 12,
    readRate: 0.25,
    lastReceived: "2026-10-24T12:00:00.000Z",
    rarelyRead: false,
    category: "newsletter",
    messageIds: [],
    sizeEstimate: 90_000,
    status: "active",
  },
  {
    email: "nytdirect@nytimes.com",
    from: "The New York Times",
    emailsPerMonth: 10,
    readRate: 0.4,
    lastReceived: "2026-10-23T12:00:00.000Z",
    rarelyRead: false,
    category: "newsletter",
    messageIds: [],
    sizeEstimate: 5_500_000,
    status: "active",
  },
  {
    email: "hello@substack.com",
    from: "Substack",
    emailsPerMonth: 8,
    readRate: 0.5,
    lastReceived: "2026-10-22T12:00:00.000Z",
    rarelyRead: false,
    category: "newsletter",
    messageIds: [],
    sizeEstimate: 1_100_000,
    status: "active",
  },
];
