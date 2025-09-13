import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import MetricCard from "@/components/metric-card";
import PipelineStage from "@/components/pipeline-stage";
import RevenueChart from "@/components/revenue-chart";
import { DollarSign, Percent, Coins, Clock, Phone, Mail, Calendar, Handshake, Building } from "lucide-react";
import { DealWithRelations, ActivityWithRelations } from "@shared/schema";
import { formatCurrency } from "@/lib/currency";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { data: deals = [] } = useQuery<DealWithRelations[]>({
    queryKey: ["/api/deals"],
  });

  const { data: activities = [] } = useQuery<ActivityWithRelations[]>({
    queryKey: ["/api/activities"],
  });

  const { data: metrics } = useQuery<{
    pipelineValue: number;
    conversionRate: number;
    avgDealSize: number;
    salesVelocity: number;
  }>({
    queryKey: ["/api/metrics"],
  });

  // Group deals by stage
  const dealsByStage = {
    lead: deals.filter(d => d.stage === "lead"),
    qualified: deals.filter(d => d.stage === "qualified"),
    proposal: deals.filter(d => d.stage === "proposal"),
    negotiation: deals.filter(d => d.stage === "negotiation"),
    closed_won: deals.filter(d => d.stage === "closed_won"),
  };

  // Get top deals
  const topDeals = deals
    .filter(d => !d.stage.includes("closed"))
    .sort((a, b) => parseFloat(b.value) - parseFloat(a.value))
    .slice(0, 4);

  // Get recent activities (last 10)
  const recentActivities = activities
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const activityIcons = {
    call: Phone,
    email: Mail,
    meeting: Calendar,
    note: Handshake,
    task: Clock,
  };

  const stageColors = ["text-chart-1", "text-chart-2", "text-chart-3", "text-chart-4", "text-chart-5"];

  return (
    <>
      <Header 
        title="Dashboard" 
        subtitle={`Last updated: ${new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}`} 
      />

      <div className="p-6 space-y-6">
        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <MetricCard
            title="Pipeline Value"
            value={metrics ? formatCurrency(metrics.pipelineValue) : "$0"}
            change="+12.5%"
            changeType="positive"
            icon={DollarSign}
            colorClass="text-chart-1"
          />
          <MetricCard
            title="Conversion Rate"
            value={metrics ? `${metrics.conversionRate.toFixed(1)}%` : "0%"}
            change="+2.1%"
            changeType="positive"
            icon={Percent}
            colorClass="text-chart-2"
          />
          <MetricCard
            title="Avg Deal Size"
            value={metrics ? formatCurrency(metrics.avgDealSize) : "$0"}
            change="-3.2%"
            changeType="negative"
            icon={Coins}
            colorClass="text-chart-3"
          />
          <MetricCard
            title="Sales Velocity"
            value={metrics ? `${Math.round(metrics.salesVelocity)} days` : "0 days"}
            change="-4.1 days"
            changeType="positive"
            icon={Clock}
            colorClass="text-chart-4"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Revenue Forecasting Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Revenue Forecasting</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="secondary" size="sm">Monthly</Button>
                  <Button variant="ghost" size="sm">Quarterly</Button>
                  <Button variant="ghost" size="sm">Yearly</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <RevenueChart />
            </CardContent>
          </Card>

          {/* Pipeline Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Pipeline by Stage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(dealsByStage).map(([stage, stageDeals], index) => {
                  const totalValue = stageDeals.reduce((sum, deal) => sum + parseFloat(deal.value), 0);
                  const maxValue = Math.max(...Object.values(dealsByStage).map(deals => 
                    deals.reduce((sum, deal) => sum + parseFloat(deal.value), 0)
                  ));
                  const percentage = maxValue > 0 ? (totalValue / maxValue) * 100 : 0;

                  return (
                    <div key={stage} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 bg-chart-${index + 1} rounded-full`}></div>
                          <span className="text-sm font-medium text-foreground capitalize">
                            {stage.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-muted-foreground">
                            {stageDeals.length} deals
                          </span>
                          <span className="text-sm font-medium text-foreground">
                            {formatCurrency(totalValue)}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`bg-chart-${index + 1} h-2 rounded-full progress-bar`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities & Top Deals */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Activities</CardTitle>
                <Button variant="ghost" size="sm">View all</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No recent activities</p>
                ) : (
                  recentActivities.map((activity) => {
                    const IconComponent = activityIcons[activity.type as keyof typeof activityIcons] || Clock;
                    return (
                      <div key={activity.id} className="flex items-start space-x-3" data-testid={`activity-${activity.id}`}>
                        <div className={`w-8 h-8 bg-chart-1/10 rounded-full flex items-center justify-center flex-shrink-0`}>
                          <IconComponent className="text-chart-1" size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground">
                            <span className="font-medium">{activity.title}</span>
                            {activity.company && ` from ${activity.company.name}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        {activity.deal && (
                          <span className="text-xs text-muted-foreground">
                            {formatCurrency(parseFloat(activity.deal.value))} deal
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Deals */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Top Deals This Month</CardTitle>
                <Button variant="ghost" size="sm">View all deals</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topDeals.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No active deals</p>
                ) : (
                  topDeals.map((deal) => (
                    <div 
                      key={deal.id} 
                      className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-border transition-colors"
                      data-testid={`top-deal-${deal.id}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                          <Building className="text-muted-foreground" size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{deal.company.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {deal.contact.firstName} {deal.contact.lastName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">
                          {formatCurrency(parseFloat(deal.value))}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-muted-foreground">{deal.probability}%</span>
                          <Badge className={`${deal.stage === 'negotiation' ? 'bg-chart-4/10 text-chart-4' : 'bg-chart-3/10 text-chart-3'}`}>
                            {deal.stage === 'negotiation' ? 'Negotiation' : 'Proposal'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sales Pipeline Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Sales Pipeline Overview</CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="default" size="sm">This Month</Button>
                <Button variant="ghost" size="sm">This Quarter</Button>
                <Button variant="ghost" size="sm">This Year</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
