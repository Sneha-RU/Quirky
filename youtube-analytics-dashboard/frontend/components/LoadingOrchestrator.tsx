"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const NARRATIVE_STATES = [
  "Reading your dataset…",
  "Generating query…",
  "Running analysis…",
  "Building your dashboard…"
];

interface LoadingProps {
  isLoading: boolean;
}

export function LoadingOrchestrator({ isLoading }: LoadingProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setStep(0);
      return;
    }

    // Cycle through states while loading
    const interval = setInterval(() => {
      setStep((prev) => Math.min(prev + 1, NARRATIVE_STATES.length - 1));
    }, 1500);

    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 z-40 flex flex-col items-center justify-center p-4 bg-[var(--color-base)]/80 backdrop-blur-sm"
        >
          <div className="glass-surface border border-[var(--color-border-subtle)] rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center space-y-6">
            <Loader2 className="w-10 h-10 text-[var(--color-accent-blue)] animate-spin" />
            
            <div className="h-6 relative w-full overflow-hidden">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={step}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="text-body text-[var(--color-text-primary)] font-medium absolute inset-0 flex items-center justify-center"
                >
                  {NARRATIVE_STATES[step]}
                </motion.div>
              </AnimatePresence>
            </div>
            
            {/* Progress bar visual */}
            <div className="w-full h-1 bg-[var(--color-surface-secondary)] rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-[var(--color-accent-blue)]"
                initial={{ width: "0%" }}
                animate={{ width: `${((step + 1) / NARRATIVE_STATES.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
