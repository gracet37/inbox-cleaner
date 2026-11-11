import { Check, Circle, KeyboardArrowLeft, KeyboardArrowRight, Remove, Sort } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";
import { type ReactNode } from "react";
import { formatLastReceived, type SenderRow } from "../../senders";

type EmailActionContainerProps = {
  title: string;
  emailCount: number;
  newestFirst: boolean;
  onToggleSort: () => void;
  senders: SenderRow[];
  selected: string[];
  onToggleSender: (email: string) => void;
  onToggleVisible: () => void;
  allVisibleSelected: boolean;
  someVisibleSelected: boolean;
  selectedCount: number;
  selectedEmailCount: number;
  selectedSenderEmails: string[];
  onDelete: (emails: string[]) => void;
  deleting: boolean;
  rangeStart: number;
  rangeEnd: number;
  totalSenders: number;
  currentPage: number;
  pageCount: number;
  displayPageCount: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
};

const logoBackground: Record<string, string> = {
  "hello@everlane.com": "#fbebdc",
  "email@westelm.com": "#eeeafb",
  "hello@classpass.com": "#eeeafb",
  "hello@allbirds.com": "#e5f3e9",
  "hello@headspace.com": "#fbebdc",
  "hello@thesill.com": "#e5f3e9",
};

export default function EmailActionContainer({
  title,
  emailCount,
  newestFirst,
  onToggleSort,
  senders,
  selected,
  onToggleSender,
  onToggleVisible,
  allVisibleSelected,
  someVisibleSelected,
  selectedCount,
  selectedEmailCount,
  selectedSenderEmails,
  onDelete,
  deleting,
  rangeStart,
  rangeEnd,
  totalSenders,
  currentPage,
  pageCount,
  displayPageCount,
  onPreviousPage,
  onNextPage,
}: EmailActionContainerProps) {
  return (
    <Box
      sx={{
        gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 292px" },
      }}
    >
      <Box sx={{ bgcolor: "#fff", border: "1px solid #e5ebe7", borderRadius: "16px", minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: "20px", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
            <Typography sx={{ color: "#203b33", fontSize: 16, fontWeight: 600 }}>{title}</Typography>
            <Box sx={{ bgcolor: "#f0f4f1", borderRadius: 999, px: "9px", py: "4px" }}>
              <Typography sx={{ color: "#52665d", fontSize: 11, fontWeight: 500, whiteSpace: "nowrap" }}>
                {emailCount.toLocaleString()} emails
              </Typography>
            </Box>
          </Box>
          <Button
            onClick={onToggleSort}
            endIcon={<Sort sx={{ fontSize: 14, color: "#52665d" }} />}
            sx={{ color: "#52665d", fontSize: 11, fontWeight: 400, minWidth: 0, px: 0 }}
          >
            {newestFirst ? "Newest first" : "Oldest first"}
          </Button>
        </Box>

        <Box sx={{ border: "1px solid #e5ebe7", borderRadius: "16px", overflow: "hidden" }}>
          {selectedCount > 0 && (
            <Box
              sx={{
                bgcolor: "#e5f3e9",
                minHeight: 62,
                px: "20px",
                py: 1.5,
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "flex-start", sm: "center" },
                gap: "12px",
              }}
            >
              <SelectBox
                checked={allVisibleSelected}
                indeterminate={someVisibleSelected}
                label={allVisibleSelected ? "Clear selected senders" : "Select visible senders"}
                onClick={onToggleVisible}
              />
              <Typography sx={{ color: "#203b33", fontSize: 12, fontWeight: 600 }}>
                {selectedCount} senders selected
              </Typography>
              <Typography sx={{ color: "#52665d", fontSize: 12, flex: 1 }}>
                {selectedEmailCount.toLocaleString()} emails selected
              </Typography>
              <Button disabled={deleting} onClick={() => onDelete(selectedSenderEmails)} sx={primaryButtonSx}>
                Delete {selectedEmailCount.toLocaleString()} emails
              </Button>
            </Box>
          )}

          <Box sx={{ overflowX: "auto" }}>
            <Box sx={{ minWidth: 720 }}>
              <Box sx={{ ...tableColumnsSx, height: 46, bgcolor: "#f7f9f8" }}>
                <Box />
                <Typography sx={columnSx}>SENDER</Typography>
                <Typography sx={columnSx}>EMAILS</Typography>
                <Typography sx={columnSx}>READ RATE</Typography>
                <Typography sx={columnSx}>LAST RECEIVED</Typography>
                <Typography sx={{ ...columnSx, textAlign: "right" }}>ACTION</Typography>
              </Box>

              {senders.length === 0 ? (
                <Typography sx={{ color: "#7a8983", fontSize: 13, px: "20px", py: 4 }}>
                  No senders match these filters.
                </Typography>
              ) : (
                senders.map((sender) => {
                  const isSelected = selected.includes(sender.email);
                  return (
                    <Box
                      key={sender.email}
                      sx={{
                        ...tableColumnsSx,
                        height: 76,
                        bgcolor: isSelected ? "#fafdfb" : "#fff",
                        borderBottom: "1px solid #e5ebe7",
                      }}
                    >
                      <SelectBox
                        checked={isSelected}
                        label={`Select ${sender.from}`}
                        onClick={() => onToggleSender(sender.email)}
                      />
                      <Box sx={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: "10px",
                            bgcolor: logoBackground[sender.email] ?? "#e5f3e9",
                            display: "grid",
                            placeItems: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Typography sx={{ color: "#203b33", fontSize: 16, fontWeight: 700, lineHeight: 1 }}>
                            {senderMark(sender.from)}
                          </Typography>
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Typography sx={{ color: "#203b33", fontSize: 13, fontWeight: 600, lineHeight: 1.45 }}>
                              {sender.from}
                            </Typography>
                            {sender.readRate === 0 && (
                              <Box sx={{ bgcolor: "#fbebdc", borderRadius: 999, px: "9px", py: "4px" }}>
                                <Typography
                                  sx={{ color: "#52665d", fontSize: 11, fontWeight: 500, lineHeight: 1.45, whiteSpace: "nowrap" }}
                                >
                                  Rarely read
                                </Typography>
                              </Box>
                            )}
                          </Box>
                          <Typography sx={{ color: "#7a8983", fontSize: 10, lineHeight: 1.45, mt: "4px" }}>
                            {sender.email}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography sx={{ color: "#203b33", fontSize: 13, fontWeight: 500, lineHeight: 1.2 }}>
                        {sender.emailsPerMonth}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Circle sx={{ fontSize: 8, color: sender.readRate === 0 ? "#d5a578" : "#8cbd9d" }} />
                        <Typography sx={{ color: "#52665d", fontSize: 12, lineHeight: 1.45 }}>
                          {Math.round(sender.readRate * 100)}%
                        </Typography>
                      </Box>
                      <Typography sx={{ color: "#52665d", fontSize: 12, lineHeight: 1.2 }}>
                        {formatLastReceived(sender.lastReceived)}
                      </Typography>
                      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button disabled={deleting} onClick={() => onDelete([sender.email])} sx={outlineButtonSx}>
                          Delete
                        </Button>
                      </Box>
                    </Box>
                  );
                })
              )}

              <Box
                sx={{
                  height: 58,
                  px: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography sx={{ color: "#7a8983", fontSize: 11, lineHeight: 1.45 }}>
                  {`Showing ${rangeStart}–${rangeEnd} of ${totalSenders} senders`}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <PageButton label="Previous page" disabled={currentPage === 0} onClick={onPreviousPage}>
                    <KeyboardArrowLeft sx={{ fontSize: 18, color: "#7a8983" }} />
                  </PageButton>
                  <Typography sx={{ color: "#203b33", fontSize: 11, fontWeight: 600, lineHeight: 1.45 }}>
                    {`Page ${currentPage + 1} of ${displayPageCount}`}
                  </Typography>
                  <PageButton label="Next page" disabled={currentPage >= pageCount - 1} onClick={onNextPage}>
                    <KeyboardArrowRight sx={{ fontSize: 18, color: "#52665d" }} />
                  </PageButton>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function senderMark(from: string) {
  const parts = from
    .trim()
    .split(/\s+/)
    .filter((part) => part.toLowerCase() !== "the");
  if (parts.length >= 2) return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toLowerCase();
  return (parts[0]?.[0] ?? "").toLowerCase();
}

function SelectBox({
  checked,
  indeterminate = false,
  label,
  onClick,
}: {
  checked: boolean;
  indeterminate?: boolean;
  label: string;
  onClick: () => void;
}) {
  const filled = checked || indeterminate;
  return (
    <Box
      component="button"
      type="button"
      aria-label={label}
      aria-pressed={checked}
      onClick={onClick}
      sx={{
        width: 18,
        height: 18,
        p: 0,
        borderRadius: "4px",
        border: "1px solid",
        borderColor: filled ? "#247653" : "#c9d4cd",
        bgcolor: filled ? "#247653" : "#fff",
        display: "grid",
        placeItems: "center",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      {indeterminate ? (
        <Remove sx={{ fontSize: 14, color: "#fff" }} />
      ) : checked ? (
        <Check sx={{ fontSize: 14, color: "#fff" }} />
      ) : null}
    </Box>
  );
}

function PageButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Box
      component="button"
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      sx={{
        p: 0,
        border: 0,
        bgcolor: "transparent",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.35 : 1,
        display: "grid",
        placeItems: "center",
      }}
    >
      {children}
    </Box>
  );
}

const outlineButtonSx = {
  height: 40,
  px: "16px",
  borderRadius: "8px",
  border: "1px solid #e5ebe7",
  bgcolor: "#fff",
  color: "#203b33",
  fontSize: 13,
  fontWeight: 600,
  whiteSpace: "nowrap",
  "&:hover": { bgcolor: "#f7f9f8", borderColor: "#e5ebe7" },
};

const primaryButtonSx = {
  height: 40,
  px: "16px",
  borderRadius: "8px",
  bgcolor: "#247653",
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  whiteSpace: "nowrap",
  "&:hover": { bgcolor: "#1d6044" },
  "&.Mui-disabled": { bgcolor: "#9bb8ac", color: "#fff" },
};

const tableColumnsSx = {
  display: "grid",
  gridTemplateColumns: "18px minmax(0, 1fr) 110px 92px 102px 88px",
  columnGap: "14px",
  alignItems: "center",
  px: "20px",
};

const columnSx = {
  color: "#7a8983",
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.04em",
  lineHeight: 1.2,
};
