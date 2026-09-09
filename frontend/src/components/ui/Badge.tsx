import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type BadgeTone = "orange" | "green" | "blue" | "slate" | "amber" | "red" | "purple" | "cyan" | "emerald";

const toneStyle: Record<BadgeTone, { bg: string; text: string; border: string; dot?: string }> = {
  orange: { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA", dot: "#F97316" },
  green: { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0", dot: "#22C55E" },
  emerald: { bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0", dot: "#10B981" },
  blue: { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE", dot: "#3B82F6" },
  slate: { bg: "#F8FAFC", text: "#475569", border: "#E2E8F0", dot: "#94A3B8" },
  amber: { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A", dot: "#F59E0B" },
  red: { bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA", dot: "#EF4444" },
  purple: { bg: "#FAF5FF", text: "#7E22CE", border: "#E9D5FF", dot: "#A855F7" },
  cyan: { bg: "#ECFEFF", text: "#0E7490", border: "#A5F3FC", dot: "#06B6D4" },
};

export function Badge({
  children,
  tone = "slate",
  dot = false,
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  dot?: boolean;
  className?: string;
}) {
  const style = toneStyle[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        className
      )}
      style={{
        background: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
      }}
    >
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full flex-shrink-0"
          style={{ background: style.dot }}
        />
      )}
      {children}
    </span>
  );
}
