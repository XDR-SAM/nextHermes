"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.1 }}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:pointer-events-none disabled:opacity-50",
          // Variants
          variant === "default" && "bg-white text-black hover:bg-gray-100",
          variant === "secondary" && "border border-white/20 text-white hover:bg-white/10",
          variant === "ghost" && "text-white hover:bg-white/5",
          variant === "destructive" && "bg-red-600 text-white hover:bg-red-700",
          // Sizes
          size === "sm" && "h-8 px-3 text-sm rounded-md",
          size === "md" && "h-10 px-5 text-sm rounded-lg",
          size === "lg" && "h-12 px-8 text-base rounded-xl",
          size === "icon" && "h-10 w-10 rounded-lg",
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export { Button };
