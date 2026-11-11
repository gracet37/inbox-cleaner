import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import UnsubscribeOutlinedIcon from "@mui/icons-material/UnsubscribeOutlined";
import { useQuery } from "@apollo/client/react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  LinearProgress,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { gmailConnectUrl } from "../config";
import { AUTH_QUERY, INBOX_QUERY } from "../graphql";
import type { InboxStats, Message } from "../types";

type AuthQueryData = {
  auth: { connected: boolean; email: string | null };
};

type InboxQueryData = {
  inbox: { messages: Message[]; stats: InboxStats };
};

const nav = [
  { to: "/", label: "Overview", icon: <SpaceDashboardOutlinedIcon fontSize="small" />, end: true },
  { to: "/delete", label: "Inbox cleanup", icon: <InboxOutlinedIcon fontSize="small" />, countKey: "inbox" as const },
  { to: "/unsubscribe", label: "Unsubscribe", icon: <UnsubscribeOutlinedIcon fontSize="small" />, countKey: "clean" as const },
];

export default function AppLayout() {
  const location = useLocation();
  const { data: authData, refetch: refetchAuth } = useQuery<AuthQueryData>(AUTH_QUERY);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.get("gmail")) return;
    void refetchAuth();
    window.history.replaceState({}, "", window.location.pathname);
  }, [refetchAuth]);
  const connected = authData?.auth.connected ?? false;
  const { data } = useQuery<InboxQueryData>(INBOX_QUERY, { skip: !connected });
  const inboxCount = data?.inbox.stats.total ?? 0;
  const senderCount = new Set((data?.inbox.messages ?? []).map((message) => message.email)).size;

  const crumb =
    location.pathname === "/clean"
      ? "Unsubscribe"
      : location.pathname === "/inbox"
        ? "Inbox cleanup"
        : "Overview";

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Box
        component="aside"
        sx={{
          width: 248,
          flexShrink: 0,
          bgcolor: "background.paper",
          borderRight: "1px solid",
          borderColor: "divider",
          display: "flex",
          flexDirection: "column",
          px: 2,
          py: 2.5,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 1, mb: 3 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              bgcolor: "primary.main",
              color: "white",
              display: "grid",
              placeItems: "center",
              fontSize: 16,
            }}
          >
            ⌘
          </Box>
          <Typography variant="h6" sx={{ color: "primary.main", letterSpacing: "-0.04em" }}>
            spruce
          </Typography>
        </Stack>

        <Typography variant="caption" sx={{ px: 1.5, mb: 1, color: "text.secondary", letterSpacing: "0.08em" }}>
          YOUR WORKSPACE
        </Typography>
        <List disablePadding sx={{ flex: 1 }}>
          {nav.map((item) => (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              end={item.end}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                "&.active": { bgcolor: "#e7f3ec", color: "primary.main" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
              {item.countKey === "inbox" && inboxCount > 0 && (
                <Typography variant="caption" color="text.secondary">
                  {inboxCount.toLocaleString()}
                </Typography>
              )}
              {item.countKey === "clean" && (
                <Typography variant="caption" color="text.secondary">
                  {senderCount || 128}
                </Typography>
              )}
            </ListItemButton>
          ))}
        </List>

        <Box sx={{ bgcolor: "#eef6f1", borderRadius: 3, p: 2, mb: 2 }}>
          <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
            A little more room
          </Typography>
          <LinearProgress variant="determinate" value={61} sx={{ height: 6, borderRadius: 99, mb: 1 }} />
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              9.2 GB of 15 GB used
            </Typography>
            <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 700 }}>
              1.8 GB freed. Nice work!
            </Typography>
          </Stack>
        </Box>

        <ListItemButton sx={{ borderRadius: 2 }}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            <SettingsOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItemButton>
        <ListItemButton sx={{ borderRadius: 2, mb: 2 }}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            <HelpOutlineOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="A little help?" />
        </ListItemButton>

        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ px: 1 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: "#ece6f8", color: "primary.main", fontSize: 13 }}>
            JL
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={700}>
              Jamie Lee
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Personal workspace
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 4, py: 1.5, borderBottom: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 0 }}>
            My workspace <Box component="span" sx={{ mx: 1 }}>›</Box>
            <Box component="span" sx={{ color: "text.primary", fontWeight: 700 }}>
              {crumb}
            </Box>
          </Typography>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexShrink: 0 }}>
            {connected ? (
              <Chip size="small" color="success" variant="outlined" label={authData?.auth.email} />
            ) : (
              <Button size="small" href={gmailConnectUrl}>
                Connect Gmail
              </Button>
            )}
            <NotificationsNoneOutlinedIcon fontSize="small" color="action" />
          </Stack>
        </Stack>
        <Box sx={{ flex: 1, px: 4, py: 3, overflow: "auto" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
