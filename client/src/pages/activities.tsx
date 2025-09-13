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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/header";
import { ActivityWithRelations } from "@shared/schema";
import { formatDistanceToNow, format } from "date-fns";
import { 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  Calendar, 
  FileText, 
  Clock,
  CheckCircle,
  Circle,
  User,
  Building
} from "lucide-react";

const activityIcons = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: FileText,
  task: Clock,
};

const activityColors = {
  call: "text-chart-1",
  email: "text-chart-2", 
  meeting: "text-chart-3",
  note: "text-chart-4",
  task: "text-chart-5",
};

const activityBadgeColors = {
  call: "bg-chart-1/10 text-chart-1",
  email: "bg-chart-2/10 text-chart-2",
  meeting: "bg-chart-3/10 text-chart-3", 
  note: "bg-chart-4/10 text-chart-4",
  task: "bg-chart-5/10 text-chart-5",
};

export default function Activities() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");

  const { data: activities = [], isLoading } = useQuery<ActivityWithRelations[]>({
    queryKey: ["/api/activities"],
  });

  // Filter activities based on search, type, and status
  const filteredActivities = activities.filter((activity) => {
    const matchesSearch = !searchQuery || 
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (activity.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (activity.company?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (activity.contact ? `${activity.contact.firstName} ${activity.contact.lastName}` : "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === "all" || activity.type === typeFilter;
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "completed" && activity.completed) ||
      (statusFilter === "pending" && !activity.completed);

    const matchesTab = activeTab === "all" ||
      (activeTab === "overdue" && activity.dueDate && new Date(activity.dueDate) < new Date() && !activity.completed) ||
      (activeTab === "today" && activity.dueDate && 
        new Date(activity.dueDate).toDateString() === new Date().toDateString()) ||
      (activeTab === "completed" && activity.completed);

    return matchesSearch && matchesType && matchesStatus && matchesTab;
  });

  // Sort activities by creation date (most recent first)
  const sortedActivities = filteredActivities.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Calculate activity stats
  const totalActivities = activities.length;
  const completedActivities = activities.filter(a => a.completed).length;
  const overdueActivities = activities.filter(a => 
    a.dueDate && new Date(a.dueDate) < new Date() && !a.completed
  ).length;
  const todayActivities = activities.filter(a =>
    a.dueDate && new Date(a.dueDate).toDateString() === new Date().toDateString()
  ).length;

  if (isLoading) {
    return (
      <>
        <Header title="Activities" />
        <div className="p-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-20 bg-muted/30 rounded animate-pulse"></div>
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
      <Header title="Activities" subtitle={`${filteredActivities.length} of ${totalActivities} activities`} />
      
      <div className="p-6 space-y-6">
        {/* Activity Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="metric-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Activities</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="total-activities">
                    {totalActivities}
                  </p>
                </div>
                <div className="w-10 h-10 bg-chart-1/10 rounded-lg flex items-center justify-center">
                  <Clock className="text-chart-1" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="completed-activities">
                    {completedActivities}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-chart-2 font-medium">
                      {totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0}%
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">completion rate</span>
                  </div>
                </div>
                <div className="w-10 h-10 bg-chart-2/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-chart-2" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Due Today</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="today-activities">
                    {todayActivities}
                  </p>
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
                  <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="overdue-activities">
                    {overdueActivities}
                  </p>
                </div>
                <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                  <Circle className="text-destructive" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
                  placeholder="Search activities, companies, or contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="search-activities"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter} data-testid="filter-type">
                <SelectTrigger className="w-48">
                  <Filter className="mr-2" size={16} />
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="call">Calls</SelectItem>
                  <SelectItem value="email">Emails</SelectItem>
                  <SelectItem value="meeting">Meetings</SelectItem>
                  <SelectItem value="note">Notes</SelectItem>
                  <SelectItem value="task">Tasks</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter} data-testid="filter-status">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Activities Tabs and List */}
        <Card>
          <CardHeader>
            <CardTitle>Activities Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="activity-tabs">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All ({totalActivities})</TabsTrigger>
                <TabsTrigger value="today">Today ({todayActivities})</TabsTrigger>
                <TabsTrigger value="overdue">Overdue ({overdueActivities})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completedActivities})</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-6">
                {sortedActivities.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No activities found matching your criteria.</p>
                  </div>
                ) : (
                  <div className="space-y-4" data-testid="activities-list">
                    {sortedActivities.map((activity) => {
                      const IconComponent = activityIcons[activity.type as keyof typeof activityIcons] || Clock;
                      const isOverdue = activity.dueDate && new Date(activity.dueDate) < new Date() && !activity.completed;
                      
                      return (
                        <div 
                          key={activity.id} 
                          className={`flex items-start space-x-4 p-4 rounded-lg border transition-colors hover:bg-muted/30 ${
                            isOverdue ? 'border-destructive/50 bg-destructive/5' : 'border-border'
                          }`}
                          data-testid={`activity-${activity.id}`}
                        >
                          {/* Icon */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            activityColors[activity.type as keyof typeof activityColors]
                          }/10`}>
                            <IconComponent 
                              className={activityColors[activity.type as keyof typeof activityColors]} 
                              size={18} 
                            />
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-medium text-foreground">{activity.title}</h3>
                                <Badge className={activityBadgeColors[activity.type as keyof typeof activityBadgeColors]}>
                                  {activity.type}
                                </Badge>
                                {activity.completed ? (
                                  <Badge className="bg-chart-2/10 text-chart-2">
                                    <CheckCircle className="mr-1" size={12} />
                                    Completed
                                  </Badge>
                                ) : isOverdue ? (
                                  <Badge className="bg-destructive/10 text-destructive">
                                    Overdue
                                  </Badge>
                                ) : null}
                              </div>
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            
                            {activity.description && (
                              <p className="text-sm text-muted-foreground mb-3">{activity.description}</p>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                {activity.company && (
                                  <div className="flex items-center space-x-1">
                                    <Building size={14} />
                                    <span>{activity.company.name}</span>
                                  </div>
                                )}
                                {activity.contact && (
                                  <div className="flex items-center space-x-1">
                                    <User size={14} />
                                    <span>{activity.contact.firstName} {activity.contact.lastName}</span>
                                  </div>
                                )}
                                {activity.deal && (
                                  <div className="flex items-center space-x-1">
                                    <span className="text-primary font-medium">
                                      ${parseFloat(activity.deal.value).toLocaleString()} deal
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              {activity.dueDate && (
                                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                  <Calendar size={14} />
                                  <span>
                                    Due {format(new Date(activity.dueDate), 'MMM dd, yyyy')}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
