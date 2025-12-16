import { useState } from "react";
import { Link } from "react-router-dom";
import { ComposeNotification } from "./ComposeNotification";
import { Bell, History } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface AcknowledgementSettings {
  required: boolean;
  responseOptions: string[];
  allowComments: boolean;
  deadline?: Date;
}

export interface AcknowledgementResponse {
  recipientName: string;
  selectedOption: string;
  comment?: string;
  respondedAt: Date;
}

export interface Notification {
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

export const NotificationCenter = () => {
  const handleSendNotification = (notification: Omit<Notification, "id" | "status" | "sentAt">) => {
    // In production, this would save to a database
    console.log("Notification sent:", notification);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg">
                <Bell className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Notification Center
                </h1>
                <p className="text-muted-foreground">
                  Send communications to your employees across multiple channels
                </p>
              </div>
            </div>
            <Link to="/history">
              <Button variant="outline" className="gap-2">
                <History className="w-4 h-4" />
                View History
              </Button>
            </Link>
          </div>
        </div>

        <ComposeNotification onSend={handleSendNotification} />
      </div>
    </div>
  );
};
