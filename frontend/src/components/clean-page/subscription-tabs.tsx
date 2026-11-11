import { Box, Stack, Tab, Tabs } from "@mui/material";
import type { SenderStatus } from "../../senders";

type SubscriptionCounts = {
  active: number;
  unsubscribed: number;
  kept: number;
};

type SubscriptionTabsProps = {
  tab: SenderStatus;
  counts: SubscriptionCounts;
  onChange: (tab: SenderStatus) => void;
};

export default function SubscriptionTabs({ tab, counts, onChange }: SubscriptionTabsProps) {
  return (
    <Tabs
      value={tab}
      onChange={(_event, value: SenderStatus) => onChange(value)}
      sx={{ mb: 2, minHeight: 36, "& .MuiTab-root": { minHeight: 36, fontWeight: 700 } }}
    >
      <Tab value="active" label={<TabLabel text="Active subscriptions" count={counts.active || 128} />} />
      <Tab value="unsubscribed" label={<TabLabel text="Unsubscribed" count={counts.unsubscribed || 86} muted />} />
      <Tab value="kept" label={<TabLabel text="Kept" count={counts.kept || 24} muted />} />
    </Tabs>
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
