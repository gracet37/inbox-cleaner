import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import { Box, Paper, Stack, Typography } from "@mui/material";

type QuietBannerProps = {
  unsubscribedCount: number;
};

export default function QuietBanner({ unsubscribedCount }: QuietBannerProps) {
  return (
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
  );
}
