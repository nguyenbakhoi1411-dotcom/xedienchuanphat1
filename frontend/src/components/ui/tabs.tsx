import React, { createContext, useContext } from "react";
import { cn } from "@/lib/cn";

type TabsContextType = {
  value?: string;
  onValueChange?: (value: string) => void;
};

const TabsContext = createContext<TabsContextType>({});

export function Tabs({
  value,
  onValueChange,
  children,
  className,
}: {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-0.5 border-b border-border", className)}>
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { value: activeValue, onValueChange } = useContext(TabsContext);
  const isActive = activeValue === value;

  return (
    <button
      type="button"
      onClick={() => onValueChange?.(value)}
      className={cn(
        "relative -mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-all duration-150",
        isActive
          ? "border-primary text-primary"
          : "border-transparent text-slate-500 hover:border-slate-200 hover:text-slate-700",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { value: activeValue } = useContext(TabsContext);
  if (activeValue !== value) {
    return null;
  }

  return <div className={className}>{children}</div>;
}
