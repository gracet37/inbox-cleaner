import { CalendarMonthOutlined, ExpandMore, Search } from "@mui/icons-material";
import { Box, Button, Menu, MenuItem, Typography } from "@mui/material";
import { useState, type RefObject } from "react";

type FilterBarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  searchRef: RefObject<HTMLInputElement | null>;
  olderThanSixMonths: boolean;
  onToggleOlderThanSixMonths: () => void;
  sizeLabel: string;
  onSizeChange: (label: string) => void;
  rarelyReadOnly: boolean;
  onToggleRarelyReadOnly: () => void;
};

const sizeOptions = ["Any size", "Over 1 MB", "Over 5 MB"];

export default function FilterBar({
  query,
  onQueryChange,
  searchRef,
  olderThanSixMonths,
  onToggleOlderThanSixMonths,
  sizeLabel,
  onSizeChange,
  rarelyReadOnly,
  onToggleRarelyReadOnly,
}: FilterBarProps) {
  const [sizeAnchor, setSizeAnchor] = useState<HTMLElement | null>(null);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 1.5,
          alignItems: { md: "center" },
          justifyContent: "space-between",
        }}
      >
        <Box
          component="label"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            width: { xs: "100%", md: 296 },
            height: 42,
            px: "14px",
            borderRadius: "8px",
            border: "1px solid #e5ebe7",
            bgcolor: "#fff",
          }}
        >
          <Search sx={{ fontSize: 16, color: "#7a8983" }} />
          <Box
            component="input"
            ref={searchRef}
            value={query}
            placeholder="Find a sender"
            aria-label="Find a sender"
            onChange={(event) => onQueryChange(event.target.value)}
            sx={{
              border: 0,
              outline: 0,
              flex: 1,
              minWidth: 0,
              bgcolor: "transparent",
              font: "inherit",
              fontSize: 12,
              color: "#203b33",
              "&::placeholder": { color: "#7a8983", opacity: 1 },
            }}
          />
          <Typography sx={{ color: "#7a8983", fontSize: 11, flexShrink: 0 }}>⌘ K</Typography>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "row", gap: 1.25, flexWrap: "wrap" }}>
          <Button
            aria-pressed={olderThanSixMonths}
            onClick={onToggleOlderThanSixMonths}
            startIcon={<CalendarMonthOutlined sx={{ fontSize: 16 }} />}
            sx={olderThanSixMonths ? filledChipSx : outlineButtonSx}
          >
            Older than 6 months
          </Button>
          <Button
            aria-pressed={sizeLabel !== "Any size"}
            onClick={(event) => setSizeAnchor(event.currentTarget)}
            startIcon={<ExpandMore sx={{ fontSize: 16 }} />}
            sx={sizeLabel !== "Any size" ? filledChipSx : outlineButtonSx}
          >
            {sizeLabel}
          </Button>
          <Button
            aria-pressed={rarelyReadOnly}
            onClick={onToggleRarelyReadOnly}
            sx={rarelyReadOnly ? filledChipSx : outlineButtonSx}
          >
            Rarely read
          </Button>
        </Box>
      </Box>

      <Menu anchorEl={sizeAnchor} open={Boolean(sizeAnchor)} onClose={() => setSizeAnchor(null)}>
        {sizeOptions.map((label) => (
          <MenuItem
            key={label}
            selected={sizeLabel === label}
            onClick={() => {
              onSizeChange(label);
              setSizeAnchor(null);
            }}
          >
            {label}
          </MenuItem>
        ))}
      </Menu>
    </>
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

const filledChipSx = {
  ...outlineButtonSx,
  borderColor: "transparent",
  bgcolor: "#e5f3e9",
  "&:hover": { bgcolor: "#d7ebdf", borderColor: "transparent" },
};
