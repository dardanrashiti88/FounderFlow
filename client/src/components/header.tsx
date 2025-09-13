import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Download } from "lucide-react";
import { useState } from "react";
import NewDealDialog from "./new-deal-dialog";
import ExportDialog from "./export-dialog";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewDealOpen, setIsNewDealOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  return (
    <>
      <header className="bg-card border-b border-border px-6 py-4" data-testid="page-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-semibold text-foreground" data-testid="page-title">{title}</h2>
            {subtitle && (
              <span className="text-sm text-muted-foreground" data-testid="page-subtitle">
                {subtitle}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                type="text"
                placeholder="Search deals, contacts, companies..."
                className="pl-10 w-80"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="search-input"
              />
            </div>
            
            <Button 
              onClick={() => setIsNewDealOpen(true)}
              data-testid="button-new-deal"
            >
              <Plus className="mr-2" size={16} />
              New Deal
            </Button>
            
            <Button 
              variant="secondary" 
              onClick={() => setIsExportOpen(true)}
              data-testid="button-export"
            >
              <Download className="mr-2" size={16} />
              Export
            </Button>
          </div>
        </div>
      </header>

      <NewDealDialog open={isNewDealOpen} onOpenChange={setIsNewDealOpen} />
      <ExportDialog open={isExportOpen} onOpenChange={setIsExportOpen} />
    </>
  );
}
