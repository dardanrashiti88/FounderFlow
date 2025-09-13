import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  const [exportType, setExportType] = useState("deals");
  const [format, setFormat] = useState("csv");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      params.append("format", format);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await fetch(`/api/export/${exportType}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("Export failed");
      }

      if (format === "csv") {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${exportType}.csv`;
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
        a.download = `${exportType}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      toast({
        title: "Success",
        description: "Data exported successfully",
      });
      onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" data-testid="export-dialog">
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Export Type</Label>
            <RadioGroup 
              value={exportType} 
              onValueChange={setExportType}
              className="mt-2"
              data-testid="export-type-radio"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="deals" id="deals" />
                <Label htmlFor="deals">All Deals</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="contacts" id="contacts" />
                <Label htmlFor="contacts">All Contacts</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="companies" id="companies" />
                <Label htmlFor="companies">All Companies</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="format">Format</Label>
            <Select value={format} onValueChange={setFormat} data-testid="select-format">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {exportType === "deals" && (
            <div>
              <Label>Date Range (Optional)</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="Start date"
                  data-testid="input-start-date"
                />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="End date"
                  data-testid="input-end-date"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleExport}
              disabled={isExporting}
              data-testid="button-export"
            >
              <Download className="mr-2" size={16} />
              {isExporting ? "Exporting..." : "Export"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
