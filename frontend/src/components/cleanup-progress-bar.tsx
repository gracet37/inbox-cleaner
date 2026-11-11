import { CheckCircleOutlined } from "@mui/icons-material";
import { Box, LinearProgress, Typography } from "@mui/material";

export type CleanupProgress = {
  status: "running" | "done";
  total: number;
  progress: number;
};

type CleanupProgressBarProps = {
  cleanup: CleanupProgress;
  kind?: "delete" | "unsubscribe";
};

export default function CleanupProgressBar({ cleanup, kind = "delete" }: CleanupProgressBarProps) {
  const done = cleanup.status === "done";
  const count = cleanup.total.toLocaleString();
  const label = cleanup.total === 1 ? copy[kind].singular : copy[kind].plural;

  return (
    <Box sx={{ bgcolor: "#fff", border: "1px solid #e5ebe7", borderRadius: "16px", px: "20px", py: "16px" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: "10px" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
          {done && <CheckCircleOutlined sx={{ fontSize: 18, color: "#247653" }} />}
          <Typography sx={{ color: "#203b33", fontSize: 14, fontWeight: 600 }}>
            {done ? "Done" : copy[kind].running(count, label)}
          </Typography>
        </Box>
        <Typography sx={{ color: done ? "#247653" : "#52665d", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
          {done ? copy[kind].doneCount(count) : `${Math.round(cleanup.progress)}%`}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={cleanup.progress}
        aria-label={done ? "Cleanup complete" : "Cleanup progress"}
        sx={{
          height: 6,
          borderRadius: 99,
          bgcolor: "#e5f3e9",
          "& .MuiLinearProgress-bar": { borderRadius: 99, bgcolor: "#247653" },
        }}
      />
      {done && (
        <Typography sx={{ color: "#52665d", fontSize: 12, mt: "10px" }}>{copy[kind].detail}</Typography>
      )}
    </Box>
  );
}

const copy = {
  delete: {
    singular: "email",
    plural: "emails",
    running: (count: string, label: string) => `Moving ${count} ${label} to Trash`,
    doneCount: (count: string) => `${count} moved`,
    detail: "Moved to Gmail Trash. You can restore them within 30 days.",
  },
  unsubscribe: {
    singular: "sender",
    plural: "senders",
    running: (count: string, label: string) => `Unsubscribing from ${count} ${label}`,
    doneCount: (count: string) => `${count} unsubscribed`,
    detail: "Future mail from these senders will stop. It can take up to 48 hours.",
  },
};
