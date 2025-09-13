import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/header";
import { DealWithRelations } from "@shared/schema";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";
import { Search, Filter, MoreHorizontal, Building, User } from "lucide-react";

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

export default function Deals() {
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");

  const { data: deals = [], isLoading } = useQuery<DealWithRelations[]>({
    queryKey: ["/api/deals"],
  });

  // Filter deals based on search and stage
  const filteredDeals = deals.filter((deal) => {
    const matchesSearch = !searchQuery || 
      deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${deal.contact.firstName} ${deal.contact.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStage = stageFilter === "all" || deal.stage === stageFilter;

    return matchesSearch && matchesStage;
  });

  if (isLoading) {
    return (
      <>
        <Header title="Deals" />
        <div className="p-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 bg-muted/30 rounded animate-pulse"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Deals" subtitle={`${filteredDeals.length} of ${deals.length} deals`} />
      
      <div className="p-6 space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Search deals, companies, or contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="search-deals"
                />
              </div>
              <Select value={stageFilter} onValueChange={setStageFilter} data-testid="filter-stage">
                <SelectTrigger className="w-48">
                  <Filter className="mr-2" size={16} />
                  <SelectValue placeholder="All Stages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                  <SelectItem value="closed_won">Closed Won</SelectItem>
                  <SelectItem value="closed_lost">Closed Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Deals Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Deals</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredDeals.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No deals found matching your criteria.</p>
              </div>
            ) : (
              <Table data-testid="deals-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Deal</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Probability</TableHead>
                    <TableHead>Expected Close</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeals.map((deal) => (
                    <TableRow key={deal.id} data-testid={`deal-row-${deal.id}`}>
                      <TableCell>
                        <div className="font-medium text-foreground">{deal.title}</div>
                        {deal.notes && (
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {deal.notes}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Building size={16} className="text-muted-foreground" />
                          <span>{deal.company.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User size={16} className="text-muted-foreground" />
                          <span>{deal.contact.firstName} {deal.contact.lastName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">
                          {formatCurrency(parseFloat(deal.value))}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={stageColors[deal.stage as keyof typeof stageColors]}>
                          {stageLabels[deal.stage as keyof typeof stageLabels]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-12 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${deal.probability}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-muted-foreground">{deal.probability}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {deal.expectedCloseDate ? (
                          <span className="text-sm">
                            {format(new Date(deal.expectedCloseDate), 'MMM dd, yyyy')}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(deal.createdAt), 'MMM dd, yyyy')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" data-testid={`deal-actions-${deal.id}`}>
                          <MoreHorizontal size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
