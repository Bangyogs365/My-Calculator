import type { ReactNode } from "react";
import DashboardGuard from "@/features/auth-gate/DashboardGuard";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardGuard>{children}</DashboardGuard>;
}
