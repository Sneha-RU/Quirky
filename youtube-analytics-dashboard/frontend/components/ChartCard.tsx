"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { clsx } from "clsx";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  confidenceScore: number;
  children: ReactNode;
  deltaPercent?: number; // Optional footer delta
  isModified?: boolean;  // Shows the "Modified from previous query" badge
}

export function ChartCard({ title, subtitle, confidenceScore, children, deltaPercent, isModified }: ChartCardProps) {
  const isLowConfidence = confidenceScore < 0.7;

  return (
    <motion.div
      layout
      variants={{
        hidden: { opacity: 0, scale: 0.95 },
        show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 250, damping: 25 } }
      }}
      whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.24)" }}
      className={clsx(
        "glass-surface border rounded-3xl p-6 flex flex-col h-[400px] w-full transition-all duration-300 relative",
        isModified ? "border-[var(--color-accent-blue)]" : "border-[var(--color-border-subtle)]"
      )}
    >
      {/* Modification Pulse Effect */}
      {isModified && (
        <motion.div
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0 rounded-3xl -z-10 pointer-events-none"
          style={{ boxShadow: "0 0 0 3px rgba(10,132,255,0.4)" }}
        />
      )}

      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h3 className="text-callout font-semibold text-[var(--color-text-primary)] tracking-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-footnote text-[var(--color-text-secondary)] mt-1 tracking-wide">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 w-full min-h-0 relative">
        {children}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {isLowConfidence && (
            <div 
              className="flex items-center space-x-1 text-footnote text-[var(--color-accent-amber)]"
              title="Low confidence — verify this result"
            >
              <AlertTriangle size={14} />
              <span>Low Confidence</span>
            </div>
          )}
          
          {isModified && (
            <div className="text-caption text-[var(--color-accent-blue)] px-2 py-1 bg-[var(--color-accent-blue)]/10 rounded font-medium">
              ↩ Modified from previous query
            </div>
          )}
        </div>

        {deltaPercent !== undefined && (
          <div className={clsx(
            "flex items-center space-x-1 text-footnote font-medium bg-[var(--color-surface-secondary)] px-2.5 py-1 rounded-full",
            deltaPercent > 0 ? "text-[var(--color-accent-green)]" : 
            deltaPercent < 0 ? "text-[var(--color-accent-red)]" : 
            "text-[var(--color-text-secondary)]"
          )}>
            {deltaPercent > 0 && <TrendingUp size={12} />}
            {deltaPercent < 0 && <TrendingDown size={12} />}
            {deltaPercent === 0 && <Minus size={12} />}
            <span>{Math.abs(deltaPercent)}%</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
