import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { ThemeProvider } from "~/components/providers/ThemesProvider";

import AuthProvider from "~/components/providers/AuthProvider";
import { Toaster } from "~/components/ui/sonner";
import Script from "next/script";

export const metadata: Metadata = {
  title: "智慧书城",
  description: "智慧书城",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <Script src="https://js.stripe.com/v3/" strategy="lazyOnload" />
              <Toaster position="top-right" duration={2000} />
              {children}
            </ThemeProvider>
          </AuthProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
