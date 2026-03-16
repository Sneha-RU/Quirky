"use client";

import { useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie,
  ScatterChart, Scatter, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ZAxis
} from "recharts";
import { ChartSpec } from "@/lib/types";
import { SentimentHeatmap } from "./SentimentHeatmap";

const COLORS = ["#0A84FF", "#30D158", "#FFD60A", "#FF9F0A", "#BF5AF2", "#FF453A"];

interface DataVisualizerProps {
  spec: ChartSpec;
}

export function DataVisualizer({ spec }: DataVisualizerProps) {
  const { chartType, data, xKey, yKey, colorKey } = spec;

  const validData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return data;
  }, [data]);

  if (validData.length === 0) {
    return <div className="h-full w-full flex items-center justify-center text-[var(--color-text-secondary)] text-footnote">No data to display</div>;
  }

  // Common Apple-inspired axes styling
  const axisStyle = {
    stroke: "#8E8E93", // Apple secondary grey
    fontSize: 12,
    tickLine: false,
    axisLine: false,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
  };

  // Custom rich tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--color-base)] border border-[var(--color-border-subtle)] p-3 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
          <p className="text-footnote font-medium text-[var(--color-text-primary)] mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-caption" style={{ color: entry.color || "#0A84FF" }}>
              {entry.name}: <span className="font-mono">{
                typeof entry.value === 'number' && entry.value % 1 !== 0 
                  ? entry.value.toFixed(2) 
                  : entry.value
              }</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  switch (chartType) {
    case "line":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={validData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
            <CartesianGrid vertical={false} stroke="#3A3A3C" strokeDasharray="4 4" />
            <XAxis dataKey={xKey!} {...axisStyle} dy={10} />
            <YAxis {...axisStyle} dx={-10} width={40} />
            <Tooltip content={<CustomTooltip />} />
            {colorKey ? (
              // Multiple lines if colorKey is provided (needs data reshaping ideally, but keeping simple for LLM format)
              <Line type="monotone" dataKey={yKey!} stroke="#0A84FF" strokeWidth={2} dot={false} animationDuration={500} animationEasing="ease-out" />
            ) : (
              <Line type="monotone" dataKey={yKey!} stroke="#0A84FF" strokeWidth={2} dot={false} animationDuration={500} animationEasing="ease-out" />
            )}
          </LineChart>
        </ResponsiveContainer>
      );

    case "area":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={validData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
            <defs>
              <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0A84FF" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#0A84FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#3A3A3C" strokeDasharray="4 4" />
            <XAxis dataKey={xKey!} {...axisStyle} dy={10} />
            <YAxis {...axisStyle} dx={-10} width={40} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey={yKey!} stroke="#0A84FF" fillOpacity={1} fill="url(#colorBlue)" strokeWidth={2} animationDuration={500} animationEasing="ease-out" />
          </AreaChart>
        </ResponsiveContainer>
      );

    case "bar":
      // Check if it should be horizontal (many categories)
      const isHorizontal = validData.length > 6;
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={validData} 
            layout={isHorizontal ? "vertical" : "horizontal"}
            margin={{ top: 10, right: 10, left: isHorizontal ? 80 : 10, bottom: 20 }}
          >
            <CartesianGrid horizontal={!isHorizontal} vertical={isHorizontal} stroke="#3A3A3C" strokeDasharray="4 4" />
            <XAxis type={isHorizontal ? "number" : "category"} dataKey={isHorizontal ? undefined : xKey!} {...axisStyle} dy={isHorizontal ? 0 : 10} />
            <YAxis type={isHorizontal ? "category" : "number"} dataKey={isHorizontal ? xKey! : undefined} {...axisStyle} dx={-10} width={isHorizontal ? undefined : 40} />
            <Tooltip cursor={{ fill: "rgba(255,255,255,0.05)" }} content={<CustomTooltip />} />
            <Bar dataKey={yKey!} fill="#0A84FF" radius={isHorizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]} animationDuration={500} animationEasing="ease-out">
              {validData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );

    case "grouped_bar":
        // Requires multiple yKeys or a pivoted dataset, keeping simple for demo
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={validData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid vertical={false} stroke="#3A3A3C" strokeDasharray="4 4" />
              <XAxis dataKey={xKey!} {...axisStyle} dy={10} />
              <YAxis {...axisStyle} dx={-10} width={40} />
              <Tooltip cursor={{ fill: "rgba(255,255,255,0.05)" }} content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 13, paddingTop: 10 }} />
              {colorKey && <Bar dataKey={yKey!} fill="#0A84FF" radius={[4, 4, 0, 0]} />}
              {colorKey && <Bar dataKey={colorKey} fill="#30D158" radius={[4, 4, 0, 0]} />}
              {/* Fallback if backend just specified grouped_bar without colorKey */}
              {!colorKey && <Bar dataKey={yKey!} fill="#0A84FF" radius={[6, 6, 0, 0]} />}
            </BarChart>
          </ResponsiveContainer>
        );

    case "pie":
    case "donut":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 13, paddingTop: 10 }} />
            <Pie
              data={validData}
              cx="50%"
              cy="50%"
              innerRadius={chartType === "donut" ? "60%" : "0%"}
              outerRadius="80%"
              paddingAngle={chartType === "donut" ? 4 : 0}
              dataKey={yKey!}
              nameKey={xKey!}
              stroke="none"
              animationDuration={500}
              animationEasing="ease-out"
            >
              {validData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      );

    case "scatter":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
            <CartesianGrid stroke="#3A3A3C" strokeDasharray="4 4" />
            <XAxis type="number" dataKey={xKey!} name={xKey} {...axisStyle} dy={10} />
            <YAxis type="number" dataKey={yKey!} name={yKey} {...axisStyle} dx={-10} width={40} />
            {colorKey && <ZAxis type="category" dataKey={colorKey} name={colorKey} />}
            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
            <Scatter name={spec.title || "Data"} data={validData} fill="#0A84FF" animationDuration={500}>
              {validData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      );

    case "heatmap":
      if (!xKey || !yKey || !colorKey) {
        return <div className="text-footnote text-[var(--color-text-secondary)] text-center mt-12">Heatmap requires xKey, yKey, and colorKey metrics.</div>;
      }
      return <SentimentHeatmap data={validData} xKey={xKey} yKey={yKey} valueKey={colorKey} />;

    case "kpi_card":
      // Handled separately at the dashboard level, but provide fallback
      return <div className="flex h-full items-center justify-center text-title1 font-mono">{validData[0]?.[yKey!] || "N/A"}</div>;

    default:
      return <div className="p-4 text-[var(--color-accent-amber)]">Unsupported chart type: {chartType}</div>;
  }
}
