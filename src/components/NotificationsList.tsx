import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, Bell, CheckCircle2, Clock, XCircle } from "lucide-react";
import type { Notification } from "./NotificationCenter";
import { formatDistanceToNow } from "date-fns";

interface NotificationsListProps {
  notifications: Notification[];
}

export const NotificationsList = ({ notifications }: NotificationsListProps) => {
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email":
        return <Mail className="w-4 h-4" />;
      case "sms":
        return <MessageSquare className="w-4 h-4" />;
      case "portal":
        return <Bell className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case "email":
        return "bg-primary/10 text-primary";
      case "sms":
        return "bg-accent/10 text-accent";
      case "portal":
        return "bg-primary/10 text-primary";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case "pending":
        return <Clock className="w-4 h-4 text-warning" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-success/10 text-success border-success/20";
      case "pending":
        return "bg-warning/10 text-warning border-warning/20";
      case "failed":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notification History</h2>
          <p className="text-muted-foreground">View all sent notifications and their delivery status</p>
        </div>
        <Badge variant="secondary" className="text-base px-4 py-2">
          {notifications.length} Total
        </Badge>
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No notifications sent yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className="hover:shadow-md transition-all border-border/50"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{notification.title}</CardTitle>
                    <CardDescription className="text-base">
                      {notification.message}
                    </CardDescription>
                  </div>
                  <Badge className={`${getStatusColor(notification.status)} border`}>
                    {getStatusIcon(notification.status)}
                    <span className="ml-1 capitalize">{notification.status}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Channels</p>
                    <div className="flex flex-wrap gap-2">
                      {notification.channels.map((channel) => (
                        <Badge
                          key={channel}
                          variant="secondary"
                          className={`${getChannelColor(channel)} flex items-center gap-1`}
                        >
                          {getChannelIcon(channel)}
                          <span className="capitalize">{channel}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Recipients</p>
                    <div className="flex flex-wrap gap-2">
                      {notification.recipients.map((recipient, idx) => (
                        <Badge key={idx} variant="outline">
                          {recipient}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span>
                      Sent {formatDistanceToNow(notification.sentAt, { addSuffix: true })}
                    </span>
                    {notification.requiresAcknowledgement && (
                      <Badge variant="outline" className="border-primary/30">
                        Requires Acknowledgement
                      </Badge>
                    )}
                  </div>
                  {notification.requiresAcknowledgement && notification.acknowledgedBy && (
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      {notification.acknowledgedBy.length} acknowledged
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
