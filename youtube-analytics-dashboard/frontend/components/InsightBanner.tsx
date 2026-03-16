"use client";

import { motion } from "framer-motion";

interface InsightBannerProps {
  text: string;
}

export function InsightBanner({ text }: InsightBannerProps) {
  if (!text) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
      className="w-full mt-6 py-4 border-t border-[var(--color-border-subtle)] flex items-start space-x-3"
    >
      <div className="text-[var(--color-accent-blue)] mt-[2px] text-footnote relative">
        <span aria-hidden="true">◆</span>
      </div>
      <div className="text-body text-[var(--color-text-secondary)] leading-relaxed flex-1 font-medium">
        {text}
      </div>
    </motion.div>
  );
}
