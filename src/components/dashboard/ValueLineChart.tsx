import { Line } from "react-chartjs-2";
import ChartCard from "@/components/common/ChartCard";
import type { TrendChartData } from "@/types/inventory";
import { useTheme } from "@mui/material/styles";
import { ScriptableContext, TooltipItem } from "chart.js";

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
  readonly title?: string;
  readonly valueFormatter?: (value: number) => string;
  readonly tooltipLabel?: string;
  readonly lineColor?: string;
}

export default function ValueLineChart({
  data = DEFAULT_TREND_DATA,
  title = "Inventory Value Trends",
  valueFormatter = (value) => `$${value}`,
  tooltipLabel = "Inventory Value",
  lineColor = "#1976D2",
}: ValueLineChartProps) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const chartTextColor = isDarkMode ? "#9CA3AF" : "#6B7280";
  const chartGridColor = isDarkMode ? "#374151" : "#E5E7EB";

  const chartData = {
    labels: data.map((item) => item.month),
    datasets: [
      {
        label: tooltipLabel,
        data: data.map((item) => item.value),
        fill: true,
        backgroundColor: (context: ScriptableContext<"line">) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, "rgba(25, 118, 210, 0.1)");
          gradient.addColorStop(1, "rgba(25, 118, 210, 0)");
          return gradient;
        },
        borderColor: lineColor,
        borderWidth: 2,
        tension: 0.4,
        pointBackgroundColor: lineColor,
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: lineColor,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
        titleColor: isDarkMode ? "#F3F4F6" : "#111827",
        bodyColor: isDarkMode ? "#D1D5DB" : "#374151",
        borderColor: isDarkMode ? "#374151" : "#E5E7EB",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function (context: TooltipItem<"line">) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += valueFormatter(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: chartGridColor,
        },
        ticks: {
          color: chartTextColor,
          callback: function (value: number | string) {
            return valueFormatter(Number(value));
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: chartTextColor,
        },
      },
    },
  };

  return (
    <ChartCard title={title}>
      <Line data={chartData} options={options} />
    </ChartCard>
  );
}
