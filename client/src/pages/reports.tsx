import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/header";
import { DealWithRelations, ContactWithCompany, Company } from "@shared/schema";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";
import { 
  Download, 
  FileText, 
  Table, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Building, 
  Handshake,
  Calendar,
  DollarSign
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ExportType = "deals" | "contacts" | "companies" | "revenue" | "activities";
type ExportFormat = "csv" | "json" | "excel";

export default function Reports() {
  const [exportType, setExportType] = useState<ExportType>("deals");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("csv");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const { data: deals = [] } = useQuery<DealWithRelations[]>({
    queryKey: ["/api/deals"],
  });

  const { data: contacts = [] } = useQuery<ContactWithCompany[]>({
    queryKey: ["/api/contacts"],
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const { data: metrics } = useQuery({
    queryKey: ["/api/metrics"],
  });

  // Calculate report statistics
  const totalDeals = deals.length;
  const closedDeals = deals.filter(d => d.stage.includes('closed')).length;
  const wonDeals = deals.filter(d => d.stage === 'closed_won').length;
  const totalRevenue = deals.filter(d => d.stage === 'closed_won').reduce((sum, deal) => sum + parseFloat(deal.value), 0);
  const avgDealSize = wonDeals > 0 ? totalRevenue / wonDeals : 0;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      params.append("format", exportFormat);
      if (startDate && exportType === "deals") params.append("startDate", startDate);
      if (endDate && exportType === "deals") params.append("endDate", endDate);

      const response = await fetch(`/api/export/${exportType}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("Export failed");
      }

      const contentType = response.headers.get("content-type");
      const fileName = `${exportType}_${new Date().toISOString().split('T')[0]}`;

      if (contentType?.includes("text/csv")) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${fileName}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${fileName}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      toast({
        title: "Success",
        description: "Data exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Header title="Reports & Export" subtitle="Generate reports and export your data" />
      
      <div className="p-6 space-y-6">
        {/* Report Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card className="metric-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Records</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="total-records">
                    {totalDeals + contacts.length + companies.length}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-chart-1 font-medium">Ready to export</span>
                  </div>
                </div>
                <div className="w-10 h-10 bg-chart-1/10 rounded-lg flex items-center justify-center">
                  <FileText className="text-chart-1" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Revenue Generated</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="total-revenue">
                    {formatCurrency(totalRevenue)}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-chart-2 font-medium">{wonDeals} deals won</span>
                  </div>
                </div>
                <div className="w-10 h-10 bg-chart-2/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-chart-2" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="conversion-rate">
                    {closedDeals > 0 ? Math.round((wonDeals / closedDeals) * 100) : 0}%
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-chart-3 font-medium">{closedDeals} closed deals</span>
                  </div>
                </div>
                <div className="w-10 h-10 bg-chart-3/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-chart-3" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Deal Size</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="avg-deal-size">
                    {formatCurrency(avgDealSize)}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-chart-4 font-medium">Per won deal</span>
                  </div>
                </div>
                <div className="w-10 h-10 bg-chart-4/10 rounded-lg flex items-center justify-center">
                  <BarChart3 className="text-chart-4" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="export" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Data Export</TabsTrigger>
            <TabsTrigger value="reports">Quick Reports</TabsTrigger>
          </TabsList>

          {/* Export Tab */}
          <TabsContent value="export">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Export Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>Export Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-base font-medium">Data Type</Label>
                    <RadioGroup 
                      value={exportType} 
                      onValueChange={(value) => setExportType(value as ExportType)}
                      className="mt-3"
                      data-testid="export-type-radio"
                    >
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                        <RadioGroupItem value="deals" id="deals" />
                        <Label htmlFor="deals" className="flex items-center space-x-2 cursor-pointer flex-1">
                          <Handshake size={16} className="text-muted-foreground" />
                          <span>All Deals ({totalDeals})</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                        <RadioGroupItem value="contacts" id="contacts" />
                        <Label htmlFor="contacts" className="flex items-center space-x-2 cursor-pointer flex-1">
                          <Users size={16} className="text-muted-foreground" />
                          <span>All Contacts ({contacts.length})</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                        <RadioGroupItem value="companies" id="companies" />
                        <Label htmlFor="companies" className="flex items-center space-x-2 cursor-pointer flex-1">
                          <Building size={16} className="text-muted-foreground" />
                          <span>All Companies ({companies.length})</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="format" className="text-base font-medium">Export Format</Label>
                    <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as ExportFormat)} data-testid="select-format">
                      <SelectTrigger className="mt-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">
                          <div className="flex items-center space-x-2">
                            <Table size={16} />
                            <span>CSV (Comma Separated)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="json">
                          <div className="flex items-center space-x-2">
                            <FileText size={16} />
                            <span>JSON (JavaScript Object)</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {exportType === "deals" && (
                    <div>
                      <Label className="text-base font-medium">Date Range (Optional)</Label>
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div>
                          <Label htmlFor="startDate" className="text-sm text-muted-foreground">From</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            data-testid="input-start-date"
                          />
                        </div>
                        <div>
                          <Label htmlFor="endDate" className="text-sm text-muted-foreground">To</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            data-testid="input-end-date"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleExport}
                    disabled={isExporting}
                    className="w-full"
                    size="lg"
                    data-testid="button-export"
                  >
                    <Download className="mr-2" size={16} />
                    {isExporting ? "Exporting..." : `Export ${exportType.charAt(0).toUpperCase() + exportType.slice(1)}`}
                  </Button>
                </CardContent>
              </Card>

              {/* Export Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Export Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/20">
                      <h4 className="font-medium text-foreground mb-2">
                        {exportType === "deals" ? "Deals Export" : 
                         exportType === "contacts" ? "Contacts Export" : 
                         exportType === "companies" ? "Companies Export" : "Data Export"}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {exportType === "deals" && `${totalDeals} deals will be exported with company and contact information.`}
                        {exportType === "contacts" && `${contacts.length} contacts will be exported with their company associations.`}
                        {exportType === "companies" && `${companies.length} companies will be exported with industry and size information.`}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Format:</span>
                          <div className="font-medium text-foreground">{exportFormat.toUpperCase()}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Records:</span>
                          <div className="font-medium text-foreground">
                            {exportType === "deals" ? totalDeals :
                             exportType === "contacts" ? contacts.length :
                             exportType === "companies" ? companies.length : 0}
                          </div>
                        </div>
                        {startDate && endDate && exportType === "deals" && (
                          <>
                            <div>
                              <span className="text-muted-foreground">From:</span>
                              <div className="font-medium text-foreground">{format(new Date(startDate), 'MMM dd, yyyy')}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">To:</span>
                              <div className="font-medium text-foreground">{format(new Date(endDate), 'MMM dd, yyyy')}</div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Sample Data Preview */}
                    <div>
                      <h5 className="font-medium text-foreground mb-2">Sample Fields</h5>
                      <div className="text-xs text-muted-foreground space-y-1 font-mono bg-muted/10 p-3 rounded">
                        {exportType === "deals" && (
                          <>
                            <div>• Deal ID, Title, Value, Stage, Probability</div>
                            <div>• Company Name, Contact Name, Email</div>
                            <div>• Expected Close Date, Created Date</div>
                            <div>• Notes and Description</div>
                          </>
                        )}
                        {exportType === "contacts" && (
                          <>
                            <div>• Contact ID, First Name, Last Name</div>
                            <div>• Email, Phone, Title, LinkedIn</div>
                            <div>• Company Name, Notes</div>
                          </>
                        )}
                        {exportType === "companies" && (
                          <>
                            <div>• Company ID, Name, Website</div>
                            <div>• Industry, Size, Description</div>
                            <div>• Created Date</div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Sales Performance Report */}
              <Card>
                <CardHeader>
                  <CardTitle>Sales Performance Report</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-chart-1/5">
                      <p className="text-sm text-muted-foreground">Total Deals</p>
                      <p className="text-xl font-bold text-foreground">{totalDeals}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-chart-2/5">
                      <p className="text-sm text-muted-foreground">Won Deals</p>
                      <p className="text-xl font-bold text-foreground">{wonDeals}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-chart-3/5">
                      <p className="text-sm text-muted-foreground">Win Rate</p>
                      <p className="text-xl font-bold text-foreground">
                        {closedDeals > 0 ? Math.round((wonDeals / closedDeals) * 100) : 0}%
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-chart-4/5">
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-xl font-bold text-foreground">{formatCurrency(totalRevenue)}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setExportType("deals");
                      handleExport();
                    }}
                  >
                    <Download className="mr-2" size={16} />
                    Export Sales Report
                  </Button>
                </CardContent>
              </Card>

              {/* Contact Management Report */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Management Report</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-chart-1/5">
                      <p className="text-sm text-muted-foreground">Total Contacts</p>
                      <p className="text-xl font-bold text-foreground">{contacts.length}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-chart-2/5">
                      <p className="text-sm text-muted-foreground">Companies</p>
                      <p className="text-xl font-bold text-foreground">{companies.length}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-chart-3/5">
                      <p className="text-sm text-muted-foreground">With Email</p>
                      <p className="text-xl font-bold text-foreground">
                        {contacts.filter(c => c.email).length}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-chart-4/5">
                      <p className="text-sm text-muted-foreground">With Phone</p>
                      <p className="text-xl font-bold text-foreground">
                        {contacts.filter(c => c.phone).length}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setExportType("contacts");
                      handleExport();
                    }}
                  >
                    <Download className="mr-2" size={16} />
                    Export Contact Report
                  </Button>
                </CardContent>
              </Card>

              {/* Pipeline Analysis */}
              <Card className="xl:col-span-2">
                <CardHeader>
                  <CardTitle>Pipeline Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {[
                      { stage: "Lead", count: deals.filter(d => d.stage === "lead").length, color: "chart-1" },
                      { stage: "Qualified", count: deals.filter(d => d.stage === "qualified").length, color: "chart-2" },
                      { stage: "Proposal", count: deals.filter(d => d.stage === "proposal").length, color: "chart-3" },
                      { stage: "Negotiation", count: deals.filter(d => d.stage === "negotiation").length, color: "chart-4" },
                      { stage: "Closed Won", count: deals.filter(d => d.stage === "closed_won").length, color: "chart-5" },
                    ].map((stage) => (
                      <div key={stage.stage} className={`p-4 rounded-lg bg-${stage.color}/5 text-center`}>
                        <p className="text-sm text-muted-foreground mb-1">{stage.stage}</p>
                        <p className="text-2xl font-bold text-foreground">{stage.count}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {totalDeals > 0 ? Math.round((stage.count / totalDeals) * 100) : 0}% of total
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
