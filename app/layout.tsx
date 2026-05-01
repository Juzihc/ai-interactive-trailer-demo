import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "腾讯视频互动预告 Demo",
  description: "长视频平台内的互动预告片功能演示",
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
