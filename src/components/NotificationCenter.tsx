import { useState } from "react";
import { ComposeNotification } from "./ComposeNotification";
import { NotificationsList } from "./NotificationsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Send, History } from "lucide-react";

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

export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Team Meeting Tomorrow",
      message: "Don't forget our quarterly review meeting at 10 AM in Conference Room B.",
      channels: ["email", "portal"],
      recipients: ["All Employees"],
      requiresAcknowledgement: true,
      status: "sent",
      sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      acknowledgedBy: ["12", "45", "67"],
    },
    {
      id: "2",
      title: "System Maintenance Alert",
      message: "The employee portal will be down for maintenance on Saturday from 2-4 AM.",
      channels: ["email", "sms", "portal"],
      recipients: ["IT Department", "Operations Team"],
      requiresAcknowledgement: false,
      status: "sent",
      sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      id: "3",
      title: "Policy Update Required",
      message: "Please review and acknowledge the updated remote work policy in the employee handbook.",
      channels: ["portal"],
      recipients: ["All Employees"],
      requiresAcknowledgement: true,
      status: "sent",
      sentAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
      acknowledgedBy: ["12", "23", "34", "45"],
    },
  ]);

  const handleSendNotification = (notification: Omit<Notification, "id" | "status" | "sentAt">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      status: "sent",
      sentAt: new Date(),
    };
    setNotifications([newNotification, ...notifications]);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg">
              <Bell className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Notification Center
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Send and manage communications to your employees across multiple channels
          </p>
        </div>

        <Tabs defaultValue="compose" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="compose" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Compose
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="mt-0">
            <ComposeNotification onSend={handleSendNotification} />
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <NotificationsList notifications={notifications} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
