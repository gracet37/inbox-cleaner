import { CheckCircleOutlined } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";

export type CategoryKey = "all" | "promotion" | "newsletter" | "large";

export type InboxCategory = {
  key: CategoryKey;
  label: string;
  icon: ReactNode;
  color: string;
  symbolBg: string;
};

type CategoryCardsProps = {
  categories: InboxCategory[];
  selected: CategoryKey;
  counts: Record<CategoryKey, number>;
  onSelect: (key: CategoryKey) => void;
};

export default function CategoryCards({ categories, selected, counts, onSelect }: CategoryCardsProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, minmax(0, 1fr))" },
      }}
    >
      {categories.map((item) => {
        const active = selected === item.key;
        return (
          <Box
            key={item.key}
            component="button"
            type="button"
            onClick={() => onSelect(item.key)}
            aria-pressed={active}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              textAlign: "left",
              p: "20px",
              borderRadius: "16px",
              border: "1px solid",
              borderColor: active ? "#247653" : "#e5ebe7",
              bgcolor: active ? "#e5f3e9" : "#fff",
              cursor: "pointer",
              font: "inherit",
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "10px",
                bgcolor: active ? "#fff" : item.symbolBg,
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <Box sx={{ color: item.color, display: "grid" }}>{item.icon}</Box>
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ color: "#52665d", fontSize: 12, lineHeight: 1.45 }}>{item.label}</Typography>
              <Typography sx={{ color: "#203b33", fontSize: 22, fontWeight: 600, lineHeight: 1.45 }}>
                {counts[item.key].toLocaleString()}
              </Typography>
            </Box>
            {active && (
              <Box sx={{ ml: "auto" }}>
                <CheckCircleOutlined sx={{ fontSize: 16, color: "#247653" }} />
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
