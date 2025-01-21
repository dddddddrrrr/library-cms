"use client";

import * as React from "react";
import { Header } from "../common/Header";

const UIProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="bg-muted/50 relative flex min-h-screen flex-col">
      <Header />
      {children}
    </main>
  );
};

export default UIProvider;
