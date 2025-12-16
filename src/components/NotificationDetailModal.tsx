import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Mail, MessageSquare, Bell, CheckCircle2, XCircle, RefreshCw, Clock, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import type { AcknowledgementSettings, AcknowledgementResponse } from "./NotificationCenter";

interface Notification {
  id: string;
  title: string;
  message: string;
  channels: ("email" | "sms" | "portal")[];
  recipients: string[];
  requiresAcknowledgement: boolean;
  acknowledgementSettings?: AcknowledgementSettings;
  acknowledgementResponses?: AcknowledgementResponse[];
  status: "sent" | "pending" | "failed";
  sentAt: Date;
  acknowledgedBy?: string[];
}

interface NotificationDetailModalProps {
  notification: Notification | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSendReminder: (notification: Notification) => void;
}

export const NotificationDetailModal = ({
  notification,
  open,
  onOpenChange,
  onSendReminder,
}: NotificationDetailModalProps) => {
  if (!notification) return null;

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

  const acknowledgedRecipients = notification.acknowledgedBy || [];
  const unacknowledgedRecipients = notification.recipients.filter(
    (r) => !acknowledgedRecipients.includes(r)
  );
  const needsReminder =
    notification.requiresAcknowledgement && unacknowledgedRecipients.length > 0;

  const hasResponseOptions = notification.acknowledgementSettings?.responseOptions?.length;
  const responses = notification.acknowledgementResponses || [];

  // Group responses by selected option
  const responsesByOption = hasResponseOptions
    ? notification.acknowledgementSettings!.responseOptions.reduce((acc, option) => {
        acc[option] = responses.filter(r => r.selectedOption === option);
        return acc;
      }, {} as Record<string, AcknowledgementResponse[]>)
    : {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">{notification.title}</DialogTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            Sent {format(notification.sentAt, "MMMM d, yyyy 'at' h:mm a")}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Message */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Message</h3>
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <p className="whitespace-pre-wrap">{notification.message}</p>
              </div>
            </div>

            {/* Channels */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Delivery Channels</h3>
              <div className="flex gap-2">
                {notification.channels.map((channel) => (
                  <Badge key={channel} variant="secondary" className="gap-1 capitalize">
                    {getChannelIcon(channel)}
                    {channel}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Acknowledgement Settings Info */}
            {notification.requiresAcknowledgement && hasResponseOptions && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Acknowledgement Options</h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  {notification.acknowledgementSettings!.responseOptions.map((option, idx) => (
                    <Badge key={idx} variant="outline">
                      {option}
                    </Badge>
                  ))}
                </div>
                {notification.acknowledgementSettings!.allowComments && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    Comments enabled
                  </p>
                )}
              </div>
            )}

            {/* Recipients */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Recipients ({notification.recipients.length})
                </h3>
                {notification.requiresAcknowledgement && (
                  <Badge variant="outline" className="border-primary/30">
                    Acknowledgement Required
                  </Badge>
                )}
              </div>

              {notification.requiresAcknowledgement ? (
                hasResponseOptions && responses.length > 0 ? (
                  // Show responses grouped by option
                  <div className="space-y-4">
                    {Object.entries(responsesByOption).map(([option, optionResponses]) => (
                      <div key={option}>
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-success" />
                          <span className="text-sm font-medium">
                            {option} ({optionResponses.length})
                          </span>
                        </div>
                        {optionResponses.length > 0 ? (
                          <div className="space-y-2 ml-6">
                            {optionResponses.map((response, idx) => (
                              <div
                                key={idx}
                                className="p-2 rounded-md bg-success/5 border border-success/20"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">{response.recipientName}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(response.respondedAt), "MMM d, h:mm a")}
                                  </span>
                                </div>
                                {response.comment && (
                                  <p className="text-sm text-muted-foreground mt-1 italic">
                                    "{response.comment}"
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground ml-6">No responses</p>
                        )}
                      </div>
                    ))}

                    {/* Pending recipients */}
                    {unacknowledgedRecipients.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <XCircle className="w-4 h-4 text-warning" />
                          <span className="text-sm font-medium">
                            Pending ({unacknowledgedRecipients.length})
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 ml-6">
                          {unacknowledgedRecipients.map((recipient, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="bg-warning/10 text-warning border-warning/20"
                            >
                              <Clock className="w-3 h-3 mr-1" />
                              {recipient}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Simple acknowledged/not acknowledged view (legacy)
                  <div className="space-y-4">
                    {/* Acknowledged */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        <span className="text-sm font-medium">
                          Acknowledged ({acknowledgedRecipients.length})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {acknowledgedRecipients.length > 0 ? (
                          acknowledgedRecipients.map((recipient, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="bg-success/10 text-success border-success/20"
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              {recipient}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">None yet</span>
                        )}
                      </div>
                    </div>

                    {/* Not Acknowledged */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="w-4 h-4 text-warning" />
                        <span className="text-sm font-medium">
                          Pending ({unacknowledgedRecipients.length})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {unacknowledgedRecipients.length > 0 ? (
                          unacknowledgedRecipients.map((recipient, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="bg-warning/10 text-warning border-warning/20"
                            >
                              <Clock className="w-3 h-3 mr-1" />
                              {recipient}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">All acknowledged!</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex flex-wrap gap-2">
                  {notification.recipients.map((recipient, idx) => (
                    <Badge key={idx} variant="outline">
                      {recipient}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Reminder Action */}
            {needsReminder && (
              <>
                <Separator />
                <div className="p-4 rounded-lg bg-warning/5 border border-warning/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Send Reminder</p>
                      <p className="text-sm text-muted-foreground">
                        {unacknowledgedRecipients.length} recipient(s) haven't responded yet
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        onSendReminder(notification);
                        onOpenChange(false);
                      }}
                      className="gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Send Reminder
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};