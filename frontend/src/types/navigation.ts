import type { LucideIcon } from "lucide-react";
import type { Permission } from "./auth";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  permissions: (Permission | string)[];
};

export type ErpModuleTabKey = "process" | "documents" | "reports" | "settings";

export type ErpModuleGroup = {
  title: string;
  items: string[];
};

export type ErpModule = NavItem & {
  key: string;
  description: string;
  process: string[];
  documents: string[];
  reports: string[];
  settings: string[];
  reportGroups?: ErpModuleGroup[];
  catalogGroups?: ErpModuleGroup[];
  shortcuts?: string[];
  favorites?: string[];
  recentDocuments?: string[];
};
