import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import ChartCard from "@/components/common/ChartCard";
import type { CategoryChartData } from "@/types/inventory";

interface StockBarChartProps {
  readonly data: CategoryChartData[];
  readonly title?: string;
}

export default function StockBarChart({
  data,
  title = "Stock by Category",
}: StockBarChartProps) {
  // Calculate height based on number of items to ensure bars maintain fixed size
  // Minimum height 200px, or 45px per item (compacted to fit 8 items in view)
  // Determine layout mode based on data size
  // > 8 items: Horizontal Bar Chart (Bars go right, vertical scrolling)
  // <= 8 items: Vertical Column Chart (Bars go up, standard fixed height)
  const isLargeData = data.length > 8;

  // Height calculation
  // - Large: Grows with data (min 200px) to allow scrolling
  // - Small: Fixed 300px to match ValueLineChart
  const chartHeight = isLargeData ? Math.max(200, data.length * 45) : 300;

  return (
    <ChartCard title={title}>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          layout={isLargeData ? "vertical" : "horizontal"}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 0,
            bottom: 5,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={!isLargeData}
            vertical={isLargeData}
          />

          {/* 
            Axis Logic Swapping:
            - Horizontal Layout (Standard): X=Category, Y=Number
            - Vertical Layout (Large): X=Number, Y=Category
          */}
          {isLargeData ? (
            // Large: Y-axis has categories (Left side), X-axis has numbers (Bottom)
            <>
              <XAxis type="number" axisLine={false} tickLine={false} />
              <YAxis
                dataKey="category"
                type="category"
                axisLine={false}
                tickLine={false}
                width={110}
                interval={0}
              />
            </>
          ) : (
            // Small: X-axis has categories (Bottom), Y-axis has numbers (Left)
            <>
              <XAxis
                dataKey="category"
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
                tick={{ fontSize: 12 }}
              />
              <YAxis axisLine={false} tickLine={false} />
            </>
          )}

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
            radius={isLargeData ? [0, 4, 4, 0] : [4, 4, 0, 0]}
            barSize={isLargeData ? 24 : undefined} // Auto-width for columns, fixed for bars
            name="Stock Quantity"
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
