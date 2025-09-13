import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DealWithRelations } from "@shared/schema";
import DealCard from "./deal-card";

interface PipelineStageProps {
  title: string;
  deals: DealWithRelations[];
  colorClass: string;
  count: number;
}

export default function PipelineStage({ title, deals, colorClass, count }: PipelineStageProps) {
  return (
    <div className="deal-stage bg-muted/30 rounded-lg p-4 min-h-[400px]" data-testid={`pipeline-stage-${title.toLowerCase()}`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        <Badge className={`${colorClass} bg-opacity-10 px-2 py-1 rounded-full`}>
          {count}
        </Badge>
      </div>
      <div className="space-y-2">
        {deals.map((deal) => (
          <Card key={deal.id} className="bg-card shadow-sm">
            <CardContent className="p-3">
              <p className="text-sm font-medium text-foreground mb-1" data-testid={`deal-company-${deal.id}`}>
                {deal.company.name}
              </p>
              <p className="text-xs text-muted-foreground mb-2" data-testid={`deal-contact-${deal.id}`}>
                {deal.contact.firstName} {deal.contact.lastName}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground" data-testid={`deal-value-${deal.id}`}>
                  ${parseFloat(deal.value).toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground" data-testid={`deal-probability-${deal.id}`}>
                  {deal.probability}%
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
