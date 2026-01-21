import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Paper, Typography, Box } from "@mui/material";
import type { CategoryChartData } from "@/types/inventory";

interface StockBarChartProps {
  readonly data: CategoryChartData[];
}

export default function StockBarChart({ data }: StockBarChartProps) {
  return (
    <Paper sx={{ p: 3, height: "100%" }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        Stock by Category
      </Typography>
      <Box sx={{ height: 300, width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="category" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{
                borderRadius: 8,
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Bar
              dataKey="value"
              fill="#2E7D32"
              radius={[4, 4, 0, 0]}
              barSize={40}
              name="Stock Quantity"
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}
