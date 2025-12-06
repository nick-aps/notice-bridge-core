import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Send, ArrowLeft, Eye, RefreshCw, Mail, MessageSquare, CheckCircle2, Clock, XCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { format } from "date-fns";

export interface Notification {
  id: string;
  title: string;
  message: string;
  channels: ("email" | "sms" | "portal")[];
  recipients: string[];
  requiresAcknowledgement: boolean;
  status: "sent" | "pending" | "failed";
  sentAt: Date;
  acknowledgedBy?: string[];
}

// Mock data - in production this would come from a database
const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Team Meeting Tomorrow",
    message: "Don't forget our quarterly review meeting at 10 AM in Conference Room B. Please bring your progress reports and any questions you may have for the leadership team.",
    channels: ["email", "portal"],
    recipients: ["Alice Johnson", "Bob Smith", "Carol Williams", "David Brown", "Eva Martinez"],
    requiresAcknowledgement: true,
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
    status: "pending",
    sentAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
];

const History = () => {
  const { toast } = useToast();
  const [notifications] = useState<Notification[]>(mockNotifications);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
              {notifications.map((notification) => {
                const ackCount = notification.acknowledgedBy?.length || 0;
                const totalRecipients = notification.recipients.length;
                const needsReminder =
                  notification.requiresAcknowledgement && ackCount < totalRecipients;

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
                              className="h-full bg-success rounded-full transition-all"
                              style={{
                                width: `${(ackCount / totalRecipients) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {ackCount}/{totalRecipients}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(notification.sentAt, "MMM d, h:mm a")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(notification)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {needsReminder && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSendReminder(notification)}
                            className="text-warning hover:text-warning"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
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
