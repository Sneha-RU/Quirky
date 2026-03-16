"use client";

import { useState, useEffect, FormEvent } from "react";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";

interface CommandBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  centered?: boolean;
}

const PLACEHOLDERS = [
  "Show me total views by category…",
  "Compare sentiment score across regions for videos over 10 minutes…",
  "Monthly engagement trend for Tech Reviews with ads enabled…",
];

export function CommandBar({ onSearch, isLoading, centered = true }: CommandBarProps) {
  const [query, setQuery] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (isFocused || query.length > 0) return;
    const interval = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isFocused, query]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    onSearch(query.trim());
  };

  return (
    <motion.div
      layout
      initial={false}
      animate={{
        y: centered ? "40vh" : 0,
        scale: isFocused && centered ? 1.01 : 1,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={clsx(
        "w-full max-w-4xl mx-auto z-50 transition-all duration-300",
        centered ? "absolute left-0 right-0 px-4" : "relative mb-8"
      )}
    >
      <form onSubmit={handleSubmit} className="relative w-full group">
        <div
          className={clsx(
            "absolute inset-0 rounded-full transition-opacity duration-300 pointer-events-none",
            isFocused ? "opacity-100" : "opacity-0"
          )}
          style={{ boxShadow: "0 0 0 4px rgba(10,132,255,0.25)" }}
        />
        
        <div className="relative flex items-center bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-full overflow-hidden shadow-lg group-hover:bg-[var(--color-surface-secondary)] transition-colors duration-200">
          <div className="pl-6 pr-4 py-4 text-[var(--color-text-secondary)]">
            <Search size={22} className={clsx(isFocused ? "text-[var(--color-accent-blue)]" : "")} />
          </div>
          
          <div className="relative flex-1 h-14">
            <AnimatePresence mode="wait">
              {!query && !isFocused && (
                <motion.div
                  key={placeholderIdx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 flex items-center text-[var(--color-text-secondary)] pointer-events-none text-callout truncate pr-4"
                >
                  {PLACEHOLDERS[placeholderIdx]}
                </motion.div>
              )}
            </AnimatePresence>
            
            <input
              type="text"
              role="search"
              aria-label="Ask a question about your YouTube data"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={isLoading}
              className="w-full h-full bg-transparent outline-none text-[var(--color-text-primary)] text-callout placeholder-transparent"
              placeholder={PLACEHOLDERS[placeholderIdx]}
            />
          </div>
        </div>
      </form>
    </motion.div>
  );
}
