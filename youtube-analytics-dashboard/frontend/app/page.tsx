"use client";

import { useState, useCallback, useRef } from "react";
import { CommandBar } from "@/components/CommandBar";
import { DashboardGrid } from "@/components/DashboardGrid";
import { ChartCard } from "@/components/ChartCard";
import { KPICard } from "@/components/KPICard";
import { LoadingOrchestrator } from "@/components/LoadingOrchestrator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { InsightBanner } from "@/components/InsightBanner";
import { ConversationHistory } from "@/components/ConversationHistory";
import { UploadZone } from "@/components/UploadZone";
import { DataVisualizer } from "@/components/DataVisualizer";
import { DashboardResponse, ChatMessage } from "@/lib/types";
import { validateChartType } from "@/lib/chartSelector";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<DashboardResponse | null>(null);
  const [historyItems, setHistoryItems] = useState<{id: string, query: string, timestamp: Date}[]>([]);
  const [chatContext, setChatContext] = useState<ChatMessage[]>([]);
  const [hasStarted, setHasStarted] = useState(false);
  
  // Track previous dashboard configuration to identify modified charts
  const prevChartsRef = useRef<string[]>([]);

  const handleSearch = async (newQuery: string) => {
    if (!newQuery.trim() || isLoading) return;
    
    setQuery(newQuery);
    setIsLoading(true);
    setHasStarted(true);

    // Save current queries to identify modifications later
    const currentChartKeys = response?.charts.map(c => c.title + c.chartType) || [];
    prevChartsRef.current = currentChartKeys;

    try {
      const payload = {
        query: newQuery,
        history: chatContext,
      };

      const res = await fetch("http://127.0.0.1:8000/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || data.reason || "An error occurred");
      }
      
      // Update models
      setResponse(data);
      
      // Maintain conversation context for LLM
      setChatContext(prev => [
        ...prev, 
        { role: "user", content: newQuery }, 
        // We only append user queries for context, appending huge JSON responses to context usually breaks prompt lengths.
        // For a more advanced demo, we'd summarize the assistant response.
      ]);

      // Add to display history
      setHistoryItems(prev => [
        { id: Math.random().toString(36).substr(2, 9), query: newQuery, timestamp: new Date() },
        ...prev
      ]);

    } catch (err: any) {
      setResponse({
        charts: [],
        kpiRow: {},
        insightSummary: "",
        confidenceScore: 0,
        error: "fatal",
        reason: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = useCallback(() => {
    setHistoryItems([]);
    setChatContext([]);
    setResponse(null);
    setHasStarted(false);
    setQuery("");
  }, []);

  const handleUploadSuccess = useCallback(() => {
    // Optionally trigger a fresh "Summarize this dataset" query here
  }, []);

  return (
    <main className="min-h-screen relative overflow-x-hidden flex flex-col items-center">
      {/* Background radial gradient subtle enhancement */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at top, rgba(44,44,46,0.3) 0%, rgba(28,28,30,1) 100%)" }} />

      <LoadingOrchestrator isLoading={isLoading} />
      
      <ConversationHistory 
        history={historyItems}
        onSelectQuery={handleSearch}
        onClearHistory={handleClearHistory}
      />

      <div className="w-full max-w-[1400px] px-6 md:px-12 pt-20 pb-24 relative z-10 flex flex-col items-center min-h-screen">
        
        {/* Title area fades out after first query */}
        <AnimatePresence>
          {!hasStarted && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, transition: { duration: 0.3 } }}
              className="text-center mb-12 flex flex-col items-center justify-center min-h-[30vh]"
            >
              <h1 className="text-large-title text-[var(--color-text-primary)] mb-4 tracking-tight">Midnight Analytics</h1>
              <p className="text-callout text-[var(--color-text-secondary)] max-w-lg mb-8">
                Ask questions about your YouTube performance data in plain English.
              </p>
              <UploadZone onUploadSuccess={handleUploadSuccess} />
            </motion.div>
          )}
        </AnimatePresence>

        <CommandBar 
          onSearch={handleSearch} 
          isLoading={isLoading} 
          centered={!hasStarted} 
        />

        {/* Results Area */}
        <AnimatePresence mode="popLayout">
          {hasStarted && response && !isLoading && (
            <motion.div
              key="dashboard-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex flex-col gap-6"
            >
              {response.error ? (
                <ErrorBoundary error={response.error} reason={response.reason} onRetry={() => handleSearch(query)} />
              ) : (
                <>
                  {/* KPI Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                    {Object.entries(response.kpiRow || {}).map(([key, value]) => (
                      <KPICard key={key} label={key} value={value as number} />
                    ))}
                  </div>

                  {/* Insight Banner */}
                  <InsightBanner text={response.insightSummary} />

                  {/* Charts Grid */}
                  <div className="mt-4">
                    <DashboardGrid>
                      {response.charts.map((chart, i) => {
                        // Check if this chart was in the previous render (roughly) to show modification badge
                        const chartKey = chart.title + chart.chartType;
                        const isModified = chatContext.length > 2 && !prevChartsRef.current.includes(chartKey);
                        
                        return (
                          <ChartCard 
                            key={`chart-${i}`}
                            title={chart.title}
                            subtitle={chart.subtitle}
                            confidenceScore={chart.confidenceScore}
                            isModified={isModified}
                          >
                            <DataVisualizer 
                              spec={{
                                ...chart,
                                chartType: validateChartType(chart.chartType)
                              }} 
                            />
                          </ChartCard>
                        );
                      })}
                    </DashboardGrid>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Screen Reader Announcements */}
      <div aria-live="polite" className="sr-only">
        {isLoading ? "Generating dashboard analysis..." : 
         response && response.error ? "Error generating dashboard" : 
         response && !isLoading ? `Dashboard updated with ${response.charts?.length || 0} charts` : ""}
      </div>
    </main>
  );
}
