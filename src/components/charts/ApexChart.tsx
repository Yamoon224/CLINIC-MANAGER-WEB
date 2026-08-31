"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

/* Couleurs de marque (tokens du template) pour les séries. */
export const CHART_COLORS = {
  primary: "#2E37A4",
  secondary: "#00D3C7",
  success: "#27AE60",
  info: "#2F80ED",
  warning: "#E2B93B",
  danger: "#EF1E1E",
  purple: "#7638ff",
  orange: "#E04F16",
};

function useIsDark(): boolean {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const read = () => setDark(root.getAttribute("data-theme") === "dark");
    read();
    const obs = new MutationObserver(read);
    obs.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

export type ApexChartType =
  | "line"
  | "area"
  | "bar"
  | "donut"
  | "pie"
  | "radialBar";

export function ApexChart({
  type,
  series,
  options,
  height = 300,
  colors,
  sparkline = false,
}: {
  type: ApexChartType;
  series: ApexOptions["series"];
  options?: ApexOptions;
  height?: number;
  colors?: string[];
  sparkline?: boolean;
}) {
  const isDark = useIsDark();

  const base: ApexOptions = {
    chart: {
      type,
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "Inter, sans-serif",
      foreColor: isDark ? "#9FACBF" : "#6B7280",
      sparkline: { enabled: sparkline },
    },
    colors: colors ?? [CHART_COLORS.primary, CHART_COLORS.secondary],
    dataLabels: { enabled: false },
    stroke: { width: type === "area" || type === "line" ? 2.5 : 0, curve: "smooth" },
    grid: {
      borderColor: isDark ? "#202A3F" : "#E7E8EB",
      strokeDashArray: 4,
    },
    legend: { position: "bottom", labels: { colors: isDark ? "#9FACBF" : "#6B7280" } },
    tooltip: { theme: isDark ? "dark" : "light" },
    fill:
      type === "area"
        ? {
            type: "gradient",
            gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05 },
          }
        : undefined,
  };

  const merged: ApexOptions = {
    ...base,
    ...options,
    chart: { ...base.chart, ...options?.chart },
  };

  return (
    <ReactApexChart
      type={type}
      series={series}
      options={merged}
      height={height}
    />
  );
}
