import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WingBuddy Server",
  description: "WingBuddy backend — sessions, VB tokens, brain, event log.",
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
