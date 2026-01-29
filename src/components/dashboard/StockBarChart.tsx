import { Bar } from "react-chartjs-2";
import ChartCard from "@/components/common/ChartCard";
import type { CategoryChartData } from "@/types/inventory";
import { useTheme } from "@mui/material/styles";

interface StockBarChartProps {
  readonly data: CategoryChartData[];
  readonly title?: string;
}

export default function StockBarChart({
  data,
  title = "Stock by Category",
}: StockBarChartProps) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const chartTextColor = isDarkMode ? "#9CA3AF" : "#6B7280";
  const chartGridColor = isDarkMode ? "#374151" : "#E5E7EB";

  const chartData = {
    labels: data.map((item) => item.category),
    datasets: [
      {
        label: "Current Stock",
        data: data.map((item) => item.value),
        backgroundColor: "rgba(46, 125, 50, 0.7)", // Primary green
        borderColor: "#2E7D32",
        borderWidth: 1,
        borderRadius: 4,
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
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: chartGridColor,
        },
        ticks: {
          color: chartTextColor,
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
      <Bar data={chartData} options={options} />
    </ChartCard>
  );
}
