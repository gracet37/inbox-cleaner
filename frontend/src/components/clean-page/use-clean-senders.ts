import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";
import type { CleanupProgress } from "../cleanup-progress-bar";
import { AUTH_QUERY, INBOX_QUERY, UNSUBSCRIBE_MESSAGES_MUTATION } from "../../graphql";
import { demoSenders, sendersFromMessages, type SenderStatus } from "../../senders";
import type { InboxStats, Message } from "../../types";

const PAGE_SIZE = 6;

type AuthQueryData = { auth: { connected: boolean; email: string | null } };
type InboxQueryData = { inbox: { messages: Message[]; stats: InboxStats } };
type UnsubscribeMessagesData = {
  unsubscribeMessages: { email: string; unsubscribed: boolean }[];
};

export type UnsubscribeFailure = {
  email: string;
  from: string;
  reason: "unavailable" | "request";
};

export function useCleanSenders() {
  const [tab, setTab] = useState<SenderStatus>("active");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [overrides, setOverrides] = useState<Record<string, SenderStatus>>({});
  const [cleanup, setCleanup] = useState<CleanupProgress | null>(null);
  const [failedUnsubscribes, setFailedUnsubscribes] = useState<UnsubscribeFailure[]>([]);

  const { data: authData } = useQuery<AuthQueryData>(AUTH_QUERY);
  const connected = authData?.auth.connected ?? false;
  const { data, loading } = useQuery<InboxQueryData>(INBOX_QUERY, { skip: !connected });
  const [unsubscribeMessages, { loading: unsubscribing }] = useMutation<
    UnsubscribeMessagesData,
    { emails: string[] }
  >(UNSUBSCRIBE_MESSAGES_MUTATION);

  const baseSenders = useMemo(() => {
    const fromInbox = sendersFromMessages(data?.inbox.messages ?? []);
    return fromInbox.length > 0 ? fromInbox : demoSenders;
  }, [data?.inbox.messages]);

  const senders = useMemo(
    () => baseSenders.map((sender) => ({ ...sender, status: overrides[sender.email] ?? sender.status })),
    [baseSenders, overrides],
  );

  const counts = useMemo(
    () => ({
      active: senders.filter((sender) => sender.status === "active").length,
      unsubscribed: senders.filter((sender) => sender.status === "unsubscribed").length,
      kept: senders.filter((sender) => sender.status === "kept").length,
    }),
    [senders],
  );

  const filtered = useMemo(() => filterSenders(senders, tab, category, query), [senders, tab, category, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);
  const selectedVisible = visible.filter((sender) => selected.includes(sender.email));
  const selectedCount = selected.filter((email) => filtered.some((sender) => sender.email === email)).length;
  const selectedVolume = senders
    .filter((sender) => selected.includes(sender.email) && sender.status === "active")
    .reduce((sum, sender) => sum + sender.emailsPerMonth, 0);
  const allVisibleSelected = visible.length > 0 && selectedVisible.length === visible.length;
  const someVisibleSelected = selectedVisible.length > 0 && selectedVisible.length < visible.length;

  function handleTabChange(value: SenderStatus) {
    setTab(value);
    setPage(0);
    setSelected([]);
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    setPage(0);
  }

  function handleCategoryChange(value: string) {
    setCategory(value);
    setPage(0);
  }

  function toggleOne(email: string) {
    setSelected((current) =>
      current.includes(email) ? current.filter((item) => item !== email) : [...current, email],
    );
  }

  function togglePage() {
    const ids = visible.map((sender) => sender.email);
    const allOn = ids.every((id) => selected.includes(id));
    setSelected((current) => (allOn ? current.filter((id) => !ids.includes(id)) : [...new Set([...current, ...ids])]));
  }

  function setStatus(emails: string[], status: SenderStatus) {
    setOverrides((current) => {
      const next = { ...current };
      for (const email of emails) next[email] = status;
      return next;
    });
    setSelected((current) => current.filter((email) => !emails.includes(email)));
  }

  useEffect(() => {
    if (cleanup?.status !== "running") return;
    const timer = window.setInterval(() => {
      setCleanup((current) => {
        if (!current || current.status !== "running" || current.progress >= 90) return current;
        return { ...current, progress: Math.min(90, current.progress + 8) };
      });
    }, 240);
    return () => window.clearInterval(timer);
  }, [cleanup?.status]);

  function describeFailure(email: string, reason: UnsubscribeFailure["reason"]): UnsubscribeFailure {
    return { email, from: senders.find((sender) => sender.email === email)?.from ?? email, reason };
  }

  async function unsubscribe(emails: string[]) {
    if (emails.length === 0) return;
    setFailedUnsubscribes((current) => current.filter((item) => !emails.includes(item.email)));
    setCleanup({ status: "running", total: emails.length, progress: 12 });
    try {
      if (!connected) {
        setStatus(emails, "unsubscribed");
        setCleanup({ status: "done", total: emails.length, progress: 100 });
        return;
      }
      const result = await unsubscribeMessages({ variables: { emails } });
      const outcomes = result.data?.unsubscribeMessages ?? [];
      const done = outcomes.filter((item) => item.unsubscribed).map((item) => item.email);
      const reported = new Set(outcomes.map((item) => item.email));
      const failed = [
        ...outcomes
          .filter((item) => !item.unsubscribed)
          .map((item) => describeFailure(item.email, "unavailable")),
        ...emails.filter((email) => !reported.has(email)).map((email) => describeFailure(email, "request")),
      ];
      if (done.length > 0) {
        setStatus(done, "unsubscribed");
        setCleanup({ status: "done", total: done.length, progress: 100 });
      } else {
        setCleanup(null);
      }
      if (failed.length > 0) setFailedUnsubscribes((current) => [...current, ...failed]);
    } catch {
      setCleanup(null);
      setFailedUnsubscribes((current) => [...current, ...emails.map((email) => describeFailure(email, "request"))]);
    }
  }

  return {
    tab,
    query,
    category,
    loading,
    counts,
    unsubscribedCount: Math.max(counts.unsubscribed, 86),
    visible,
    selected,
    selectedCount,
    selectedVolume,
    allVisibleSelected,
    someVisibleSelected,
    unsubscribing,
    cleanup,
    failedUnsubscribes,
    dismissUnsubscribeErrors: () => setFailedUnsubscribes([]),
    rangeStart: filtered.length === 0 ? 0 : currentPage * PAGE_SIZE + 1,
    rangeEnd: Math.min((currentPage + 1) * PAGE_SIZE, filtered.length),
    subscriptionTotal: filtered.length || counts.active,
    currentPage,
    pageCount,
    handleTabChange,
    handleQueryChange,
    handleCategoryChange,
    toggleOne,
    togglePage,
    keep: (emails: string[]) => setStatus(emails, "kept"),
    keepSelected: () => setStatus(selected, "kept"),
    unsubscribe,
    unsubscribeSelected: () => void unsubscribe(selected),
    goToPreviousPage: () => setPage((value) => value - 1),
    goToNextPage: () => setPage((value) => value + 1),
  };
}

function filterSenders<T extends { status: SenderStatus; category: string; from: string; email: string }>(
  senders: T[],
  tab: SenderStatus,
  category: string,
  query: string,
) {
  const needle = query.trim().toLowerCase();
  return senders
    .filter((sender) => sender.status === tab)
    .filter((sender) => (category === "all" ? true : sender.category === category))
    .filter(
      (sender) =>
        !needle || sender.from.toLowerCase().includes(needle) || sender.email.toLowerCase().includes(needle),
    );
}
