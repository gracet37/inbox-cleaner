import UnfoldMoreOutlinedIcon from "@mui/icons-material/UnfoldMoreOutlined";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { avatarColor, formatLastReceived, initials, type SenderRow } from "../../senders";

type SenderTableProps = {
  loading: boolean;
  senders: SenderRow[];
  selected: string[];
  unsubscribing: boolean;
  failedEmails: string[];
  onToggleSender: (email: string) => void;
  onTogglePage: () => void;
  onKeep: (emails: string[]) => void;
  onUnsubscribe: (emails: string[]) => void;
  allVisibleSelected: boolean;
  someVisibleSelected: boolean;
  rangeStart: number;
  rangeEnd: number;
  subscriptionTotal: number;
  currentPage: number;
  pageCount: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
};

export default function SenderTable({
  loading,
  senders,
  selected,
  unsubscribing,
  failedEmails,
  onToggleSender,
  onTogglePage,
  onKeep,
  onUnsubscribe,
  allVisibleSelected,
  someVisibleSelected,
  rangeStart,
  rangeEnd,
  subscriptionTotal,
  currentPage,
  pageCount,
  onPreviousPage,
  onNextPage,
}: SenderTableProps) {
  return (
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
                <Checkbox checked={allVisibleSelected} indeterminate={someVisibleSelected} onChange={onTogglePage} />
              </TableCell>
              <HeaderCell>Sender</HeaderCell>
              <HeaderCell align="right">Emails / month</HeaderCell>
              <HeaderCell>Read rate</HeaderCell>
              <HeaderCell>Last received</HeaderCell>
              <HeaderCell align="right">Your call</HeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {senders.map((sender) => (
              <SenderSubscriptionRow
                key={sender.email}
                sender={sender}
                selected={selected.includes(sender.email)}
                unsubscribing={unsubscribing}
                failed={failedEmails.includes(sender.email)}
                onToggle={() => onToggleSender(sender.email)}
                onKeep={() => onKeep([sender.email])}
                onUnsubscribe={() => void onUnsubscribe([sender.email])}
              />
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
          Showing {rangeStart}–{rangeEnd} of {subscriptionTotal} subscriptions
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button size="small" disabled={currentPage === 0} onClick={onPreviousPage}>
            ‹
          </Button>
          <Typography variant="body2">
            Page {currentPage + 1} of {pageCount}
          </Typography>
          <Button size="small" disabled={currentPage >= pageCount - 1} onClick={onNextPage}>
            ›
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

function SenderSubscriptionRow({
  sender,
  selected,
  unsubscribing,
  failed,
  onToggle,
  onKeep,
  onUnsubscribe,
}: {
  sender: SenderRow;
  selected: boolean;
  unsubscribing: boolean;
  failed: boolean;
  onToggle: () => void;
  onKeep: () => void;
  onUnsubscribe: () => void;
}) {
  return (
    <TableRow hover selected={selected} sx={{ "&.Mui-selected": { bgcolor: "#eef7f1" } }}>
      <TableCell padding="checkbox">
        <Checkbox checked={selected} onChange={onToggle} />
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
            {failed && (
              <Typography sx={{ color: "#a15b3c", fontSize: 12, fontWeight: 600, mt: 0.25 }}>
                Couldn't unsubscribe
              </Typography>
            )}
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
          <Button size="small" onClick={onKeep}>
            Keep
          </Button>
          <Button size="small" variant="outlined" disabled={unsubscribing} onClick={onUnsubscribe}>
            Unsubscribe
          </Button>
        </Stack>
      </TableCell>
    </TableRow>
  );
}

function HeaderCell({ children, align }: { children: string; align?: "right" | "left" }) {
  return (
    <TableCell align={align} sx={{ color: "text.secondary", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em" }}>
      <Stack direction="row" spacing={0.5} alignItems="center" justifyContent={align === "right" ? "flex-end" : "flex-start"}>
        {children.toUpperCase()}
        <UnfoldMoreOutlinedIcon sx={{ fontSize: 14, opacity: 0.5 }} />
      </Stack>
    </TableCell>
  );
}
