import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Bell, Send, ArrowLeft, Eye, RefreshCw, Mail, MessageSquare, CheckCircle2, Clock, XCircle, Users, Search, Filter, X, CalendarIcon, AlertTriangle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NotificationDetailModal } from "@/components/NotificationDetailModal";
import { useToast } from "@/hooks/use-toast";
import { format, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import type { Notification } from "@/components/NotificationCenter";

// Mock data - in production this would come from a database
const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Team Meeting Tomorrow",
    message: "Don't forget our quarterly review meeting at 10 AM in Conference Room B. Please bring your progress reports and any questions you may have for the leadership team.",
    channels: ["email", "portal"],
    recipients: ["Alice Johnson", "Bob Smith", "Carol Williams", "David Brown", "Eva Martinez"],
    requiresAcknowledgement: true,
    acknowledgementSettings: {
      required: true,
      responseOptions: ["Acknowledged", "Need more information", "Cannot attend"],
      allowComments: true,
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    acknowledgementResponses: [
      { recipientName: "Alice Johnson", selectedOption: "Acknowledged", respondedAt: new Date(Date.now() - 1 * 60 * 60 * 1000) },
      { recipientName: "Bob Smith", selectedOption: "Acknowledged", comment: "Will bring Q3 report", respondedAt: new Date(Date.now() - 30 * 60 * 1000) },
      { recipientName: "Carol Williams", selectedOption: "Cannot attend", comment: "On PTO that day", respondedAt: new Date(Date.now() - 45 * 60 * 1000) },
    ],
    status: "sent",
    sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    acknowledgedBy: ["Alice Johnson", "Bob Smith", "Carol Williams"],
  },
  {
    id: "2",
    title: "System Maintenance Alert",
    message: "The employee portal will be down for maintenance on Saturday from 2-4 AM. Please save any work and log out before this time.",
    channels: ["email", "sms", "portal"],
    recipients: ["Grace Lee", "Henry Wilson", "Ivy Chen", "Jack Taylor"],
    requiresAcknowledgement: false,
    status: "sent",
    sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: "3",
    title: "Policy Update Required",
    message: "Please review and acknowledge the updated remote work policy in the employee handbook. This policy takes effect from next Monday.",
    channels: ["portal"],
    recipients: ["Alice Johnson", "Bob Smith", "Carol Williams", "David Brown", "Eva Martinez", "Frank Garcia", "Grace Lee"],
    requiresAcknowledgement: true,
    acknowledgementSettings: {
      required: true,
      responseOptions: ["Acknowledged and agree", "Have questions"],
      allowComments: true,
      deadline: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },
    acknowledgementResponses: [
      { recipientName: "Alice Johnson", selectedOption: "Acknowledged and agree", respondedAt: new Date(Date.now() - 36 * 60 * 60 * 1000) },
      { recipientName: "Bob Smith", selectedOption: "Have questions", comment: "Need clarification on section 3.2", respondedAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    ],
    status: "sent",
    sentAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    acknowledgedBy: ["Alice Johnson", "Bob Smith"],
  },
  {
    id: "4",
    title: "Holiday Schedule Announcement",
    message: "Please note the updated holiday schedule for Q4. The office will be closed on the dates listed in the attached document.",
    channels: ["email"],
    recipients: ["All Employees"],
    requiresAcknowledgement: false,
    status: "sent",
    sentAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
  },
  {
    id: "5",
    title: "Security Training Required",
    message: "All employees must complete the annual security awareness training by end of month. Please access the training portal to begin.",
    channels: ["email", "portal"],
    recipients: ["IT Department", "Operations Team"],
    requiresAcknowledgement: true,
    acknowledgementSettings: {
      required: true,
      responseOptions: ["Training completed", "In progress", "Need assistance"],
      allowComments: false,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    status: "pending",
    sentAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
];

type AckFilterType = "all" | "required" | "not-required" | "complete" | "pending" | "overdue";

const History = () => {
  const { toast } = useToast();
  const [notifications] = useState<Notification[]>(mockNotifications);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [channelFilters, setChannelFilters] = useState<string[]>([]);
  const [ackFilter, setAckFilter] = useState<AckFilterType>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

  const hasActiveFilters = searchQuery || statusFilter !== "all" || channelFilters.length > 0 || ackFilter !== "all" || dateFrom || dateTo;

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setChannelFilters([]);
    setAckFilter("all");
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const toggleChannelFilter = (channel: string) => {
    setChannelFilters(prev =>
      prev.includes(channel) ? prev.filter(c => c !== channel) : [...prev, channel]
    );
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = notification.title.toLowerCase().includes(query);
        const matchesMessage = notification.message.toLowerCase().includes(query);
        if (!matchesTitle && !matchesMessage) return false;
      }

      // Status filter
      if (statusFilter !== "all" && notification.status !== statusFilter) {
        return false;
      }

      // Channel filter
      if (channelFilters.length > 0) {
        const hasMatchingChannel = channelFilters.some(ch => 
          notification.channels.includes(ch as "email" | "sms" | "portal")
        );
        if (!hasMatchingChannel) return false;
      }

      // Acknowledgement filter
      if (ackFilter !== "all") {
        const ackCount = notification.acknowledgedBy?.length || 0;
        const totalRecipients = notification.recipients.length;
        const isComplete = ackCount === totalRecipients;
        const deadline = notification.acknowledgementSettings?.deadline 
          ? new Date(notification.acknowledgementSettings.deadline) 
          : null;
        const isOverdue = deadline && new Date() > deadline && ackCount < totalRecipients;

        switch (ackFilter) {
          case "required":
            if (!notification.requiresAcknowledgement) return false;
            break;
          case "not-required":
            if (notification.requiresAcknowledgement) return false;
            break;
          case "complete":
            if (!notification.requiresAcknowledgement || !isComplete) return false;
            break;
          case "pending":
            if (!notification.requiresAcknowledgement || isComplete) return false;
            break;
          case "overdue":
            if (!isOverdue) return false;
            break;
        }
      }

      // Date range filter
      if (dateFrom && isBefore(notification.sentAt, startOfDay(dateFrom))) {
        return false;
      }
      if (dateTo && isAfter(notification.sentAt, endOfDay(dateTo))) {
        return false;
      }

      return true;
    });
  }, [notifications, searchQuery, statusFilter, channelFilters, ackFilter, dateFrom, dateTo]);

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email":
        return <Mail className="w-3 h-3" />;
      case "sms":
        return <MessageSquare className="w-3 h-3" />;
      case "portal":
        return <Bell className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return (
          <Badge className="bg-success/10 text-success border-success/20 border">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Sent
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-warning/10 text-warning border-warning/20 border">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-destructive/10 text-destructive border-destructive/20 border">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleViewDetails = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
  };

  const handleSendReminder = (notification: Notification) => {
    const unacknowledged = notification.recipients.filter(
      (r) => !notification.acknowledgedBy?.includes(r)
    );
    toast({
      title: "Reminder Sent",
      description: `Reminder sent to ${unacknowledged.length} recipient(s) who haven't acknowledged.`,
    });
  };

  const handleDownloadCSV = (notification: Notification) => {
    const responses = notification.acknowledgementResponses || [];
    const responseMap = new Map(responses.map(r => [r.recipientName, r]));
    
    // CSV header
    const headers = ["Recipient", "Status", "Response", "Comments", "Response Time"];
    
    // Build rows for all recipients
    const rows = notification.recipients.map(recipient => {
      const response = responseMap.get(recipient);
      if (response) {
        return [
          recipient,
          "Responded",
          response.selectedOption,
          response.comment || "",
          format(new Date(response.respondedAt), "yyyy-MM-dd HH:mm:ss")
        ];
      } else {
        return [
          recipient,
          "Pending",
          "",
          "",
          ""
        ];
      }
    });

    // Escape CSV values
    const escapeCSV = (value: string) => {
      if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    // Build CSV content
    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map(row => row.map(escapeCSV).join(","))
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${notification.title.replace(/[^a-z0-9]/gi, "_")}_responses.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "CSV Downloaded",
      description: `Response summary for "${notification.title}" has been downloaded.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg">
                <Bell className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Notification History</h1>
                <p className="text-muted-foreground">
                  View all sent communications and track acknowledgements
                </p>
              </div>
            </div>
            <Link to="/">
              <Button className="gap-2">
                <Send className="w-4 h-4" />
                Compose New
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-lg border border-border bg-card">
            <p className="text-sm text-muted-foreground">Total Sent</p>
            <p className="text-2xl font-bold">{notifications.length}</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card">
            <p className="text-sm text-muted-foreground">Requires Acknowledgement</p>
            <p className="text-2xl font-bold">
              {notifications.filter((n) => n.requiresAcknowledgement).length}
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-warning">
              {notifications.filter((n) => n.status === "pending").length}
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card">
            <p className="text-sm text-muted-foreground">This Week</p>
            <p className="text-2xl font-bold">
              {notifications.filter((n) => n.sentAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 p-4 rounded-lg border border-border bg-card space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Filter className="w-4 h-4" />
            Search & Filters
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search title or message..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Acknowledgement Filter */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Acknowledgement</Label>
              <Select value={ackFilter} onValueChange={(v) => setAckFilter(v as AckFilterType)}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="required">Required</SelectItem>
                  <SelectItem value="not-required">Not Required</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                  <SelectItem value="pending">Pending Responses</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Channel Filter */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Channels</Label>
              <div className="flex gap-2">
                {["email", "sms", "portal"].map((channel) => (
                  <Button
                    key={channel}
                    type="button"
                    variant={channelFilters.includes(channel) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleChannelFilter(channel)}
                    className="gap-1 capitalize"
                  >
                    {getChannelIcon(channel)}
                    {channel}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Date From</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "w-[140px] justify-start text-left font-normal",
                      !dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "PP") : "From"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Date To</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "w-[140px] justify-start text-left font-normal",
                      !dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "PP") : "To"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground"
              >
                <X className="w-4 h-4 mr-1" />
                Clear filters
              </Button>
            )}

            <div className="ml-auto text-sm text-muted-foreground">
              Showing {filteredNotifications.length} of {notifications.length} notifications
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Title</TableHead>
                <TableHead>Channels</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Acknowledgement</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotifications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No notifications match your filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredNotifications.map((notification) => {
                  const ackCount = notification.acknowledgedBy?.length || 0;
                  const totalRecipients = notification.recipients.length;
                  const needsReminder =
                    notification.requiresAcknowledgement && ackCount < totalRecipients;
                  const deadline = notification.acknowledgementSettings?.deadline 
                    ? new Date(notification.acknowledgementSettings.deadline) 
                    : null;
                  const isOverdue = deadline && new Date() > deadline && ackCount < totalRecipients;

                  return (
                    <TableRow key={notification.id}>
                      <TableCell className="font-medium">
                        <div className="max-w-[230px]">
                          <p className="truncate">{notification.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {notification.message.slice(0, 50)}...
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {notification.channels.map((channel) => (
                            <Badge
                              key={channel}
                              variant="secondary"
                              className="gap-1 text-xs"
                            >
                              {getChannelIcon(channel)}
                              {channel}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>{totalRecipients}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(notification.status)}</TableCell>
                      <TableCell>
                        {notification.requiresAcknowledgement ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  isOverdue ? "bg-destructive" : "bg-success"
                                )}
                                style={{
                                  width: `${(ackCount / totalRecipients) * 100}%`,
                                }}
                              />
                            </div>
                            <span className={cn(
                              "text-sm",
                              isOverdue ? "text-destructive" : "text-muted-foreground"
                            )}>
                              {ackCount}/{totalRecipients}
                            </span>
                            {isOverdue && (
                              <AlertTriangle className="w-3 h-3 text-destructive" />
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(notification.sentAt, "MMM d, h:mm a")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(notification)}
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {notification.requiresAcknowledgement && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadCSV(notification)}
                              title="Download responses CSV"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          {needsReminder && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSendReminder(notification)}
                              className={cn(
                                isOverdue 
                                  ? "text-destructive hover:text-destructive" 
                                  : "text-warning hover:text-warning"
                              )}
                              title="Send reminder"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <NotificationDetailModal
        notification={selectedNotification}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSendReminder={handleSendReminder}
      />
    </div>
  );
};

export default History;