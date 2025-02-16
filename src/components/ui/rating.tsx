"use client";

import { Star } from "lucide-react";
import { cn } from "~/lib/utils";

interface RatingProps {
  value: number;
  onValueChange?: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md";
}

export function Rating({
  value,
  onValueChange,
  readonly = false,
  size = "md",
}: RatingProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => !readonly && onValueChange?.(i + 1)}
          disabled={readonly}
          className={cn(
            "rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            !readonly && "hover:text-primary",
            size === "sm" && "h-4 w-4",
            size === "md" && "h-5 w-5",
          )}
        >
          <Star
            className={cn(
              "transition-colors",
              i < value
                ? "fill-primary text-primary"
                : "fill-none text-muted-foreground",
            )}
          />
        </button>
      ))}
    </div>
  );
}
