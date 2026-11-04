import { Button, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function HomePage() {
  return (
    <Stack spacing={3} maxWidth={720}>
      <Typography variant="h3">A quieter inbox starts here.</Typography>
      <Typography color="text.secondary" sx={{ fontSize: 18 }}>
        Review senders you never open, then unsubscribe in one pass.
      </Typography>
      <Paper elevation={0} sx={{ p: 3, bgcolor: "#e7f3ec" }}>
        <Typography fontWeight={700} gutterBottom>
          Start with subscriptions
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Open Unsubscribe to see who is filling your inbox and make the call to keep or let go.
        </Typography>
        <Button component={RouterLink} to="/clean" variant="contained">
          Go to Unsubscribe
        </Button>
      </Paper>
    </Stack>
  );
}
