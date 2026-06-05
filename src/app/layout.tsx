import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";

export const metadata: Metadata = {
  title: "SkillHub Portal — 联盟Skill生态工作台",
  description: "联盟广告Skill生态一站式管理平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-screen flex bg-gray-50">
        <Sidebar />
        <main className="flex-1 ml-60 p-8">{children}</main>
      </body>
    </html>
  );
}
