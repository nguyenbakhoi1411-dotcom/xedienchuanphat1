"use client";

import React from "react";

interface ReportNumberProps {
  value: number | null | undefined;
  type?: "profit" | "cost" | "neutral";
  showSign?: boolean;
  className?: string;
  parentheses?: boolean; // display negative as (1.500.000) accounting style
}

export function fmtVnd(value: number): string {
  return Math.abs(value).toLocaleString("vi-VN");
}

export default function ReportNumber({
  value,
  type = "neutral",
  showSign = false,
  className = "",
  parentheses = false,
}: ReportNumberProps) {
  const v = Number(value ?? 0);

  if (v === 0) {
    return <span className={`text-gray-400 ${className}`}>—</span>;
  }

  let colorClass = "";
  if (type === "profit") {
    colorClass = v > 0 ? "text-emerald-600" : "text-red-600";
  } else if (type === "cost") {
    colorClass = v > 0 ? "text-red-600" : "text-emerald-600";
  } else {
    colorClass = "text-gray-900";
  }

  const absStr = fmtVnd(v);

  if (parentheses && v < 0) {
    return <span className={`${colorClass} ${className}`}>({absStr})</span>;
  }

  const sign = showSign && v > 0 ? "+" : v < 0 ? "-" : "";

  return (
    <span className={`${colorClass} ${className}`}>
      {sign}{absStr}
    </span>
  );
}
