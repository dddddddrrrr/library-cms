"use client";

import * as React from "react";
import { Header } from "../common/Header";
import Footer from "../common/Footer";


const UIProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="relative flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </main>
  );
};

export default UIProvider;
