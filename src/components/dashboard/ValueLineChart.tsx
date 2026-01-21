import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Paper, Typography, Box } from "@mui/material";
import type { TrendChartData } from "@/types/inventory";

// Mock data since we don't have historical data driven by DB yet
const DEFAULT_TREND_DATA: TrendChartData[] = [
  { month: "Jan", value: 4200 },
  { month: "Feb", value: 4800 },
  { month: "Mar", value: 4500 },
  { month: "Apr", value: 5100 },
  { month: "May", value: 5377 },
  { month: "Jun", value: 5900 },
];

interface ValueLineChartProps {
  readonly data?: TrendChartData[];
}

export default function ValueLineChart({
  data = DEFAULT_TREND_DATA,
}: ValueLineChartProps) {
  return (
    <Paper sx={{ p: 3, height: "100%" }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        Inventory Value Trends
      </Typography>
      <Box sx={{ height: 300, width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1976D2" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#1976D2" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              formatter={(value) => [`$${value}`, "Inventory Value"]}
              contentStyle={{
                borderRadius: 8,
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#1976D2"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}
