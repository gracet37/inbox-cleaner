export type MessageCategory = "primary" | "newsletter" | "promotion" | "social";

export type Message = {
  id: string;
  from: string;
  email: string;
  subject: string;
  snippet: string;
  receivedAt: string;
  unread: boolean;
  category: MessageCategory;
  sizeEstimate: number;
};

export type InboxStats = {
  total: number;
  unread: number;
  newsletters: number;
  promotions: number;
};

export type GmailSession = {
  accessToken?: string;
  refreshToken?: string;
  expiryDate?: number;
  email?: string;
};

export type SenderStats = {
  from: string;
  email: string;
  count: number;
  readRate: number;
  readTag: ReadTag;
  lastDateReceived: string; //TODO: Check on the type for this
};

export type ReadTag = "Rare" | "Occasional" | "Frequent";
