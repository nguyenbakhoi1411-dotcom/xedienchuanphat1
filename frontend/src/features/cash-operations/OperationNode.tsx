"use client";

import { useState } from "react";
import { ChevronDown, FileText, DollarSign } from "lucide-react";
import clsx from "clsx";

type NodeType = "receipt" | "payment" | "audit";
type Position = "top" | "bottom" | "center";

interface OperationNodeProps {
  label: string;
  type: NodeType;
  position: Position;
  hasDropdown?: boolean;
  dropdownItems?: string[];
  onItemClick?: (item: string) => void;
}

export function OperationNode({
  label,
  type,
  position,
  hasDropdown = false,
  dropdownItems = [],
  onItemClick
}: OperationNodeProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getIcon = () => {
    if (type === "audit") {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      );
    }

    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
        <FileText className="h-5 w-5 text-green-600" />
        <DollarSign className="h-4 w-4 text-green-600" style={{ marginLeft: "-8px" }} />
      </div>
    );
  };

  return (
    <div className="relative">
      <div className={clsx("flex items-center gap-3", position === "center" && "justify-center")}>
        <div
          className={clsx(
            "flex flex-col items-center gap-2 rounded-lg border-2 border-green-200 bg-green-50 px-4 py-3",
            "relative"
          )}
        >
          <div className="flex items-center gap-2">
            {getIcon()}
            <div className="flex flex-col">
              <span className="text-sm font-medium text-text">{label}</span>
              {type === "receipt" && <span className="text-xs font-bold text-green-600">THU</span>}
              {type === "payment" && <span className="text-xs font-bold text-green-600">CHI</span>}
            </div>
          </div>

          {hasDropdown && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="rounded-md p-1 hover:bg-green-100"
                title="Mở dropdown"
              >
                <ChevronDown
                  className={clsx("h-4 w-4 text-green-600 transition-transform", isDropdownOpen && "rotate-180")}
                />
              </button>
            </div>
          )}
        </div>
      </div>

      {hasDropdown && isDropdownOpen && (
        <div className="absolute left-0 right-0 z-20 mt-2 rounded-lg border border-border bg-white shadow-lg">
          <div className="py-1">
            {dropdownItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onItemClick?.(item);
                  setIsDropdownOpen(false);
                }}
                className="block w-full px-4 py-2 text-left text-sm text-text hover:bg-orange-50 hover:text-primary"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
