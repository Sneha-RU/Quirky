export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export type ChartType = "line" | "bar" | "grouped_bar" | "area" | "pie" | "donut" | "scatter" | "kpi_card" | "heatmap";

export interface ChartSpec {
  chartType: ChartType;
  title: string;
  subtitle?: string;
  sqlQuery: string;
  xKey?: string;
  yKey?: string;
  colorKey?: string;
  confidenceScore: number;
  data?: any[]; // Populated by backend
}

export interface KPIResult {
  "Total Videos"?: number;
  "Avg Views"?: number;
  "Avg Sentiment Score"?: number;
  "Ads Enabled %"?: number;
}

export interface DashboardResponse {
  charts: ChartSpec[];
  kpiRow: KPIResult;
  insightSummary: string;
  confidenceScore: number;
  error?: string;
  reason?: string;
}

export interface RequestPayload {
  query: string;
  history: ChatMessage[];
}
