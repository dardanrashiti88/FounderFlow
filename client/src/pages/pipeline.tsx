import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/header";
import PipelineStage from "@/components/pipeline-stage";
import { DealWithRelations } from "@shared/schema";

export default function Pipeline() {
  const { data: deals = [], isLoading } = useQuery<DealWithRelations[]>({
    queryKey: ["/api/deals"],
  });

  // Group deals by stage
  const dealsByStage = {
    lead: deals.filter(d => d.stage === "lead"),
    qualified: deals.filter(d => d.stage === "qualified"),
    proposal: deals.filter(d => d.stage === "proposal"),
    negotiation: deals.filter(d => d.stage === "negotiation"),
    closed_won: deals.filter(d => d.stage === "closed_won"),
    closed_lost: deals.filter(d => d.stage === "closed_lost"),
  };

  if (isLoading) {
    return (
      <>
        <Header title="Sales Pipeline" />
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-muted/30 rounded-lg p-4 min-h-[400px] animate-pulse"></div>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Sales Pipeline" subtitle={`${deals.length} total deals`} />
      
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4" data-testid="pipeline-stages">
              <PipelineStage
                title="Lead"
                deals={dealsByStage.lead}
                colorClass="text-chart-1"
                count={dealsByStage.lead.length}
              />
              <PipelineStage
                title="Qualified"
                deals={dealsByStage.qualified}
                colorClass="text-chart-2"
                count={dealsByStage.qualified.length}
              />
              <PipelineStage
                title="Proposal"
                deals={dealsByStage.proposal}
                colorClass="text-chart-3"
                count={dealsByStage.proposal.length}
              />
              <PipelineStage
                title="Negotiation"
                deals={dealsByStage.negotiation}
                colorClass="text-chart-4"
                count={dealsByStage.negotiation.length}
              />
              <PipelineStage
                title="Closed Won"
                deals={dealsByStage.closed_won}
                colorClass="text-chart-5"
                count={dealsByStage.closed_won.length}
              />
              <PipelineStage
                title="Closed Lost"
                deals={dealsByStage.closed_lost}
                colorClass="text-muted-foreground"
                count={dealsByStage.closed_lost.length}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
