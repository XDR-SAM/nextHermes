"use client";

import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "destructive";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        variant === "default" && "bg-white text-black",
        variant === "secondary" && "bg-gray-800 text-white",
        variant === "outline" && "border border-gray-700 text-gray-300",
        variant === "destructive" && "bg-red-600 text-white",
        className
      )}
      {...props}
    />
  );
}

export { Badge };
