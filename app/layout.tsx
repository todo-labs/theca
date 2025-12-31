import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "theca - Personal Library Management",
  description: "Track your reading journey with AI-powered insights",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
