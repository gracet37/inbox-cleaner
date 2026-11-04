import AutoDeleteOutlinedIcon from "@mui/icons-material/AutoDeleteOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import MarkEmailUnreadOutlinedIcon from "@mui/icons-material/MarkEmailUnreadOutlined";
import NewspaperOutlinedIcon from "@mui/icons-material/NewspaperOutlined";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useMemo, useState, type ReactNode } from "react";
import { gmailConnectUrl } from "../config";
import { AUTH_QUERY, CLEAN_MESSAGES_MUTATION, INBOX_QUERY } from "../graphql";
import type { InboxStats, Message, MessageCategory } from "../types";

const emptyStats: InboxStats = { total: 0, unread: 0, newsletters: 0, promotions: 0 };

const categoryColor: Record<MessageCategory, "default" | "success" | "warning" | "info"> = {
  primary: "success",
  newsletter: "info",
  promotion: "warning",
  social: "default",
};

type AuthQueryData = { auth: { connected: boolean; email: string | null } };
type InboxQueryData = { inbox: { messages: Message[]; stats: InboxStats } };
type CleanMessagesData = { cleanMessages: { removed: number; inbox: InboxQueryData["inbox"] } };

function formatReceivedAt(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function InboxPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const { data: authData, loading: authLoading } = useQuery<AuthQueryData>(AUTH_QUERY);
  const connected = authData?.auth.connected ?? false;
  const { data, loading: inboxLoading, error } = useQuery<InboxQueryData>(INBOX_QUERY, { skip: !connected });
  const [cleanMessages, { loading: cleaning, error: cleanError }] = useMutation<
    CleanMessagesData,
    { ids: string[] }
  >(CLEAN_MESSAGES_MUTATION);

  const messages = data?.inbox.messages ?? [];
  const stats = data?.inbox.stats ?? emptyStats;
  const loading = authLoading || (connected && inboxLoading);
  const allSelected = messages.length > 0 && selected.length === messages.length;
  const displayError = error?.message ?? cleanError?.message ?? null;

  const selectedCountLabel = useMemo(() => {
    if (selected.length === 0) return "Select messages to clean";
    return `${selected.length} selected`;
  }, [selected.length]);

  function toggleAll() {
    setSelected(allSelected ? [] : messages.map((message) => message.id));
  }

  function toggleOne(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  async function handleClean() {
    if (selected.length === 0) return;
    await cleanMessages({
      variables: { ids: selected },
      update(cache, result) {
        const inbox = result.data?.cleanMessages.inbox;
        if (!inbox) return;
        cache.writeQuery({ query: INBOX_QUERY, data: { inbox } });
      },
    });
    setSelected([]);
  }

  if (!connected && !authLoading) {
    return (
      <Paper elevation={0} sx={{ p: 6, textAlign: "center", border: "1px dashed", borderColor: "divider" }}>
        <Typography variant="h6" gutterBottom>
          Connect a Gmail inbox
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Sign in with Google to review and archive mail.
        </Typography>
        <Button variant="contained" href={gmailConnectUrl}>
          Connect Gmail
        </Button>
      </Paper>
    );
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Inbox cleanup
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
        <StatCard icon={<MarkEmailUnreadOutlinedIcon />} label="Unread" value={stats.unread} />
        <StatCard icon={<NewspaperOutlinedIcon />} label="Newsletters" value={stats.newsletters} />
        <StatCard icon={<LocalOfferOutlinedIcon />} label="Promotions" value={stats.promotions} />
      </Stack>
      <Paper elevation={0} sx={{ p: 2, mb: 2, border: "1px solid", borderColor: "divider" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center">
            <Checkbox
              checked={allSelected}
              indeterminate={selected.length > 0 && !allSelected}
              onChange={toggleAll}
              disabled={messages.length === 0}
            />
            <Typography>{selectedCountLabel}</Typography>
          </Stack>
          <Button
            variant="contained"
            startIcon={<AutoDeleteOutlinedIcon />}
            disabled={selected.length === 0 || cleaning}
            onClick={() => void handleClean()}
          >
            {cleaning ? "Cleaning…" : "Archive selected"}
          </Button>
        </Stack>
      </Paper>
      {displayError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {displayError}
        </Alert>
      )}
      {loading ? (
        <Stack alignItems="center" sx={{ py: 8 }}>
          <CircularProgress />
        </Stack>
      ) : messages.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: "center", border: "1px dashed", borderColor: "divider" }}>
          <Typography variant="h6">Inbox is clear</Typography>
        </Paper>
      ) : (
        <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
          <List disablePadding>
            {messages.map((message, index) => (
              <ListItem
                key={message.id}
                disablePadding
                divider={index < messages.length - 1}
                secondaryAction={
                  <Typography variant="caption" color="text.secondary">
                    {formatReceivedAt(message.receivedAt)}
                  </Typography>
                }
              >
                <ListItemButton onClick={() => toggleOne(message.id)}>
                  <ListItemIcon>
                    <Checkbox edge="start" checked={selected.includes(message.id)} tabIndex={-1} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography fontWeight={message.unread ? 700 : 500}>{message.from}</Typography>
                        <Chip size="small" label={message.category} color={categoryColor[message.category]} />
                      </Stack>
                    }
                    secondary={`${message.subject} — ${message.snippet}`}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </>
  );
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <Paper elevation={0} sx={{ flex: 1, p: 2, border: "1px solid", borderColor: "divider" }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        {icon}
        <Box>
          <Typography variant="h5">{value}</Typography>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}
