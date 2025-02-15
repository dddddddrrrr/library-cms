"use client";

import * as React from "react";
import { Header } from "../common/Header";
import Footer from "../common/Footer";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import Script from "next/script";

const UIProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Toaster richColors position="top-center" />
      <Script
        src="https://js.stripe.com/v3/"
        strategy="lazyOnload"
      />
      <main className="relative flex min-h-screen flex-col bg-background">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </main>
    </ThemeProvider>
  );
};

export default UIProvider;
