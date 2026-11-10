import type { Metadata } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource/roboto-mono/500.css";
import "@fontsource/roboto-mono/600.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Ganjah Team",
    template: "%s · Ganjah Team",
  },
  description: "Organiza jugadores, MatchDays, alineaciones y resultados.",
  icons: {
    icon: "/ganjah-team-logo-extracted.png",
    apple: "/ganjah-team-logo-extracted.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
