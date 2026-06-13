import type { LucideIcon } from "lucide-react";
import type { Permission } from "./auth";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  permissions: Permission[];
};
