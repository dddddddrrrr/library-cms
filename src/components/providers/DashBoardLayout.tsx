"use client";

import { useEffect, useState } from "react";

import AppSidebar from "~/components/providers/AppSidebar";

import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [defaultOpen, setDefaultOpen] = useState(true);

  useEffect(() => {
    setMounted(true);
    setDefaultOpen(localStorage.getItem("sidebar:state") === "true");
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
