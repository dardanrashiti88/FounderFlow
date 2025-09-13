import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  colorClass: string;
}

export default function MetricCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  colorClass 
}: MetricCardProps) {
  const changeColorClass = {
    positive: "text-chart-2",
    negative: "text-destructive", 
    neutral: "text-muted-foreground"
  }[changeType];

  return (
    <Card className="metric-card" data-testid={`metric-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground" data-testid={`value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              {value}
            </p>
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${changeColorClass}`}>
                {change}
              </span>
              <span className="text-xs text-muted-foreground ml-1">vs last month</span>
            </div>
          </div>
          <div className={`w-10 h-10 ${colorClass}/10 rounded-lg flex items-center justify-center`}>
            <Icon className={colorClass} size={20} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
