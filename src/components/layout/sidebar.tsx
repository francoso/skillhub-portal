"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Upload,
  Puzzle,
  Presentation,
  Trophy,
  ScrollText,
  Shield,
  BarChart3,
  Map,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "首页", icon: Upload },
  { href: "/skills", label: "Skill 库", icon: Puzzle },
  { href: "/upload", label: "上传登记", icon: Upload },
  { href: "/coverage", label: "能力地图", icon: Map },
  { href: "/demo", label: "Demo 会", icon: Presentation },
  { href: "/contribution", label: "贡献看板", icon: Trophy },
  { href: "/certification", label: "认证馆", icon: Shield },
  { href: "/dashboard", label: "数据看板", icon: BarChart3 },
  { href: "/rules", label: "机制规则", icon: ScrollText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-gray-200 flex flex-col z-40">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-lg font-bold text-gray-900">SkillHub</h1>
        <p className="text-xs text-gray-500 mt-1">联盟 Skill 生态工作台</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">数据源: JSON (MVP)</p>
        <p className="text-xs text-gray-400">更新: 2026-05-25</p>
      </div>
    </aside>
  );
}
