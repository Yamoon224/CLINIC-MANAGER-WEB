"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => <div className="h-[300px]" />,
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
  const foreColor = isDark ? "#9FACBF" : "#6B7280";
  const gridColor = isDark ? "#202A3F" : "#E7E8EB";

  const merged: ApexOptions = {
    ...options,
    theme: { mode: isDark ? "dark" : "light", ...options?.theme },
    chart: {
      type,
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "Inter, sans-serif",
      foreColor,
      sparkline: { enabled: sparkline },
      ...options?.chart,
    },
    colors:
      colors && colors.length > 0
        ? colors
        : (options?.colors ?? [CHART_COLORS.primary, CHART_COLORS.secondary]),
    dataLabels: { enabled: false, ...options?.dataLabels },
    stroke: {
      width: type === "area" || type === "line" ? 2.5 : 0,
      curve: "smooth",
      ...options?.stroke,
    },
    grid: { borderColor: gridColor, strokeDashArray: 4, ...options?.grid },
    tooltip: { theme: isDark ? "dark" : "light", ...options?.tooltip },
    // apexcharts 5.16 plante dans setSeriesYAxisMappings si yaxis n'est pas
    // un tableau — on garantit toujours un tableau.
    yaxis: Array.isArray(options?.yaxis)
      ? options?.yaxis
      : options?.yaxis
        ? [options.yaxis]
        : [{}],
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
