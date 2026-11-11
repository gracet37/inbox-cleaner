import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import SwapVertOutlinedIcon from "@mui/icons-material/SwapVertOutlined";
import { Button, InputAdornment, MenuItem, Select, Stack, TextField } from "@mui/material";

type SenderFiltersProps = {
  query: string;
  category: string;
  onQueryChange: (query: string) => void;
  onCategoryChange: (category: string) => void;
};

export default function SenderFilters({ query, category, onQueryChange, onCategoryChange }: SenderFiltersProps) {
  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mb: 2 }}>
      <TextField
        size="small"
        placeholder="Find a sender"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        sx={{ flex: 1, bgcolor: "background.paper", "& fieldset": { borderRadius: 2 } }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchOutlinedIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />
      <Select
        size="small"
        value={category}
        onChange={(event) => onCategoryChange(String(event.target.value))}
        sx={{ minWidth: 160, bgcolor: "background.paper", borderRadius: 999 }}
      >
        <MenuItem value="all">All categories</MenuItem>
        <MenuItem value="newsletter">Newsletters</MenuItem>
        <MenuItem value="promotion">Promotions</MenuItem>
        <MenuItem value="primary">Primary</MenuItem>
      </Select>
      <Button
        variant="outlined"
        startIcon={<SwapVertOutlinedIcon />}
        sx={{ borderRadius: 999, bgcolor: "background.paper" }}
      >
        Most frequent
      </Button>
    </Stack>
  );
}
