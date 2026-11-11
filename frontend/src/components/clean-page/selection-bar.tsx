import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import { Button, Checkbox, Paper, Typography } from "@mui/material";

type SelectionBarProps = {
  selectedCount: number;
  selectedVolume: number;
  allVisibleSelected: boolean;
  someVisibleSelected: boolean;
  unsubscribing: boolean;
  onTogglePage: () => void;
  onKeep: () => void;
  onUnsubscribe: () => void;
};

export default function SelectionBar({
  selectedCount,
  selectedVolume,
  allVisibleSelected,
  someVisibleSelected,
  unsubscribing,
  onTogglePage,
  onKeep,
  onUnsubscribe,
}: SelectionBarProps) {
  return (
    <Paper elevation={0} sx={{ bgcolor: "#e4f3ea", px: 2, py: 1.25, mb: 1.5, display: "flex", alignItems: "center" }}>
      <Checkbox checked={allVisibleSelected} indeterminate={someVisibleSelected} onChange={onTogglePage} />
      <Typography fontWeight={700} sx={{ mr: 1 }}>
        {selectedCount} senders selected
      </Typography>
      <Typography color="text.secondary" sx={{ flex: 1 }}>
        {selectedVolume} fewer emails every month. Yes, please.
      </Typography>
      <Button onClick={onKeep}>Keep</Button>
      <Button
        variant="contained"
        disabled={unsubscribing}
        onClick={onUnsubscribe}
        startIcon={<MailOutlineOutlinedIcon />}
      >
        Unsubscribe from {selectedCount}
      </Button>
    </Paper>
  );
}
