"use client";

import { ActivityEvent } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";

function getTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0) return "今天";
  if (diffDays === 1) return "昨天";
  if (diffDays < 7) return `${diffDays} 天前`;
  return dateStr;
}

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <div className="space-y-3">
      {events.map((event) => (
        <Card key={event.id} className="border-l-2 border-l-blue-200">
          <CardContent className="py-3 px-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">{event.description}</p>
              <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                {getTimeAgo(event.time)}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
