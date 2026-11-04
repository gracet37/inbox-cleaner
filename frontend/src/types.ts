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
};

export type InboxStats = {
  total: number;
  unread: number;
  newsletters: number;
  promotions: number;
};
