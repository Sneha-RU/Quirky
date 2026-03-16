// Deterministic chart selection rules to enforce UI consistency,
// acting as a safeguard map between generated `chartType` string and Recharts components.

import { ChartType } from "./types";

/**
 * Returns a standardized ChartType string based on backend string mappings.
 * It's mostly passed straight through unless the backend hallucinates a type.
 */
export function validateChartType(type: string): ChartType {
  const validTypes: ChartType[] = [
    "line", "bar", "grouped_bar", "area", "pie", 
    "donut", "scatter", "kpi_card", "heatmap"
  ];
  
  if (validTypes.includes(type as ChartType)) {
    return type as ChartType;
  }
  
  // Default fallback for tabular data that doesn't fit
  return "bar";
}
