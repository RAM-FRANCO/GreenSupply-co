/**
 * Unified stat card component for dashboard and stock pages.
 * Displays a metric with an icon, value, and optional trend indicator.
 */
import {
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  useTheme,
} from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";

interface StatCardProps {
  /** Card title/label */
  readonly title: string;
  /** Displayed value (number or formatted string) */
  readonly value: string | number;
  /** MUI icon component */
  readonly Icon: SvgIconComponent;
  /** Icon color */
  readonly iconColor: string;
  /** Icon background color (light mode) */
  readonly iconBgColor: string;
  /** Icon background color for dark mode (optional) */
  readonly darkIconBgColor?: string;
  /** Trend indicator text (e.g., "+5%") */
  readonly trend?: string;
  /** Trend text color (defaults to success.main for positive) */
  readonly trendColor?: string;
}

/**
 * Reusable stat card with consistent styling across pages.
 */
export default function StatCard({
  title,
  value,
  Icon,
  iconColor,
  iconBgColor,
  darkIconBgColor,
  trend,
  trendColor = "success.main",
}: StatCardProps) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Avatar
            sx={{
              bgcolor:
                isDarkMode && darkIconBgColor ? darkIconBgColor : iconBgColor,
              color: iconColor,
              width: 48,
              height: 48,
              mr: 2,
            }}
          >
            <Icon />
          </Avatar>
          <Box>
            <Typography variant="body2" color="text.secondary" noWrap>
              {title}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "baseline" }}>
              <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
                {value}
              </Typography>
              {trend && (
                <Typography
                  variant="caption"
                  sx={{ ml: 1, color: trendColor, fontWeight: 600 }}
                >
                  {trend}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
