import { Box, Button, Dialog, DialogContent, DialogTitle, Stack, Typography } from "@mui/material";
import { useState } from "react";
import CleanupProgressBar from "../components/cleanup-progress-bar";
import QuietBanner from "../components/clean-page/quiet-banner";
import SelectionBar from "../components/clean-page/selection-bar";
import SenderFilters from "../components/clean-page/sender-filters";
import SenderTable from "../components/clean-page/sender-table";
import UnsubscribeError from "../components/clean-page/unsubscribe-error";
import SubscriptionTabs from "../components/clean-page/subscription-tabs";
import { useCleanSenders } from "../components/clean-page/use-clean-senders";

export default function UnsubscribePage() {
  const [howOpen, setHowOpen] = useState(false);
  const clean = useCleanSenders();

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

      <QuietBanner unsubscribedCount={clean.unsubscribedCount} />
      <SubscriptionTabs tab={clean.tab} counts={clean.counts} onChange={clean.handleTabChange} />
      <SenderFilters
        query={clean.query}
        category={clean.category}
        onQueryChange={clean.handleQueryChange}
        onCategoryChange={clean.handleCategoryChange}
      />
      {clean.cleanup && (
        <Box sx={{ mb: 2 }}>
          <CleanupProgressBar cleanup={clean.cleanup} kind="unsubscribe" />
        </Box>
      )}
      {clean.failedUnsubscribes.length > 0 && (
        <UnsubscribeError failures={clean.failedUnsubscribes} onDismiss={clean.dismissUnsubscribeErrors} />
      )}
      {clean.selectedCount > 0 && (
        <SelectionBar
          selectedCount={clean.selectedCount}
          selectedVolume={clean.selectedVolume}
          allVisibleSelected={clean.allVisibleSelected}
          someVisibleSelected={clean.someVisibleSelected}
          unsubscribing={clean.unsubscribing}
          onTogglePage={clean.togglePage}
          onKeep={clean.keepSelected}
          onUnsubscribe={clean.unsubscribeSelected}
        />
      )}
      <SenderTable
        loading={clean.loading}
        senders={clean.visible}
        selected={clean.selected}
        unsubscribing={clean.unsubscribing}
        failedEmails={clean.failedUnsubscribes.map((failure) => failure.email)}
        onToggleSender={clean.toggleOne}
        onTogglePage={clean.togglePage}
        onKeep={clean.keep}
        onUnsubscribe={clean.unsubscribe}
        allVisibleSelected={clean.allVisibleSelected}
        someVisibleSelected={clean.someVisibleSelected}
        rangeStart={clean.rangeStart}
        rangeEnd={clean.rangeEnd}
        subscriptionTotal={clean.subscriptionTotal}
        currentPage={clean.currentPage}
        pageCount={clean.pageCount}
        onPreviousPage={clean.goToPreviousPage}
        onNextPage={clean.goToNextPage}
      />

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
