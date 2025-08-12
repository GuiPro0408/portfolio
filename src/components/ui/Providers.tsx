"use client";
import * as React from "react";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import { SessionProvider } from "next-auth/react";

const theme = createTheme({
  palette: { mode: "light" },
  shape: { borderRadius: 12 },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}


