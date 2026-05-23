import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 基金投资顾问",
  description: "个人自用的 AI 基金投资顾问工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
