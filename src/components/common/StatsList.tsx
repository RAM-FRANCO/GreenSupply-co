import Grid from "@mui/material/Grid2";
import StatCard from "@/components/common/StatCard";
import type { SvgIconComponent } from "@mui/icons-material";

export interface StatItem {
  title: string;
  value: string | number;
  Icon: SvgIconComponent;
  iconColor: string;
  iconBgColor: string;
  darkIconBgColor?: string;
  trend?: string;
  trendColor?: string;
}

interface StatsListProps {
  readonly stats: StatItem[];
}

export default function StatsList({ stats }: StatsListProps) {
  return (
    <Grid container spacing={3}>
      {stats.map((stat) => (
        <Grid key={stat.title} size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title={stat.title}
            value={stat.value}
            Icon={stat.Icon}
            iconColor={stat.iconColor}
            iconBgColor={stat.iconBgColor}
            darkIconBgColor={stat.darkIconBgColor}
            trend={stat.trend}
            trendColor={stat.trendColor}
          />
        </Grid>
      ))}
    </Grid>
  );
}
