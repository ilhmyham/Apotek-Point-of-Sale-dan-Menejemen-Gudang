"use client";

import { 
  ShoppingBag, 
  PackagePlus, 
  Trash2, 
  Edit3,
  Activity, // 1. Tambahkan icon fallback/default
  LucideIcon 
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface ActivityItem {
  id: string;
  user: {
    name: string;
    role: string;
    initials: string;
  };
  action: string;
  target: string;
  timestamp: string;
  type: "CREATE" | "UPDATE" | "DELETE" | "TRANSACTION";
}

const typeIcons: Record<string, LucideIcon> = {
  TRANSACTION: ShoppingBag,
  CREATE: PackagePlus,
  UPDATE: Edit3,
  DELETE: Trash2,
};

const typeColors: Record<string, string> = {
  TRANSACTION: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  CREATE: "bg-blue-500/10 text-blue-600 border-blue-200",
  UPDATE: "bg-amber-500/10 text-amber-600 border-amber-200",
  DELETE: "bg-rose-500/10 text-rose-600 border-rose-200",
};

interface ActivityLogProps {
  activities: ActivityItem[];
}

export function ActivityLog({ activities = [] }: ActivityLogProps) {
  return (
    <Card className="w-auto">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Aktivitas Terbaru</CardTitle>
      </CardHeader>
      <CardContent className="max-h-[400px] overflow-y-auto pr-4">
        <div className="relative pl-6 after:absolute after:inset-y-2 after:left-3 after:w-[2px] after:-translate-x-1/2 after:bg-border">
          <div className="space-y-6">
            {activities.map((item) => {
              // 2. Gunakan pembacaan yang tahan case-sensitivity dan sediakan Fallback (Activity)
              const itemType = item?.type?.toUpperCase() || "";
              const Icon = typeIcons[itemType] || Activity;
              const badgeColor = typeColors[itemType] || "bg-slate-500/10 text-slate-600 border-slate-200";

              return (
                <div key={item.id} className="relative flex items-start gap-4 text-sm">
                  {/* Icon Indicator di Atas Garis Timeline */}
                  <div className="absolute -left-6 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full bg-background border shadow-sm z-10">
                    <Icon className="h-3 w-3 text-muted-foreground" />
                  </div>

                  {/* Avatar Pengguna */}
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-slate-100 font-medium">
                      {item.user?.initials || "??"}
                    </AvatarFallback>
                  </Avatar>

                  {/* Detail Aktivitas */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-800">
                        {item.user?.name}{" "}
                        <span className="text-xs text-muted-foreground font-normal">
                          ({item.user?.role})
                        </span>
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {item.timestamp}
                      </span>
                    </div>

                    <p className="text-muted-foreground">
                      {item.action}{" "}
                      <span className="font-medium text-slate-900">{item.target}</span>
                    </p>

                    <div className="pt-1">
                      <Badge variant="outline" className={`text-[10px] px-2 py-0 ${badgeColor}`}>
                        {item.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}