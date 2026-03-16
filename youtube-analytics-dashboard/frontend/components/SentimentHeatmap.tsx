"use client";

import { useMemo } from "react";

interface HeatmapProps {
  data: any[];
  xKey: string;  // e.g. "category"
  yKey: string;  // e.g. "region"
  valueKey: string; // e.g. "sentiment_score"
}

export function SentimentHeatmap({ data, xKey, yKey, valueKey }: HeatmapProps) {
  const { xLabels, yLabels, matrix } = useMemo(() => {
    const xSet = new Set<string>();
    const ySet = new Set<string>();
    
    // First pass: gather unique labels
    data.forEach(d => {
      if (d[xKey] != null) xSet.add(String(d[xKey]));
      if (d[yKey] != null) ySet.add(String(d[yKey]));
    });
    
    const xList = Array.from(xSet).sort();
    const yList = Array.from(ySet).sort();
    
    // Build matrix
    const mat: Record<string, Record<string, number | null>> = {};
    yList.forEach(y => {
      mat[y] = {};
      xList.forEach(x => {
        mat[y][x] = null;
      });
    });
    
    // Populate matrix
    data.forEach(d => {
      const x = String(d[xKey]);
      const y = String(d[yKey]);
      if (mat[y] && mat[y][x] !== undefined && d[valueKey] != null) {
        mat[y][x] = Number(d[valueKey]);
      }
    });

    return { xLabels: xList, yLabels: yList, matrix: mat };
  }, [data, xKey, yKey, valueKey]);

  // Color generator
  const getColor = (val: number | null) => {
    if (val === null) return "transparent";
    // Scale is -1 to 1
    // -1 -> #FF453A (Apple Red)
    // 0 -> #3A3A3C (Surface Secondary)
    // +1 -> #30D158 (Apple Green)
    
    if (val < 0) {
      const opacity = Math.abs(val);
      return `rgba(255, 69, 58, ${opacity * 0.8})`; 
    } else {
      const opacity = val;
      return `rgba(48, 209, 88, ${opacity * 0.8})`; 
    }
  };

  if (xLabels.length === 0 || yLabels.length === 0) {
    return <div className="text-footnote text-[var(--color-text-secondary)] text-center mt-12">Insufficient classification data</div>;
  }

  return (
    <div className="w-full h-full overflow-auto text-footnote font-medium select-none thin-scrollbar">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th className="p-2 sticky top-0 left-0 z-20 bg-[var(--color-surface)] shadow-[1px_1px_0_var(--color-border-subtle)]" />
            {xLabels.map(x => (
              <th key={x} className="p-2 font-normal text-[var(--color-text-secondary)] sticky top-0 z-10 bg-[var(--color-surface)] shadow-[0_1px_0_var(--color-border-subtle)] truncate max-w-[100px]" title={x}>
                {x}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {yLabels.map(y => (
            <tr key={y}>
              <th className="p-2 font-normal text-[var(--color-text-secondary)] sticky left-0 z-10 bg-[var(--color-surface)] shadow-[1px_0_0_var(--color-border-subtle)] truncate max-w-[80px]" title={y}>
                {y}
              </th>
              {xLabels.map(x => {
                const val = matrix[y][x];
                return (
                  <td key={`${y}-${x}`} className="p-1 border flex-1 border-[var(--color-surface-secondary)]/30 min-w-[60px]">
                    <div 
                      className="w-full h-8 rounded flex items-center justify-center text-[var(--color-text-primary)] relative group transition-colors duration-200"
                      style={{ backgroundColor: getColor(val) }}
                    >
                      {val !== null ? <span className="text-caption opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md">{val.toFixed(2)}</span> : ""}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
