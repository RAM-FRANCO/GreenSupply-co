/**
 * Recent activity timeline component.
 * Displays transfer events in a vertical timeline format.
 */
import { Box, Paper, Typography, Button, Skeleton } from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import EditNoteIcon from "@mui/icons-material/EditNote";
import PendingIcon from "@mui/icons-material/Pending";
import HistoryIcon from "@mui/icons-material/History";
import { formatRelativeTime } from "@/utils/formatters";
import type { ActivityEvent, ActivityEventType } from "@/types/transfers";

interface RecentActivityProps {
  readonly events: readonly ActivityEvent[];
  readonly loading?: boolean;
  readonly onViewAuditLog?: () => void;
  readonly hideHeader?: boolean;
  readonly maxHeight?: number | string;
}

const eventConfig: Record<
  ActivityEventType,
  { icon: React.ElementType; bgColor: string; iconColor: string }
> = {
  dispatched: {
    icon: LocalShippingIcon,
    bgColor: "rgba(59, 130, 246, 0.1)",
    iconColor: "#3B82F6",
  },
  completed: {
    icon: TaskAltIcon,
    bgColor: "rgba(34, 197, 94, 0.1)",
    iconColor: "#22C55E",
  },
  created: {
    icon: EditNoteIcon,
    bgColor: "rgba(245, 158, 11, 0.1)",
    iconColor: "#F59E0B",
  },
  pending: {
    icon: PendingIcon,
    bgColor: "rgba(245, 158, 11, 0.1)",
    iconColor: "#F59E0B",
  },
};

function ActivityItem({
  event,
  isLast,
}: {
  readonly event: ActivityEvent;
  readonly isLast: boolean;
}) {
  const config = eventConfig[event.type];
  const IconComponent = config.icon;

  return (
    <Box sx={{ display: "flex", gap: 2, position: "relative" }}>
      {/* Timeline connector line */}
      {!isLast && (
        <Box
          sx={{
            position: "absolute",
            left: 16,
            top: 32,
            bottom: 0,
            width: 2,
            backgroundColor: "grey.300",
            transform: "translateX(-50%)",
          }}
        />
      )}

      {/* Icon circle */}
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          backgroundColor: config.bgColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          zIndex: 1,
        }}
        role="img"
        aria-label={getEventTitle(event.type)}
      >
        <IconComponent sx={{ fontSize: 16, color: config.iconColor }} />
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, pb: 3 }}>
        <Typography variant="body2" fontWeight={500}>
          {getEventTitle(event.type)}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
          Transfer{" "}
          <Typography
            component="span"
            variant="caption"
            color="primary.main"
            fontWeight={500}
          >
            {event.referenceNumber}
          </Typography>{" "}
          {event.description}
        </Typography>
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ display: "block", mt: 1 }}
        >
          {formatRelativeTime(event.timestamp)}
        </Typography>
      </Box>
    </Box>
  );
}

function getEventTitle(type: ActivityEventType): string {
  const titles: Record<ActivityEventType, string> = {
    dispatched: "Shipment Dispatched",
    completed: "Transfer Completed",
    created: "New Draft Created",
    pending: "Awaiting Approval",
  };
  return titles[type];
}

function LoadingSkeleton() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <Box key={i} sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Skeleton variant="circular" width={32} height={32} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="60%" height={20} />
            <Skeleton width="80%" height={16} sx={{ mt: 0.5 }} />
            <Skeleton width="30%" height={14} sx={{ mt: 1 }} />
          </Box>
        </Box>
      ))}
    </>
  );
}

/**
 * Recent activity timeline panel
 */
export default function RecentActivity({
  events,
  loading = false,
  onViewAuditLog,
  hideHeader = false,
  maxHeight = 400, // Default max height
}: RecentActivityProps) {
  return (
    <Paper
      sx={{
        p: 3,
        height: "100%",
        borderRadius: 3,
        border: 1,
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
      }}
      elevation={0}
    >
      {!hideHeader && (
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
        >
          <HistoryIcon color="primary" fontSize="small" />
          Recent Activity
        </Typography>
      )}

      <Box
        sx={{
          flex: 1,
          maxHeight,
          overflowY: "auto",
          pr: 1,
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: (theme) => theme.palette.grey[300],
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: (theme) => theme.palette.grey[400],
          },
        }}
      >
        {loading && <LoadingSkeleton />}
        {!loading && events.length === 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ py: 4, textAlign: "center" }}
          >
            No recent activity
          </Typography>
        )}
        {!loading &&
          events.map((event, index) => (
            <ActivityItem
              key={event.id}
              event={event}
              isLast={index === events.length - 1}
            />
          ))}
      </Box>

      {onViewAuditLog && (
        <Button
          variant="outlined"
          fullWidth
          size="small"
          onClick={onViewAuditLog}
          sx={{
            mt: "auto",
            borderColor: "primary.light",
            color: "primary.main",
            "&:hover": {
              backgroundColor: "primary.light",
              borderColor: "primary.main",
            },
          }}
        >
          View Audit Log
        </Button>
      )}
    </Paper>
  );
}
