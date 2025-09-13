import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Filter, 
  Handshake, 
  Users, 
  Building, 
  TrendingUp, 
  Clock, 
  FileDown 
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Sales Pipeline", href: "/pipeline", icon: Filter },
  { name: "Deals", href: "/deals", icon: Handshake },
  { name: "Contacts", href: "/contacts", icon: Users },
  { name: "Companies", href: "/companies", icon: Building },
  { name: "Revenue Forecasting", href: "/forecasting", icon: TrendingUp },
  { name: "Activities", href: "/activities", icon: Clock },
  { name: "Reports & Export", href: "/reports", icon: FileDown },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col" data-testid="sidebar">
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <BarChart3 className="text-primary-foreground" size={16} />
          </div>
          <h1 className="text-xl font-bold text-foreground">SalesPipe</h1>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2" data-testid="navigation-menu">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <a
                className={cn(
                  "sidebar-link flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium",
                  isActive && "active"
                )}
                data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </a>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <Users className="text-muted-foreground" size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">John Founder</p>
            <p className="text-xs text-muted-foreground">TechStartup Inc.</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
