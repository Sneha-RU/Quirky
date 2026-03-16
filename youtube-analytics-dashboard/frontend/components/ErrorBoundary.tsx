"use client";

import { AlertCircle, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";

interface ErrorBoundaryProps {
  error: string;
  reason?: string;
  onRetry?: () => void;
  fullPage?: boolean;
}

export function ErrorBoundary({ error, reason, onRetry, fullPage = false }: ErrorBoundaryProps) {
  const isInsufficientData = error === "insufficient_data";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col items-center justify-center p-8 text-center glass-surface border border-[var(--color-border-subtle)] rounded-2xl ${
        fullPage ? "min-h-[50vh] max-w-2xl mx-auto mt-12" : "h-full min-h-[300px]"
      }`}
    >
      {isInsufficientData ? (
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-secondary)] flex items-center justify-center mb-6">
          <div className="text-3xl" aria-hidden="true">🔍</div>
        </div>
      ) : (
        <AlertCircle className="w-12 h-12 text-[var(--color-accent-amber)] mb-6 opacity-80" />
      )}
      
      <h3 className="text-title3 text-[var(--color-text-primary)] mb-2 tracking-tight">
        {isInsufficientData ? "Data Unavailable" : "Generation Error"}
      </h3>
      
      <p className="text-body text-[var(--color-text-secondary)] max-w-md mx-auto leading-relaxed">
        {isInsufficientData 
          ? "This data isn't available in the current dataset. Try exploring different combinations or simpler filters." 
          : (reason || "An unexpected error occurred while communicating with the analysis engine.")}
      </p>

      {onRetry && !isInsufficientData && (
        <button
          onClick={onRetry}
          className="mt-8 px-6 py-2.5 bg-[var(--color-surface-secondary)] hover:bg-[var(--color-surface-secondary)]/80 text-[var(--color-text-primary)] rounded-full text-footnote font-medium transition-colors flex items-center space-x-2 focus:ring-2 focus:ring-[var(--color-accent-blue)] focus:outline-none"
        >
          <RefreshCcw size={14} />
          <span>Try Again</span>
        </button>
      )}

      {/* Surface raw SQL error in a subtle way if it's not a known error */}
      {!isInsufficientData && reason?.includes("SQL") && (
        <div className="mt-8 text-left w-full p-4 bg-red-500/10 border border-[var(--color-accent-red)]/30 rounded-lg">
          <code className="text-caption text-red-300 font-mono break-words whitespace-pre-wrap">
            {reason}
          </code>
        </div>
      )}
    </motion.div>
  );
}
