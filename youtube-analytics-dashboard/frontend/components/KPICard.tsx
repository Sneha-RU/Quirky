"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { clsx } from "clsx";

interface KPICardProps {
  label: string;
  value: string | number;
  deltaPercent?: number; // E.g. 12.4 for +12.4%
}

export function KPICard({ label, value, deltaPercent }: KPICardProps) {
  // Format the value slightly
  const formattedValue = typeof value === "number" && value > 10000 
    ? new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value)
    : value;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
      }}
      className="glass-surface border border-[var(--color-border-subtle)] rounded-2xl p-6 flex flex-col justify-between"
    >
      <div className="text-footnote text-[var(--color-text-secondary)] font-medium tracking-wide uppercase">
        {label}
      </div>
      
      <div className="mt-4 flex items-end justify-between">
        <div className="text-large-title font-mono text-[var(--color-text-primary)] leading-none tracking-tight">
          {formattedValue}
        </div>
        
        {deltaPercent !== undefined && (
          <div className={clsx(
            "flex items-center space-x-1 text-footnote font-medium",
            deltaPercent > 0 ? "text-[var(--color-accent-green)]" : 
            deltaPercent < 0 ? "text-[var(--color-accent-red)]" : 
            "text-[var(--color-text-secondary)]"
          )}>
            {deltaPercent > 0 && <TrendingUp size={14} aria-label="Increase" />}
            {deltaPercent < 0 && <TrendingDown size={14} aria-label="Decrease" />}
            {deltaPercent === 0 && <Minus size={14} aria-label="No change" />}
            <span>{Math.abs(deltaPercent)}%</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
