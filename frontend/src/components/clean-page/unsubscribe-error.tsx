import { ErrorOutlineOutlined } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";
import type { UnsubscribeFailure } from "./use-clean-senders";

type UnsubscribeErrorProps = {
  failures: UnsubscribeFailure[];
  onDismiss: () => void;
};

export default function UnsubscribeError({ failures, onDismiss }: UnsubscribeErrorProps) {
  const requestFailed = failures.some((failure) => failure.reason === "request");
  const missingLink = failures.some((failure) => failure.reason === "unavailable");
  const summary = requestFailed && missingLink
    ? "Some senders stayed on your list. Retry the ones that didn't finish, and use another method for the ones without an unsubscribe link."
    : requestFailed
      ? "The request didn't finish. These senders are still on your list."
      : "These senders have no unsubscribe link in your mailbox, so they stayed on your list.";

  return (
    <Box
      role="alert"
      sx={{ mb: 2, bgcolor: "#fff", border: "1px solid #f0d2c4", borderRadius: "16px", px: "20px", py: "16px" }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
        <Box sx={{ display: "flex", gap: "10px", minWidth: 0 }}>
          <ErrorOutlineOutlined sx={{ fontSize: 18, color: "#a15b3c", mt: "1px" }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ color: "#203b33", fontSize: 14, fontWeight: 600 }}>Couldn't unsubscribe</Typography>
            <Typography sx={{ color: "#52665d", fontSize: 12, mt: "4px" }}>{summary}</Typography>
            <Box component="ul" sx={{ m: 0, mt: "10px", pl: "18px" }}>
              {failures.map((failure) => (
                <Box component="li" key={failure.email} sx={{ color: "#203b33" }}>
                  <Typography sx={{ color: "#203b33", fontSize: 13, lineHeight: 1.6 }}>
                    {failure.from}
                    <Box component="span" sx={{ color: "#7a8983" }}>
                      {" "}
                      · {failure.email}
                    </Box>
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
        <Button
          onClick={onDismiss}
          sx={{
            flexShrink: 0,
            height: 32,
            px: "12px",
            borderRadius: "8px",
            border: "1px solid #e5ebe7",
            color: "#203b33",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Dismiss
        </Button>
      </Box>
    </Box>
  );
}
