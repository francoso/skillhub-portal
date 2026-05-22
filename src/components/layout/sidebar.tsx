"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Upload,
  Puzzle,
  Presentation,
  Trophy,
  ScrollText,
  Search,
  Shield,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getSkills, getDemos, getContributors } from "@/lib/data";

const navItems = [
  { href: "/", label: "首页", icon: Upload },
  { href: "/skills", label: "Skill 库", icon: Puzzle },
  { href: "/demo", label: "Demo 会", icon: Presentation },
  { href: "/contribution", label: "贡献看板", icon: Trophy },
  { href: "/certification", label: "联盟认证", icon: Shield },
  { href: "/dashboard", label: "数据看板", icon: BarChart3 },
  { href: "/rules", label: "机制规则", icon: ScrollText },
];

interface SearchResult {
  type: "skill" | "demo" | "contributor";
  title: string;
  subtitle: string;
  href: string;
}

// Pre-load data once outside component to avoid re-computation
const skills = getSkills();
const demos = getDemos();
const contributors = getContributors();

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchResults = useMemo((): SearchResult[] => {
    if (!searchQuery.trim() || searchQuery.length < 1) return [];
    const q = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    try {
      // Search skills
      for (const s of skills) {
        if (
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.owner.toLowerCase().includes(q) ||
          s.slug.toLowerCase().includes(q)
        ) {
          results.push({
            type: "skill",
            title: s.name,
            subtitle: `${s.owner} · ${s.category}`,
            href: `/skills/${s.id}`,
          });
        }
      }

      // Search demos
      for (const d of demos) {
        if (
          d.title.toLowerCase().includes(q) ||
          d.skills.some(
            (e) =>
              e.presenter.toLowerCase().includes(q) ||
              e.summary.toLowerCase().includes(q)
          )
        ) {
          results.push({
            type: "demo",
            title: d.title,
            subtitle: d.date,
            href: "/demo",
          });
        }
      }

      // Search contributors
      for (const c of contributors) {
        if (
          c.name.toLowerCase().includes(q) ||
          c.team.toLowerCase().includes(q)
        ) {
          results.push({
            type: "contributor",
            title: c.name,
            subtitle: `${c.team} · ${c.role}`,
            href: "/contribution",
          });
        }
      }
    } catch (e) {
      console.error("[SkillHub Search] Error during search:", e);
    }

    return results.slice(0, 8);
  }, [searchQuery]);

  const handleResultClick = useCallback((href: string) => {
    router.push(href);
    setShowResults(false);
    setSearchQuery("");
  }, [router]);

  const typeLabels: Record<string, string> = {
    skill: "Skill",
    demo: "Demo",
    contributor: "贡献者",
  };

  const typeColors: Record<string, string> = {
    skill: "bg-blue-100 text-blue-700",
    demo: "bg-purple-100 text-purple-700",
    contributor: "bg-green-100 text-green-700",
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-gray-200 flex flex-col z-40">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-lg font-bold text-gray-900">SkillHub</h1>
        <p className="text-xs text-gray-500 mt-1">联盟 Skill 生态工作台</p>
      </div>

      {/* Global Search */}
      <div className="px-4 pt-4 pb-2 relative" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value.trim()) {
                setShowResults(true);
              } else {
                setShowResults(false);
              }
            }}
            onFocus={() => {
              if (searchQuery.trim()) setShowResults(true);
            }}
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 bg-gray-50"
          />
        </div>

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute left-4 right-4 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
            {searchResults.map((result, idx) => (
              <button
                key={`${result.type}-${idx}`}
                onClick={() => handleResultClick(result.href)}
                className="w-full px-3 py-2.5 text-left hover:bg-gray-50 flex items-center gap-2 border-b border-gray-50 last:border-0"
              >
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${typeColors[result.type]}`}
                >
                  {typeLabels[result.type]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 truncate">{result.title}</p>
                  <p className="text-xs text-gray-400 truncate">{result.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        )}
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
        <p className="text-xs text-gray-400">更新: 2026-05-22</p>
      </div>
    </aside>
  );
}
