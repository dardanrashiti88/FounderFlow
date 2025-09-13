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
import { Company } from "@shared/schema";
import { Search, Filter, Globe, Building, Users, MoreHorizontal } from "lucide-react";

const sizeLabels = {
  "1-10": "1-10 employees",
  "11-50": "11-50 employees", 
  "51-200": "51-200 employees",
  "201-500": "201-500 employees",
  "500+": "500+ employees"
};

const sizeColors = {
  "1-10": "bg-chart-1/10 text-chart-1",
  "11-50": "bg-chart-2/10 text-chart-2",
  "51-200": "bg-chart-3/10 text-chart-3", 
  "201-500": "bg-chart-4/10 text-chart-4",
  "500+": "bg-chart-5/10 text-chart-5"
};

export default function Companies() {
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [sizeFilter, setSizeFilter] = useState<string>("all");

  const { data: companies = [], isLoading } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  // Get unique industries for filter
  const industries = Array.from(new Set(
    companies.map(c => c.industry).filter(Boolean)
  )).sort();

  // Filter companies based on search and filters
  const filteredCompanies = companies.filter((company) => {
    const matchesSearch = !searchQuery || 
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (company.industry || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (company.description || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesIndustry = industryFilter === "all" || company.industry === industryFilter;
    const matchesSize = sizeFilter === "all" || company.size === sizeFilter;

    return matchesSearch && matchesIndustry && matchesSize;
  });

  if (isLoading) {
    return (
      <>
        <Header title="Companies" />
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
      <Header title="Companies" subtitle={`${filteredCompanies.length} of ${companies.length} companies`} />
      
      <div className="p-6 space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Search companies by name, industry, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="search-companies"
                />
              </div>
              <Select value={industryFilter} onValueChange={setIndustryFilter} data-testid="filter-industry">
                <SelectTrigger className="w-48">
                  <Filter className="mr-2" size={16} />
                  <SelectValue placeholder="All Industries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry!}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sizeFilter} onValueChange={setSizeFilter} data-testid="filter-size">
                <SelectTrigger className="w-48">
                  <Users className="mr-2" size={16} />
                  <SelectValue placeholder="All Sizes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sizes</SelectItem>
                  <SelectItem value="1-10">1-10 employees</SelectItem>
                  <SelectItem value="11-50">11-50 employees</SelectItem>
                  <SelectItem value="51-200">51-200 employees</SelectItem>
                  <SelectItem value="201-500">201-500 employees</SelectItem>
                  <SelectItem value="500+">500+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Companies Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="metric-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Companies</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="total-companies">
                    {companies.length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-chart-1/10 rounded-lg flex items-center justify-center">
                  <Building className="text-chart-1" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Industries</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="total-industries">
                    {industries.length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-chart-2/10 rounded-lg flex items-center justify-center">
                  <Globe className="text-chart-2" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Enterprise (500+)</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="enterprise-companies">
                    {companies.filter(c => c.size === "500+").length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-chart-3/10 rounded-lg flex items-center justify-center">
                  <Users className="text-chart-3" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Startups (1-50)</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="startup-companies">
                    {companies.filter(c => c.size === "1-10" || c.size === "11-50").length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-chart-4/10 rounded-lg flex items-center justify-center">
                  <Building className="text-chart-4" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Companies Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Companies</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCompanies.length === 0 ? (
              <div className="text-center py-12">
                <Building className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No companies found matching your criteria.</p>
              </div>
            ) : (
              <Table data-testid="companies-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.map((company) => (
                    <TableRow key={company.id} data-testid={`company-row-${company.id}`}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                            <Building className="text-muted-foreground" size={16} />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{company.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Created {new Date(company.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {company.industry ? (
                          <Badge variant="secondary">{company.industry}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {company.size ? (
                          <Badge className={sizeColors[company.size as keyof typeof sizeColors]}>
                            {sizeLabels[company.size as keyof typeof sizeLabels]}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {company.website ? (
                          <a 
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-primary hover:underline"
                          >
                            <Globe size={16} />
                            <span>Visit site</span>
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {company.description ? (
                          <div className="max-w-xs truncate text-sm text-muted-foreground">
                            {company.description}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" data-testid={`company-actions-${company.id}`}>
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
