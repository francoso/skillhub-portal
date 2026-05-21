import { Card, CardContent } from "@/components/ui/card";
import { Puzzle, Users, Zap, Activity } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: "skills" | "contributors" | "invokes" | "active";
  subtitle?: string;
}

const iconMap = {
  skills: Puzzle,
  contributors: Users,
  invokes: Zap,
  active: Activity,
};

const colorMap = {
  skills: "text-blue-600 bg-blue-50",
  contributors: "text-purple-600 bg-purple-50",
  invokes: "text-orange-600 bg-orange-50",
  active: "text-green-600 bg-green-50",
};

export function KpiCard({ title, value, icon, subtitle }: KpiCardProps) {
  const Icon = iconMap[icon];
  const color = colorMap[icon];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
