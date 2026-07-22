import type { Metadata } from "next";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "Pokémon Trainer Journal",
  description: "A completionist field journal for Pokémon animation.",
  icons: {
    icon: `${basePath}/assets/core/02-kanto-journey-vignette.png`,
    shortcut: `${basePath}/assets/core/02-kanto-journey-vignette.png`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
