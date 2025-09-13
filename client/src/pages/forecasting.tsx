import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/header";
import RevenueChart from "@/components/revenue-chart";
import { DealWithRelations } from "@shared/schema";
import { formatCurrency } from "@/lib/currency";
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { TrendingUp, Target, Calendar, DollarSign } from "lucide-react";

// Sample forecasting data - in a real app this would be calculated from actual deals
const monthlyForecast = [
  { month: "Jan", projected: 85000, actual: 78000, confidence: 85 },
  { month: "Feb", projected: 92000, actual: 85000, confidence: 88 },
  { month: "Mar", projected: 98000, actual: 94000, confidence: 90 },
  { month: "Apr", projected: 105000, actual: 102000, confidence: 87 },
  { month: "May", projected: 112000, actual: 108000, confidence: 92 },
  { month: "Jun", projected: 128000, actual: null, confidence: 78 },
  { month: "Jul", projected: 135000, actual: null, confidence: 75 },
  { month: "Aug", projected: 142000, actual: null, confidence: 72 },
  { month: "Sep", projected: 148000, actual: null, confidence: 70 },
  { month: "Oct", projected: 155000, actual: null, confidence: 68 },
  { month: "Nov", projected: 162000, actual: null, confidence: 65 },
  { month: "Dec", projected: 178000, actual: null, confidence: 62 },
];

const quarterlyData = [
  { quarter: "Q1 2024", projected: 275000, actual: 257000, deals: 23 },
  { quarter: "Q2 2024", projected: 345000, actual: null, deals: 31 },
  { quarter: "Q3 2024", projected: 425000, actual: null, deals: 38 },
  { quarter: "Q4 2024", projected: 495000, actual: null, deals: 42 },
];

const confidenceData = [
  { range: "90-100%", value: 234000, count: 12, color: "hsl(var(--chart-5))" },
  { range: "70-89%", value: 187000, count: 18, color: "hsl(var(--chart-2))" },
  { range: "50-69%", value: 156000, count: 24, color: "hsl(var(--chart-3))" },
  { range: "30-49%", value: 89000, count: 15, color: "hsl(var(--chart-4))" },
  { range: "0-29%", value: 45000, count: 8, color: "hsl(var(--chart-1))" },
];

export default function Forecasting() {
  const [timePeriod, setTimePeriod] = useState("monthly");
  const [forecastHorizon, setForecastHorizon] = useState("12");

  const { data: deals = [] } = useQuery<DealWithRelations[]>({
    queryKey: ["/api/deals"],
  });

  const { data: metrics } = useQuery({
    queryKey: ["/api/metrics"],
  });

  // Calculate forecasting metrics
  const openDeals = deals.filter(d => !d.stage.includes('closed'));
  const totalPipelineValue = openDeals.reduce((sum, deal) => sum + parseFloat(deal.value), 0);
  const weightedPipelineValue = openDeals.reduce((sum, deal) => 
    sum + (parseFloat(deal.value) * (deal.probability / 100)), 0
  );

  // Group deals by expected close month for better forecasting
  const dealsByMonth = openDeals.reduce((acc, deal) => {
    if (deal.expectedCloseDate) {
      const month = new Date(deal.expectedCloseDate).toLocaleDateString('en-US', { month: 'short' });
      if (!acc[month]) acc[month] = [];
      acc[month].push(deal);
    }
    return acc;
  }, {} as Record<string, typeof openDeals>);

  return (
    <>
      <Header title="Revenue Forecasting" subtitle="Predictive revenue analytics and projections" />
      
      <div className="p-6 space-y-6">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Forecasting Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Time Period:</label>
                <Select value={timePeriod} onValueChange={setTimePeriod} data-testid="select-time-period">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Forecast Horizon:</label>
                <Select value={forecastHorizon} onValueChange={setForecastHorizon} data-testid="select-forecast-horizon">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 months</SelectItem>
                    <SelectItem value="12">12 months</SelectItem>
                    <SelectItem value="18">18 months</SelectItem>
                    <SelectItem value="24">24 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Forecasting Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card className="metric-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Pipeline</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="total-pipeline">
                    {formatCurrency(totalPipelineValue)}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-chart-2 font-medium">Active</span>
                    <span className="text-xs text-muted-foreground ml-1">{openDeals.length} deals</span>
                  </div>
                </div>
                <div className="w-10 h-10 bg-chart-1/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-chart-1" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Weighted Pipeline</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="weighted-pipeline">
                    {formatCurrency(weightedPipelineValue)}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-chart-2 font-medium">
                      {((weightedPipelineValue / totalPipelineValue) * 100).toFixed(1)}%
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">of total</span>
                  </div>
                </div>
                <div className="w-10 h-10 bg-chart-2/10 rounded-lg flex items-center justify-center">
                  <Target className="text-chart-2" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Next 30 Days</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="next-30-days">
                    {formatCurrency(156000)}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-chart-3 font-medium">8 deals</span>
                    <span className="text-xs text-muted-foreground ml-1">closing</span>
                  </div>
                </div>
                <div className="w-10 h-10 bg-chart-3/10 rounded-lg flex items-center justify-center">
                  <Calendar className="text-chart-3" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Forecast Accuracy</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="forecast-accuracy">
                    87.3%
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-chart-4 font-medium">+2.1%</span>
                    <span className="text-xs text-muted-foreground ml-1">vs last period</span>
                  </div>
                </div>
                <div className="w-10 h-10 bg-chart-4/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-chart-4" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Forecasting Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Revenue Forecast Trend</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant={timePeriod === "monthly" ? "default" : "ghost"} size="sm">
                    Monthly
                  </Button>
                  <Button variant={timePeriod === "quarterly" ? "default" : "ghost"} size="sm">
                    Quarterly
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[400px]" data-testid="revenue-forecast-chart">
                <ResponsiveContainer width="100%" height="100%">
                  {timePeriod === "monthly" ? (
                    <LineChart data={monthlyForecast}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis 
                        dataKey="month" 
                        className="fill-muted-foreground text-xs"
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        className="fill-muted-foreground text-xs"
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `$${value / 1000}k`}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number, name: string) => [
                          `$${value?.toLocaleString()}`, 
                          name === "projected" ? "Projected" : "Actual"
                        ]}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="projected" 
                        stroke="hsl(var(--chart-1))" 
                        strokeWidth={3}
                        name="Projected Revenue"
                        dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="actual" 
                        stroke="hsl(var(--chart-2))" 
                        strokeWidth={3}
                        name="Actual Revenue"
                        dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 4 }}
                        connectNulls={false}
                      />
                    </LineChart>
                  ) : (
                    <BarChart data={quarterlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="quarter" className="fill-muted-foreground text-xs" />
                      <YAxis 
                        className="fill-muted-foreground text-xs"
                        tickFormatter={(value) => `$${value / 1000}k`}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="projected" fill="hsl(var(--chart-1))" name="Projected Revenue" />
                      <Bar dataKey="actual" fill="hsl(var(--chart-2))" name="Actual Revenue" />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Confidence Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Deal Confidence Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[400px]" data-testid="confidence-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={confidenceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={140}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {confidenceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, "Pipeline Value"]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Confidence Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Confidence Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {confidenceData.map((item, index) => (
                <div key={item.range} className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <div>
                      <p className="font-medium text-foreground">Confidence: {item.range}</p>
                      <p className="text-sm text-muted-foreground">{item.count} deals</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{formatCurrency(item.value)}</p>
                    <Badge variant="secondary">
                      {((item.value / totalPipelineValue) * 100).toFixed(1)}% of pipeline
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Forecast Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Forecast Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 rounded-lg bg-chart-1/5">
                <h3 className="text-lg font-semibold text-foreground mb-2">Best Case</h3>
                <p className="text-3xl font-bold text-chart-1 mb-2">{formatCurrency(890000)}</p>
                <p className="text-sm text-muted-foreground">95% confidence interval</p>
              </div>
              <div className="text-center p-6 rounded-lg bg-chart-3/5">
                <h3 className="text-lg font-semibold text-foreground mb-2">Most Likely</h3>
                <p className="text-3xl font-bold text-chart-3 mb-2">{formatCurrency(weightedPipelineValue)}</p>
                <p className="text-sm text-muted-foreground">Weighted by probability</p>
              </div>
              <div className="text-center p-6 rounded-lg bg-chart-4/5">
                <h3 className="text-lg font-semibold text-foreground mb-2">Conservative</h3>
                <p className="text-3xl font-bold text-chart-4 mb-2">{formatCurrency(456000)}</p>
                <p className="text-sm text-muted-foreground">70%+ probability deals</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
