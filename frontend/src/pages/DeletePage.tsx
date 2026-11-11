import { useMutation, useQuery } from "@apollo/client/react";
import {
  AttachFileOutlined,
  HistoryOutlined,
  InboxOutlined,
  LocalOfferOutlined,
  NewspaperOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import CleanupProgressBar, { type CleanupProgress } from "../components/cleanup-progress-bar";
import CategoryCards, { type CategoryKey, type InboxCategory } from "../components/inbox-page/category-cards";
import EmailActionContainer from "../components/inbox-page/email-action-container";
import FilterBar from "../components/inbox-page/filter-bar";
import { AUTH_QUERY, CLEAN_MESSAGES_MUTATION, INBOX_QUERY } from "../graphql";
import { demoSenders, sendersFromMessages, type SenderRow } from "../senders";
import type { InboxStats, Message } from "../types";

const PAGE_SIZE = 6;
const DEFAULT_SELECTED = ["hello@everlane.com", "email@westelm.com", "hello@classpass.com"];

type AuthQueryData = { auth: { connected: boolean; email: string | null } };
type InboxQueryData = { inbox: { messages: Message[]; stats: InboxStats } };
type TrashMessagesData = { trashMessages: { removed: number; inbox: InboxQueryData["inbox"] } };

const categories: InboxCategory[] = [
  { key: "all", label: "All emails", icon: <InboxOutlined sx={{ fontSize: 19 }} />, color: "#52665d", symbolBg: "#f0f4f1" },
  { key: "promotion", label: "Promotions", icon: <LocalOfferOutlined sx={{ fontSize: 19 }} />, color: "#247653", symbolBg: "#ffffff" },
  { key: "newsletter", label: "Newsletters", icon: <NewspaperOutlined sx={{ fontSize: 19 }} />, color: "#52665d", symbolBg: "#f0f4f1" },
  { key: "large", label: "Large emails", icon: <AttachFileOutlined sx={{ fontSize: 19 }} />, color: "#52665d", symbolBg: "#f0f4f1" },
];

const designCounts: Record<CategoryKey, number> = {
  all: 2846,
  promotion: 1420,
  newsletter: 846,
  large: 184,
};
const DESIGN_SENDER_TOTAL = 128;

export default function DeletePage() {
  const searchRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<CategoryKey>("promotion");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<string[]>(DEFAULT_SELECTED);
  const [hidden, setHidden] = useState<string[]>([]);
  const [newestFirst, setNewestFirst] = useState(true);
  const [olderThanSixMonths, setOlderThanSixMonths] = useState(false);
  const [sizeLabel, setSizeLabel] = useState("Any size");
  const [rarelyReadOnly, setRarelyReadOnly] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [cleanup, setCleanup] = useState<CleanupProgress | null>(null);
  const [emailCounts, setEmailCounts] = useState<Record<CategoryKey, number>>(designCounts);
  const seededFromInbox = useRef(false);

  const { data: authData, loading: authLoading } = useQuery<AuthQueryData>(AUTH_QUERY);
  const connected = authData?.auth.connected ?? false;
  const { data, loading: inboxLoading, error } = useQuery<InboxQueryData>(INBOX_QUERY, { skip: !connected });
  const [trashMessages, { loading: cleaning, error: cleanError }] = useMutation<
    TrashMessagesData,
    { ids: string[] }
  >(CLEAN_MESSAGES_MUTATION);

  const usingDemo = !connected || (data?.inbox.messages.length ?? 0) === 0;
  const stats = data?.inbox.stats;

  const senders = useMemo(() => {
    const cutoff = sixMonthsAgo();
    const minimumBytes = sizeMinimumBytes(sizeLabel);
    const messages = (data?.inbox.messages ?? []).filter(
      (message) =>
        (!olderThanSixMonths || isOlderThan(message.receivedAt, cutoff)) && passesSize(message.sizeEstimate, minimumBytes),
    );
    const source = usingDemo
      ? demoSenders.filter(
        (sender) =>
          (!olderThanSixMonths || isOlderThan(sender.lastReceived, cutoff)) && passesSize(sender.sizeEstimate, minimumBytes),
      )
      : sendersFromMessages(messages);
    return source.filter((sender) => !hidden.includes(sender.email));
  }, [data?.inbox.messages, hidden, olderThanSixMonths, sizeLabel, usingDemo]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return senders
      .filter((sender) => matchesCategory(sender, category, usingDemo))
      .filter((sender) => !rarelyReadOnly || sender.readRate === 0)
      .filter(
        (sender) =>
          !needle || sender.from.toLowerCase().includes(needle) || sender.email.toLowerCase().includes(needle),
      )
      .slice()
      .sort((a, b) => {
        const delta = Date.parse(a.lastReceived) - Date.parse(b.lastReceived);
        return newestFirst ? -delta : delta;
      });
  }, [senders, category, query, rarelyReadOnly, newestFirst, usingDemo]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);
  const visibleSelected = visible.filter((sender) => selected.includes(sender.email));
  const selectedSenders = filtered.filter((sender) => selected.includes(sender.email));
  const selectedEmails = selectedSenders.reduce((sum, sender) => sum + sender.emailsPerMonth, 0);
  const allVisibleSelected = visible.length > 0 && visibleSelected.length === visible.length;
  const someVisibleSelected = visibleSelected.length > 0 && !allVisibleSelected;

  useEffect(() => {
    if (seededFromInbox.current || !connected || !data?.inbox.messages.length || !stats) return;
    seededFromInbox.current = true;
    const source = sendersFromMessages(data.inbox.messages);
    setEmailCounts({
      all: stats.total,
      promotion: stats.promotions,
      newsletter: stats.newsletters,
      large: countByCategory(source, false).large,
    });
  }, [connected, data, stats]);

  const listReflectsCategory = !query && !rarelyReadOnly && !olderThanSixMonths && sizeLabel === "Any size";
  const listEmailCount = listReflectsCategory
    ? emailCounts[category]
    : filtered.reduce((sum, sender) => sum + sender.emailsPerMonth, 0);

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

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function toggleOne(email: string) {
    setSelected((current) => (current.includes(email) ? current.filter((item) => item !== email) : [...current, email]));
  }

  function toggleVisible() {
    const ids = visible.map((sender) => sender.email);
    setSelected((current) =>
      allVisibleSelected ? current.filter((id) => !ids.includes(id)) : [...new Set([...current, ...ids])],
    );
  }

  async function deleteSenders(emails: string[]) {
    if (emails.length === 0) return;
    const ids = senders.filter((sender) => emails.includes(sender.email)).flatMap((sender) => sender.messageIds);
    const total = ids.length > 0 ? ids.length : emails.length;
    setCleanup({ status: "running", total, progress: 12 });
    try {
      if (connected && ids.length > 0) {
        await trashMessages({
          variables: { ids },
          update(cache, result) {
            const inbox = result.data?.trashMessages.inbox;
            if (!inbox) return;
            cache.writeQuery({ query: INBOX_QUERY, data: { inbox } });
          },
        });
      }
      const removed = countByCategory(
        senders.filter((sender) => emails.includes(sender.email)),
        usingDemo,
      );
      setEmailCounts((current) => ({
        all: Math.max(0, current.all - removed.all),
        promotion: Math.max(0, current.promotion - removed.promotion),
        newsletter: Math.max(0, current.newsletter - removed.newsletter),
        large: Math.max(0, current.large - removed.large),
      }));
      setHidden((current) => [...new Set([...current, ...emails])]);
      setSelected((current) => current.filter((email) => !emails.includes(email)));
      setCleanup({ status: "done", total, progress: 100 });
    } catch {
      setCleanup(null);
    }
  }

  const displayError = error?.message ?? cleanError?.message ?? null;
  const designList =
    usingDemo &&
    category === "promotion" &&
    !query &&
    !rarelyReadOnly &&
    !olderThanSixMonths &&
    sizeLabel === "Any size" &&
    currentPage === 0;
  const remainingDesignSenders = Math.max(0, DESIGN_SENDER_TOTAL - hidden.length);
  const totalSenders = designList ? remainingDesignSenders : filtered.length;
  const displayPageCount = designList ? Math.max(1, Math.ceil(remainingDesignSenders / PAGE_SIZE)) : pageCount;
  const rangeStart = totalSenders === 0 ? 0 : currentPage * PAGE_SIZE + 1;
  const rangeEnd = Math.min(totalSenders, (currentPage + 1) * PAGE_SIZE);

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }} justifyContent="space-between">
        <Box>
          <Typography sx={{ color: "#203b33", fontSize: { xs: 26, sm: 30 }, fontWeight: 600, lineHeight: 1.2 }}>
            Less clutter. More clarity.
          </Typography>
          <Typography sx={{ color: "#52665d", fontSize: 14, mt: "7px" }}>Keep what matters. Let the rest go.</Typography>
        </Box>
        <Button
          onClick={() => setHistoryOpen(true)}
          startIcon={<HistoryOutlined sx={{ fontSize: 16 }} />}
          sx={outlineButtonSx}
        >
          Cleanup history
        </Button>
      </Stack>

      <CategoryCards
        categories={categories}
        selected={category}
        counts={emailCounts}
        onSelect={(key) => {
          setCategory(key);
          setPage(0);
        }}
      />

      <FilterBar
        query={query}
        onQueryChange={(value) => {
          setQuery(value);
          setPage(0);
        }}
        searchRef={searchRef}
        olderThanSixMonths={olderThanSixMonths}
        onToggleOlderThanSixMonths={() => {
          setOlderThanSixMonths((current) => !current);
          setPage(0);
        }}
        sizeLabel={sizeLabel}
        onSizeChange={(label) => {
          setSizeLabel(label);
          setPage(0);
        }}
        rarelyReadOnly={rarelyReadOnly}
        onToggleRarelyReadOnly={() => {
          setRarelyReadOnly((current) => !current);
          setPage(0);
        }}
      />

      {displayError && <Alert severity="error">{displayError}</Alert>}
      {authLoading || (connected && inboxLoading) ? (
        <Typography sx={{ color: "#7a8983", fontSize: 13 }}>Loading your inbox…</Typography>
      ) : null}

      {cleanup && <CleanupProgressBar cleanup={cleanup} />}

      <EmailActionContainer
        title={categories.find((item) => item.key === category)?.label ?? "Inbox"}
        emailCount={listEmailCount}
        newestFirst={newestFirst}
        onToggleSort={() => setNewestFirst((current) => !current)}
        senders={visible}
        selected={selected}
        onToggleSender={toggleOne}
        onToggleVisible={toggleVisible}
        allVisibleSelected={allVisibleSelected}
        someVisibleSelected={someVisibleSelected}
        selectedCount={selectedSenders.length}
        selectedEmailCount={selectedEmails}
        selectedSenderEmails={selectedSenders.map((sender) => sender.email)}
        onDelete={(emails) => void deleteSenders(emails)}
        deleting={cleaning}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        totalSenders={totalSenders}
        currentPage={currentPage}
        pageCount={pageCount}
        displayPageCount={displayPageCount}
        onPreviousPage={() => setPage((current) => Math.max(0, current - 1))}
        onNextPage={() => setPage((current) => Math.min(pageCount - 1, current + 1))}
      />

      <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Cleanup history</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "#52665d", fontSize: 14, pb: 2 }}>
            Deleted mail is moved to Gmail Trash and can be restored within 30 days. Nothing has been deleted in this session yet.
          </Typography>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}

const BYTES_IN_MB = 1024 * 1024;

function sizeMinimumBytes(label: string) {
  if (label === "Over 1 MB") return BYTES_IN_MB;
  if (label === "Over 5 MB") return 5 * BYTES_IN_MB;
  return 0;
}

function passesSize(sizeEstimate: number, minimumBytes: number) {
  return minimumBytes === 0 || sizeEstimate > minimumBytes;
}

function sixMonthsAgo(today = new Date()) {
  return new Date(today.getFullYear(), today.getMonth() - 6, today.getDate()).getTime();
}

function isOlderThan(receivedAt: string, cutoff: number) {
  const received = Date.parse(receivedAt);
  return !Number.isNaN(received) && received < cutoff;
}

function countByCategory(list: SenderRow[], usingDemo: boolean): Record<CategoryKey, number> {
  const volume = (key: CategoryKey) =>
    list.filter((sender) => matchesCategory(sender, key, usingDemo)).reduce((sum, sender) => sum + sender.emailsPerMonth, 0);
  return {
    all: volume("all"),
    promotion: volume("promotion"),
    newsletter: volume("newsletter"),
    large: volume("large"),
  };
}

function matchesCategory(sender: SenderRow, category: CategoryKey, usingDemo: boolean) {
  if (category === "all") return true;
  if (category === "large") return sender.emailsPerMonth >= 20;
  if (usingDemo && category === "promotion") return true;
  if (category === "promotion") return sender.category === "promotion";
  return sender.category === "newsletter" || sender.category === "social";
}

const outlineButtonSx = {
  height: 40,
  px: "16px",
  borderRadius: "8px",
  border: "1px solid #e5ebe7",
  bgcolor: "#fff",
  color: "#203b33",
  fontSize: 13,
  fontWeight: 600,
  whiteSpace: "nowrap",
  "&:hover": { bgcolor: "#f7f9f8", borderColor: "#e5ebe7" },
};

