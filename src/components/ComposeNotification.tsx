import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, MessageSquare, Bell, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Notification } from "./NotificationCenter";
import { RecipientSelector, type Employee } from "./RecipientSelector";

interface ComposeNotificationProps {
  onSend: (notification: Omit<Notification, "id" | "status" | "sentAt">) => void;
}

export const ComposeNotification = ({ onSend }: ComposeNotificationProps) => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [channels, setChannels] = useState<("email" | "sms" | "portal")[]>([]);
  const [requiresAcknowledgement, setRequiresAcknowledgement] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<Employee[]>([]);

  const handleChannelToggle = (channel: "email" | "sms" | "portal") => {
    setChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !message || channels.length === 0 || selectedRecipients.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select at least one channel and recipient.",
        variant: "destructive",
      });
      return;
    }

    const recipientNames = selectedRecipients.map((r) => r.name);

    onSend({
      title,
      message,
      channels,
      recipients: recipientNames,
      requiresAcknowledgement,
    });

    toast({
      title: "Notification Sent",
      description: `Your notification has been sent to ${recipientNames.length} recipient(s) via ${channels.join(", ")}.`,
    });

    // Reset form
    setTitle("");
    setMessage("");
    setChannels([]);
    setRequiresAcknowledgement(false);
    setSelectedRecipients([]);
  };

  return (
    <Card className="shadow-lg border-border/50">
      <CardHeader>
        <CardTitle>Compose New Notification</CardTitle>
        <CardDescription>
          Create and send a notification to your employees through multiple channels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Notification Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Team Meeting Tomorrow"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              placeholder="Enter your notification message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              required
            />
          </div>

          <div className="space-y-3">
            <Label>Delivery Channels *</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Card
                className={`cursor-pointer transition-all ${
                  channels.includes("email")
                    ? "border-primary bg-secondary/50"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => handleChannelToggle("email")}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <Checkbox checked={channels.includes("email")} />
                  <Mail className="w-5 h-5 text-primary" />
                  <span className="font-medium">Email</span>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${
                  channels.includes("sms")
                    ? "border-accent bg-secondary/50"
                    : "border-border hover:border-accent/50"
                }`}
                onClick={() => handleChannelToggle("sms")}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <Checkbox checked={channels.includes("sms")} />
                  <MessageSquare className="w-5 h-5 text-accent" />
                  <span className="font-medium">SMS</span>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${
                  channels.includes("portal")
                    ? "border-primary bg-secondary/50"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => handleChannelToggle("portal")}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <Checkbox checked={channels.includes("portal")} />
                  <Bell className="w-5 h-5 text-primary" />
                  <span className="font-medium">Portal</span>
                </CardContent>
              </Card>
            </div>
          </div>

          <RecipientSelector
            selectedRecipients={selectedRecipients}
            onRecipientsChange={setSelectedRecipients}
          />

          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
            <div className="space-y-0.5">
              <div className="text-base font-medium">
                Require Acknowledgement
              </div>
              <p className="text-sm text-muted-foreground">
                Employees must confirm they've read this notification
              </p>
            </div>
            <Switch
              checked={requiresAcknowledgement}
              onCheckedChange={setRequiresAcknowledgement}
            />
          </div>

          <Button type="submit" className="w-full" size="lg">
            <Send className="w-4 h-4 mr-2" />
            Send Notification
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
