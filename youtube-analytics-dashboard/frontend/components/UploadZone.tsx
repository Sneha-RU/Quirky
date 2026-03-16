"use client";

import { useState, useCallback } from "react";
import { UploadCloud, CheckCircle2 } from "lucide-react";
import Papa from "papaparse";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";

interface UploadZoneProps {
  onUploadSuccess: (columns: string[], rowCount: number) => void;
}

export function UploadZone({ onUploadSuccess }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = (file: File) => {
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      setUploadState("error");
      setErrorMessage("Please upload a valid CSV file.");
      return;
    }

    setUploadState("uploading");

    // Client side preview parsing
    Papa.parse(file, {
      header: true,
      preview: 5, // Just check headers and valid structure
      complete: async (results) => {
        if (results.errors.length > 0) {
          setUploadState("error");
          setErrorMessage("Failed to parse CSV structure.");
          return;
        }

        const columns = results.meta.fields || [];
        
        // Post to backend
        const formData = new FormData();
        formData.append("file", file);

        try {
          // Send to fastAPI ingestion endpoint
          const res = await fetch("http://127.0.0.1:8000/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) throw new Error("Backend ingestion failed");
          
          setUploadState("success");
          setTimeout(() => {
            onUploadSuccess(columns, columns.length); // passing columns length as dummy rowcount due to preview limit
            setUploadState("idle");
          }, 2000);

        } catch (e: any) {
          setUploadState("error");
          setErrorMessage(e.message || "Upload failed.");
        }
      },
      error: () => {
        setUploadState("error");
        setErrorMessage("Failed to read file.");
      }
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      <motion.div
        animate={{
          borderColor: isDragging || uploadState === "success" 
            ? "var(--color-accent-blue)" 
            : uploadState === "error" 
              ? "var(--color-accent-red)" 
              : "var(--color-border-subtle)",
          backgroundColor: isDragging ? "rgba(10,132,255,0.05)" : "transparent"
        }}
        className={clsx(
          "relative rounded-2xl border-2 border-dashed p-8 transition-colors duration-200 text-center glass-surface overflow-hidden"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileChange} 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          disabled={uploadState === "uploading" || uploadState === "success"}
        />
        
        <AnimatePresence mode="wait">
          {uploadState === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center pointer-events-none"
            >
              <UploadCloud className={clsx("w-10 h-10 mb-4 transition-colors", isDragging ? "text-[var(--color-accent-blue)]" : "text-[var(--color-text-secondary)]")} />
              <h4 className="text-callout text-[var(--color-text-primary)] font-medium">Drop your CSV dataset here</h4>
              <p className="text-footnote text-[var(--color-text-secondary)] mt-1">or click to browse</p>
            </motion.div>
          )}

          {uploadState === "uploading" && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center pointer-events-none"
            >
              <div className="w-8 h-8 rounded-full border-2 border-[var(--color-border-subtle)] border-t-[var(--color-accent-blue)] animate-spin mb-4" />
              <h4 className="text-callout text-[var(--color-text-primary)] font-medium">Ingesting dataset…</h4>
            </motion.div>
          )}

          {uploadState === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center pointer-events-none text-[var(--color-accent-green)]"
            >
              <CheckCircle2 className="w-10 h-10 mb-4" />
              <h4 className="text-callout font-medium">Dataset loaded successfully</h4>
            </motion.div>
          )}

          {uploadState === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center pointer-events-none text-[var(--color-accent-red)]"
            >
              <UploadCloud className="w-10 h-10 mb-4" />
              <h4 className="text-callout font-medium">{errorMessage}</h4>
              <p className="text-footnote mt-1 opacity-80">Click to try again</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
