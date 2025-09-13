import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building } from "lucide-react";
import { DealWithRelations } from "@shared/schema";
import { formatCurrency } from "@/lib/currency";

interface DealCardProps {
  deal: DealWithRelations;
  onClick?: () => void;
}

const stageColors = {
  lead: "bg-chart-1/10 text-chart-1",
  qualified: "bg-chart-2/10 text-chart-2", 
  proposal: "bg-chart-3/10 text-chart-3",
  negotiation: "bg-chart-4/10 text-chart-4",
  closed_won: "bg-chart-5/10 text-chart-5",
  closed_lost: "bg-muted/10 text-muted-foreground"
};

const stageLabels = {
  lead: "Lead",
  qualified: "Qualified",
  proposal: "Proposal", 
  negotiation: "Negotiation",
  closed_won: "Closed Won",
  closed_lost: "Closed Lost"
};

export default function DealCard({ deal, onClick }: DealCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
      data-testid={`deal-card-${deal.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
              <Building className="text-muted-foreground" size={16} />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground" data-testid={`company-${deal.id}`}>
                {deal.company.name}
              </p>
              <p className="text-xs text-muted-foreground" data-testid={`contact-${deal.id}`}>
                {deal.contact.firstName} {deal.contact.lastName}
              </p>
            </div>
          </div>
        </div>
        
        <h3 className="font-medium text-foreground mb-2" data-testid={`title-${deal.id}`}>
          {deal.title}
        </h3>
        
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-foreground" data-testid={`value-${deal.id}`}>
            {formatCurrency(parseFloat(deal.value))}
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground" data-testid={`probability-${deal.id}`}>
              {deal.probability}%
            </span>
            <Badge 
              className={stageColors[deal.stage as keyof typeof stageColors]}
              data-testid={`stage-${deal.id}`}
            >
              {stageLabels[deal.stage as keyof typeof stageLabels]}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
