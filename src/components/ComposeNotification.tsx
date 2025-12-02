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

interface ComposeNotificationProps {
  onSend: (notification: Omit<Notification, "id" | "status" | "sentAt">) => void;
}

export const ComposeNotification = ({ onSend }: ComposeNotificationProps) => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [channels, setChannels] = useState<("email" | "sms" | "portal")[]>([]);
  const [requiresAcknowledgement, setRequiresAcknowledgement] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);

  const recipientGroups = [
    { id: "all", label: "All Employees" },
    { id: "it", label: "IT Department" },
    { id: "ops", label: "Operations Team" },
    { id: "sales", label: "Sales Team" },
    { id: "hr", label: "HR Department" },
  ];

  const handleChannelToggle = (channel: "email" | "sms" | "portal") => {
    setChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
    );
  };

  const handleRecipientToggle = (recipientId: string) => {
    setSelectedRecipients((prev) =>
      prev.includes(recipientId) ? prev.filter((r) => r !== recipientId) : [...prev, recipientId]
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

    const recipientLabels = selectedRecipients.map(
      (id) => recipientGroups.find((g) => g.id === id)?.label || id
    );

    onSend({
      title,
      message,
      channels,
      recipients: recipientLabels,
      requiresAcknowledgement,
    });

    toast({
      title: "Notification Sent",
      description: `Your notification has been sent to ${recipientLabels.join(", ")} via ${channels.join(", ")}.`,
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

          <div className="space-y-3">
            <Label>Recipients *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {recipientGroups.map((group) => (
                <div key={group.id} className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id={group.id}
                    checked={selectedRecipients.includes(group.id)}
                    onCheckedChange={() => handleRecipientToggle(group.id)}
                  />
                  <label
                    htmlFor={group.id}
                    className="text-sm font-medium leading-none cursor-pointer flex-1 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {group.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
            <div className="space-y-0.5">
              <Label htmlFor="acknowledgement" className="text-base">
                Require Acknowledgement
              </Label>
              <p className="text-sm text-muted-foreground">
                Employees must confirm they've read this notification
              </p>
            </div>
            <Switch
              id="acknowledgement"
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
