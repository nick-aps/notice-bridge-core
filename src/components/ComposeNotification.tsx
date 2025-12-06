import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, MessageSquare, Bell, Send, Save, TestTube, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Notification } from "./NotificationCenter";
import { RecipientSelector, type Employee } from "./RecipientSelector";
import { ChannelMessageEditors, type ChannelMessages } from "./ChannelMessageEditors";

interface ComposeNotificationProps {
  onSend: (notification: Omit<Notification, "id" | "status" | "sentAt">) => void;
}

interface Draft {
  id: string;
  title: string;
  channels: ("email" | "sms" | "portal")[];
  channelMessages: ChannelMessages;
  recipients: Employee[];
  requiresAcknowledgement: boolean;
  savedAt: string;
}

const initialMessages: ChannelMessages = {
  email: { content: "", attachments: [] },
  portal: { content: "", attachments: [] },
  sms: { content: "" },
};

const DRAFTS_STORAGE_KEY = "notification_drafts";

export const ComposeNotification = ({ onSend }: ComposeNotificationProps) => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [channels, setChannels] = useState<("email" | "sms" | "portal")[]>([]);
  const [channelMessages, setChannelMessages] = useState<ChannelMessages>(initialMessages);
  const [requiresAcknowledgement, setRequiresAcknowledgement] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<Employee[]>([]);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>([]);

  // Load drafts from localStorage
  useEffect(() => {
    const savedDrafts = localStorage.getItem(DRAFTS_STORAGE_KEY);
    if (savedDrafts) {
      try {
        setDrafts(JSON.parse(savedDrafts));
      } catch {
        console.error("Failed to parse drafts");
      }
    }
  }, []);

  const handleChannelToggle = (channel: "email" | "sms" | "portal") => {
    setChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
    );
  };

  const hasValidMessages = () => {
    return channels.every((channel) => {
      if (channel === "email") return channelMessages.email.content.trim().length > 0;
      if (channel === "portal") return channelMessages.portal.content.trim().length > 0;
      if (channel === "sms") return channelMessages.sms.content.trim().length > 0;
      return false;
    });
  };

  const hasAnyContent = () => {
    return (
      title.trim().length > 0 ||
      channelMessages.email.content.trim().length > 0 ||
      channelMessages.portal.content.trim().length > 0 ||
      channelMessages.sms.content.trim().length > 0
    );
  };

  const handleSaveDraft = () => {
    if (!hasAnyContent()) {
      toast({
        title: "Nothing to Save",
        description: "Please add a title or message content before saving.",
        variant: "destructive",
      });
      return;
    }

    const newDraft: Draft = {
      id: Date.now().toString(),
      title: title || "Untitled Draft",
      channels,
      channelMessages: {
        email: { content: channelMessages.email.content, attachments: [] },
        portal: { content: channelMessages.portal.content, attachments: [] },
        sms: { content: channelMessages.sms.content },
      },
      recipients: selectedRecipients,
      requiresAcknowledgement,
      savedAt: new Date().toISOString(),
    };

    const updatedDrafts = [newDraft, ...drafts.slice(0, 9)]; // Keep max 10 drafts
    setDrafts(updatedDrafts);
    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(updatedDrafts));

    toast({
      title: "Draft Saved",
      description: "Your notification has been saved as a draft.",
    });
  };

  const handleLoadDraft = (draft: Draft) => {
    setTitle(draft.title);
    setChannels(draft.channels);
    setChannelMessages(draft.channelMessages);
    setSelectedRecipients(draft.recipients);
    setRequiresAcknowledgement(draft.requiresAcknowledgement);

    toast({
      title: "Draft Loaded",
      description: `Loaded draft: "${draft.title}"`,
    });
  };

  const handleDeleteDraft = (draftId: string) => {
    const updatedDrafts = drafts.filter((d) => d.id !== draftId);
    setDrafts(updatedDrafts);
    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(updatedDrafts));

    toast({
      title: "Draft Deleted",
      description: "The draft has been removed.",
    });
  };

  const handleSendTestEmail = async () => {
    if (!channels.includes("email") || !channelMessages.email.content.trim()) {
      toast({
        title: "No Email Content",
        description: "Please select email channel and add email content to send a test.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingTest(true);

    // Simulate sending test email (in production, this would call an edge function)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSendingTest(false);

    toast({
      title: "Test Email Sent",
      description: "A test email has been sent to your email address (mock). Connect to Lovable Cloud to enable real email sending.",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || channels.length === 0 || selectedRecipients.length === 0 || !hasValidMessages()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields, select channels, add messages, and select recipients.",
        variant: "destructive",
      });
      return;
    }

    const recipientNames = selectedRecipients.map((r) => r.name);

    // Combine messages for storage (in production, would store separately per channel)
    const combinedMessage = channels
      .map((ch) => {
        if (ch === "email") return `[Email] ${channelMessages.email.content}`;
        if (ch === "portal") return `[Portal] ${channelMessages.portal.content}`;
        if (ch === "sms") return `[SMS] ${channelMessages.sms.content}`;
        return "";
      })
      .join("\n\n");

    onSend({
      title,
      message: combinedMessage,
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
    setChannels([]);
    setChannelMessages(initialMessages);
    setRequiresAcknowledgement(false);
    setSelectedRecipients([]);
  };

  const resetForm = () => {
    setTitle("");
    setChannels([]);
    setChannelMessages(initialMessages);
    setRequiresAcknowledgement(false);
    setSelectedRecipients([]);
  };

  return (
    <div className="space-y-6">
      {/* Drafts Section */}
      {drafts.length > 0 && (
        <Card className="border-dashed">
          <CardHeader className="py-4">
            <CardTitle className="text-base">Saved Drafts</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {drafts.map((draft) => (
                <div
                  key={draft.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm"
                >
                  <button
                    type="button"
                    onClick={() => handleLoadDraft(draft)}
                    className="hover:underline font-medium"
                  >
                    {draft.title}
                  </button>
                  <span className="text-xs text-muted-foreground">
                    {new Date(draft.savedAt).toLocaleDateString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteDraft(draft.id)}
                    className="text-muted-foreground hover:text-destructive ml-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Compose Card */}
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
                    <div>
                      <span className="font-medium">Email</span>
                      <p className="text-xs text-muted-foreground">HTML + Attachments</p>
                    </div>
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
                    <div>
                      <span className="font-medium">SMS</span>
                      <p className="text-xs text-muted-foreground">160 char limit</p>
                    </div>
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
                    <div>
                      <span className="font-medium">Portal</span>
                      <p className="text-xs text-muted-foreground">HTML + Attachments</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <ChannelMessageEditors
              channels={channels}
              messages={channelMessages}
              onMessagesChange={setChannelMessages}
            />

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

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button type="submit" className="flex-1" size="lg">
                <Send className="w-4 h-4 mr-2" />
                Send Notification
              </Button>
              
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleSaveDraft}
                  disabled={!hasAnyContent()}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleSendTestEmail}
                  disabled={!channels.includes("email") || !channelMessages.email.content.trim() || isSendingTest}
                >
                  {isSendingTest ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <TestTube className="w-4 h-4 mr-2" />
                  )}
                  Test Email
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
