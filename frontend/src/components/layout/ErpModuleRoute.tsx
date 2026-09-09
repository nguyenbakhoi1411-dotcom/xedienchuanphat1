"use client";

import { notFound } from "next/navigation";
import { ModulePage } from "@/components/layout/ModulePage";
import { getErpModuleByKey } from "@/constants/navigation";

type ErpModuleRouteProps = {
  moduleKey: string;
};

export function ErpModuleRoute({ moduleKey }: ErpModuleRouteProps) {
  const module = getErpModuleByKey(moduleKey);

  if (!module) {
    notFound();
  }

  return <ModulePage module={module} />;
}
