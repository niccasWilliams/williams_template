"use client";
import { ReactNode } from "react";
import { ThemeProvider } from "./theme-provider";
import { env } from "@/env";
import { RootProvider } from "fumadocs-ui/provider";



export function Providers({ children }: { children: ReactNode }) {
  return (
    <RootProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </RootProvider>
  );
}
