import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import ChartCard from "@/components/common/ChartCard";

interface StockHealthData {
  name: string;
  value: number;
  color: string;
  [key: string]: unknown;
}

interface StockHealthChartProps {
  // Recharts requires mutable array for internal processing
  readonly data: StockHealthData[];
  readonly title?: string;
}

export default function StockHealthChart({
  data,
  title = "Stock Health Distribution",
}: StockHealthChartProps) {
  return (
    <ChartCard title={title}>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell key={`cell-${entry.name}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "none",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Legend
            verticalAlign="middle"
            align="right"
            layout="vertical"
            iconType="circle"
            wrapperStyle={{ color: "#000000", fontWeight: 500 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
