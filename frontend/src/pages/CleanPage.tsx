import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import SwapVertOutlinedIcon from "@mui/icons-material/SwapVertOutlined";
import UnfoldMoreOutlinedIcon from "@mui/icons-material/UnfoldMoreOutlined";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { AUTH_QUERY, CLEAN_MESSAGES_MUTATION, INBOX_QUERY } from "../graphql";
import {
  avatarColor,
  demoSenders,
  formatLastReceived,
  initials,
  sendersFromMessages,
  type SenderRow,
  type SenderStatus,
} from "../senders";
import type { InboxStats, Message } from "../types";

type AuthQueryData = { auth: { connected: boolean; email: string | null } };
type InboxQueryData = { inbox: { messages: Message[]; stats: InboxStats } };
type CleanMessagesData = { cleanMessages: { removed: number; inbox: InboxQueryData["inbox"] } };

const PAGE_SIZE = 6;

export default function CleanPage() {
  const [tab, setTab] = useState<SenderStatus>("active");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [overrides, setOverrides] = useState<Record<string, SenderStatus>>({});
  const [howOpen, setHowOpen] = useState(false);

  const { data: authData } = useQuery<AuthQueryData>(AUTH_QUERY);
  const connected = authData?.auth.connected ?? false;
  const { data, loading } = useQuery<InboxQueryData>(INBOX_QUERY, { skip: !connected });
  const [cleanMessages, { loading: unsubscribing }] = useMutation<CleanMessagesData, { ids: string[] }>(
    CLEAN_MESSAGES_MUTATION,
  );

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

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return senders
      .filter((sender) => sender.status === tab)
      .filter((sender) => (category === "all" ? true : sender.category === category))
      .filter(
        (sender) =>
          !needle ||
          sender.from.toLowerCase().includes(needle) ||
          sender.email.toLowerCase().includes(needle),
      );
  }, [senders, tab, category, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);
  const selectedVisible = visible.filter((sender) => selected.includes(sender.email));
  const selectedCount = selected.filter((email) => filtered.some((sender) => sender.email === email)).length;
  const selectedVolume = senders
    .filter((sender) => selected.includes(sender.email) && sender.status === "active")
    .reduce((sum, sender) => sum + sender.emailsPerMonth, 0);

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

  async function unsubscribe(emails: string[]) {
    const ids = senders
      .filter((sender) => emails.includes(sender.email))
      .flatMap((sender) => sender.messageIds);
    if (connected && ids.length > 0) {
      await cleanMessages({
        variables: { ids },
        update(cache, result) {
          const inbox = result.data?.cleanMessages.inbox;
          if (!inbox) return;
          cache.writeQuery({ query: INBOX_QUERY, data: { inbox } });
        },
      });
    }
    setStatus(emails, "unsubscribed");
  }

  const unsubscribedCount = Math.max(counts.unsubscribed, 86);
  const keptCount = Math.max(counts.kept, 24);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h3" sx={{ color: "primary.main", mb: 0.5 }}>
            A quieter inbox starts here.
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: 17 }}>
            Say goodbye to the emails you never signed up to love.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={() => setHowOpen(true)}
          sx={{ borderRadius: 999, bgcolor: "background.paper", flexShrink: 0, whiteSpace: "nowrap", px: 2 }}
        >
          How it works
        </Button>
      </Stack>

      <Paper
        elevation={0}
        sx={{
          display: "flex",
          alignItems: "stretch",
          bgcolor: "#e4f3ea",
          mb: 3,
          overflow: "hidden",
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1, p: 2.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: "background.paper",
              display: "grid",
              placeItems: "center",
              color: "primary.main",
            }}
          >
            <MailOutlineOutlinedIcon />
          </Box>
          <Box>
            <Typography fontWeight={800}>Less noise. More of what you love.</Typography>
            <Typography color="text.secondary">
              You&apos;ve already said goodbye to {unsubscribedCount} senders. That&apos;s a good kind of quiet.
            </Typography>
          </Box>
        </Stack>
        <Box sx={{ bgcolor: "#d3eadc", px: 4, py: 2, minWidth: 180, textAlign: "right" }}>
          <Typography variant="h4" sx={{ color: "primary.main", fontWeight: 800 }}>
            640 fewer
          </Typography>
          <Typography variant="body2" color="text.secondary">
            emails landing each month
          </Typography>
        </Box>
      </Paper>

      <Tabs
        value={tab}
        onChange={(_event, value: SenderStatus) => {
          setTab(value);
          setPage(0);
          setSelected([]);
        }}
        sx={{ mb: 2, minHeight: 36, "& .MuiTab-root": { minHeight: 36, fontWeight: 700 } }}
      >
        <Tab value="active" label={<TabLabel text="Active subscriptions" count={counts.active || 128} />} />
        <Tab value="unsubscribed" label={<TabLabel text="Unsubscribed" count={counts.unsubscribed || 86} muted />} />
        <Tab value="kept" label={<TabLabel text="Kept" count={counts.kept || 24} muted />} />
      </Tabs>

      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Find a sender"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(0);
          }}
          sx={{ flex: 1, bgcolor: "background.paper", "& fieldset": { borderRadius: 2 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlinedIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <Select
          size="small"
          value={category}
          onChange={(event) => {
            setCategory(String(event.target.value));
            setPage(0);
          }}
          sx={{ minWidth: 160, bgcolor: "background.paper", borderRadius: 999 }}
        >
          <MenuItem value="all">All categories</MenuItem>
          <MenuItem value="newsletter">Newsletters</MenuItem>
          <MenuItem value="promotion">Promotions</MenuItem>
          <MenuItem value="primary">Primary</MenuItem>
        </Select>
        <Button
          variant="outlined"
          startIcon={<SwapVertOutlinedIcon />}
          sx={{ borderRadius: 999, bgcolor: "background.paper" }}
        >
          Most frequent
        </Button>
      </Stack>

      {selectedCount > 0 && (
        <Paper elevation={0} sx={{ bgcolor: "#e4f3ea", px: 2, py: 1.25, mb: 1.5, display: "flex", alignItems: "center" }}>
          <Checkbox
            checked={visible.length > 0 && selectedVisible.length === visible.length}
            indeterminate={selectedVisible.length > 0 && selectedVisible.length < visible.length}
            onChange={togglePage}
          />
          <Typography fontWeight={700} sx={{ mr: 1 }}>
            {selectedCount} senders selected
          </Typography>
          <Typography color="text.secondary" sx={{ flex: 1 }}>
            {selectedVolume} fewer emails every month. Yes, please.
          </Typography>
          <Button onClick={() => setStatus(selected, "kept")}>Keep</Button>
          <Button
            variant="contained"
            disabled={unsubscribing}
            onClick={() => void unsubscribe(selected)}
            startIcon={<MailOutlineOutlinedIcon />}
          >
            Unsubscribe from {selectedCount}
          </Button>
        </Paper>
      )}

      <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
        {loading ? (
          <Stack alignItems="center" sx={{ py: 8 }}>
            <CircularProgress />
          </Stack>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={visible.length > 0 && selectedVisible.length === visible.length}
                    indeterminate={selectedVisible.length > 0 && selectedVisible.length < visible.length}
                    onChange={togglePage}
                  />
                </TableCell>
                <HeaderCell>Sender</HeaderCell>
                <HeaderCell align="right">Emails / month</HeaderCell>
                <HeaderCell>Read rate</HeaderCell>
                <HeaderCell>Last received</HeaderCell>
                <HeaderCell align="right">Your call</HeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visible.map((sender) => (
                <TableRow
                  key={sender.email}
                  hover
                  selected={selected.includes(sender.email)}
                  sx={{ "&.Mui-selected": { bgcolor: "#eef7f1" } }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selected.includes(sender.email)}
                      onChange={() => toggleOne(sender.email)}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={{ bgcolor: avatarColor(sender.email), width: 36, height: 36, fontSize: 14 }}>
                        {initials(sender.from)}
                      </Avatar>
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography fontWeight={700}>{sender.from}</Typography>
                          {sender.rarelyRead && (
                            <Chip
                              size="small"
                              label="Rarely read"
                              sx={{ bgcolor: "#f4ead8", color: "#8a6b3d", height: 22, fontWeight: 700 }}
                            />
                          )}
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {sender.email}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={700}>{sender.emailsPerMonth}</Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: sender.readRate === 0 ? "#e6a07a" : "#9ad0b0",
                        }}
                      />
                      <Typography>{Math.round(sender.readRate * 100)}%</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{formatLastReceived(sender.lastReceived)}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" onClick={() => setStatus([sender.email], "kept")}>
                        Keep
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={unsubscribing}
                        onClick={() => void unsubscribe([sender.email])}
                      >
                        Unsubscribe
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ px: 2, py: 1.5, borderTop: "1px solid", borderColor: "divider" }}
        >
          <Typography variant="body2" color="text.secondary">
            Showing {filtered.length === 0 ? 0 : currentPage * PAGE_SIZE + 1}–
            {Math.min((currentPage + 1) * PAGE_SIZE, filtered.length)} of {filtered.length || counts.active}{" "}
            subscriptions
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button size="small" disabled={currentPage === 0} onClick={() => setPage((value) => value - 1)}>
              ‹
            </Button>
            <Typography variant="body2">
              Page {currentPage + 1} of {pageCount}
            </Typography>
            <Button size="small" disabled={currentPage >= pageCount - 1} onClick={() => setPage((value) => value + 1)}>
              ›
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Unsubscribing stops future emails, not the ones you already have. Changes can take up to 48 hours.
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Your data stays private
        </Typography>
      </Stack>

      <Dialog open={howOpen} onClose={() => setHowOpen(false)}>
        <DialogTitle>How it works</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            We group mail by sender, estimate how often they write, and how often you read them. Keep the ones you
            want. Unsubscribe archives their current inbox mail and moves them off this list.
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

function TabLabel({ text, count, muted }: { text: string; count: number; muted?: boolean }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <span>{text}</span>
      <Box component="span" sx={{ color: muted ? "text.secondary" : "primary.main", fontWeight: 700 }}>
        {count}
      </Box>
    </Stack>
  );
}

function HeaderCell({
  children,
  align,
}: {
  children: string;
  align?: "right" | "left";
}) {
  return (
    <TableCell align={align} sx={{ color: "text.secondary", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em" }}>
      <Stack direction="row" spacing={0.5} alignItems="center" justifyContent={align === "right" ? "flex-end" : "flex-start"}>
        {children.toUpperCase()}
        <UnfoldMoreOutlinedIcon sx={{ fontSize: 14, opacity: 0.5 }} />
      </Stack>
    </TableCell>
  );
}
