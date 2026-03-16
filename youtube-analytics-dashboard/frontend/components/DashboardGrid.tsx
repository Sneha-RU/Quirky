"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";

interface DashboardGridProps {
  children: ReactNode[];
}

export function DashboardGrid({ children }: DashboardGridProps) {
  const count = children.length;

  if (count === 0) return null;

  return (
    <div
      className={clsx(
        "grid gap-6 w-full",
        count === 1 ? "grid-cols-1 md:w-3/5 md:mx-auto" :
        count <= 4 ? "grid-cols-1 md:grid-cols-2" :
        "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      )}
    >
      {children.map((child, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: { opacity: 0, y: 30 },
            show: { opacity: 1, y: 0 }
          }}
          className="w-full"
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}
