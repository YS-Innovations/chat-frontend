// src/components/status-dot.tsx
"use client";

import { cn } from "@/lib/utils";

export function StatusDot({ 
  isOnline,
  className,
  size = "default"
}: { 
  isOnline: boolean | null;
  className?: string;
  size?: "default" | "sm" | "lg";
}) {
  const sizeClasses = {
    default: "h-3 w-3",
    sm: "h-2 w-2",
    lg: "h-3.5 w-3.5"
  };

  return (
    <span
      className={cn(
        "absolute rounded-full border-2 border-background",
        isOnline === null 
          ? "bg-gray-400" 
          : isOnline 
            ? "bg-green-500" 
            : "bg-gray-400",
        sizeClasses[size],
        className
      )}
      style={{
        bottom: 0,
        right: 0,
      }}
      title={isOnline === null ? "Unknown" : isOnline ? "Online" : "Offline"}
    />
  );
}