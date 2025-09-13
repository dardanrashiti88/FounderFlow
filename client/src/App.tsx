import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Pipeline from "@/pages/pipeline";
import Deals from "@/pages/deals";
import Contacts from "@/pages/contacts";
import Companies from "@/pages/companies";
import Forecasting from "@/pages/forecasting";
import Activities from "@/pages/activities";
import Reports from "@/pages/reports";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/sidebar";

function Router() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/pipeline" component={Pipeline} />
          <Route path="/deals" component={Deals} />
          <Route path="/contacts" component={Contacts} />
          <Route path="/companies" component={Companies} />
          <Route path="/forecasting" component={Forecasting} />
          <Route path="/activities" component={Activities} />
          <Route path="/reports" component={Reports} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
