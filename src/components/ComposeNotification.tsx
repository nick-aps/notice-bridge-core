import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Mail, MessageSquare, Bell, Send, Save, TestTube, Loader2, Clock, CalendarIcon, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
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
  const [deliveryType, setDeliveryType] = useState<"immediate" | "scheduled">("immediate");
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [scheduledTime, setScheduledTime] = useState("09:00");

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

  const handleSendTestNotification = async () => {
    if (channels.length === 0 || !hasValidMessages()) {
      toast({
        title: "No Content to Test",
        description: "Please select at least one channel and add message content.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingTest(true);

    // Simulate sending test notifications (in production, this would call edge functions)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSendingTest(false);

    const channelResults = channels.map((ch) => {
      if (ch === "email") return "📧 Email sent to your inbox";
      if (ch === "sms") return "📱 SMS sent to your phone";
      if (ch === "portal") return "🔔 Portal notification displayed";
      return "";
    });

    toast({
      title: "Test Notification Sent",
      description: (
        <div className="mt-2 space-y-1">
          {channelResults.map((result, i) => (
            <div key={i} className="text-sm">{result}</div>
          ))}
          <p className="text-xs text-muted-foreground mt-2">
            (Mock mode - Connect to Lovable Cloud for real delivery)
          </p>
        </div>
      ),
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

    if (deliveryType === "scheduled" && !scheduledDate) {
      toast({
        title: "Schedule Required",
        description: "Please select a date and time for scheduled delivery.",
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

    if (deliveryType === "scheduled" && scheduledDate) {
      const [hours, minutes] = scheduledTime.split(":").map(Number);
      const scheduledDateTime = new Date(scheduledDate);
      scheduledDateTime.setHours(hours, minutes);

      toast({
        title: "Notification Scheduled",
        description: `Your notification will be sent on ${format(scheduledDateTime, "PPP 'at' p")} to ${recipientNames.length} recipient(s).`,
      });
    } else {
      toast({
        title: "Notification Sent",
        description: `Your notification has been sent to ${recipientNames.length} recipient(s) via ${channels.join(", ")}.`,
      });
    }

    // Reset form
    setTitle("");
    setChannels([]);
    setChannelMessages(initialMessages);
    setRequiresAcknowledgement(false);
    setSelectedRecipients([]);
    setDeliveryType("immediate");
    setScheduledDate(undefined);
    setScheduledTime("09:00");
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

            {/* Delivery Time */}
            <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <Label className="text-base font-medium">Delivery Time</Label>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Card
                  className={cn(
                    "cursor-pointer transition-all",
                    deliveryType === "immediate"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => setDeliveryType("immediate")}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                      deliveryType === "immediate" ? "border-primary" : "border-muted-foreground"
                    )}>
                      {deliveryType === "immediate" && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <Zap className="w-5 h-5 text-primary" />
                    <div>
                      <span className="font-medium">Send Immediately</span>
                      <p className="text-xs text-muted-foreground">Deliver right away</p>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className={cn(
                    "cursor-pointer transition-all",
                    deliveryType === "scheduled"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => setDeliveryType("scheduled")}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                      deliveryType === "scheduled" ? "border-primary" : "border-muted-foreground"
                    )}>
                      {deliveryType === "scheduled" && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    <div>
                      <span className="font-medium">Schedule</span>
                      <p className="text-xs text-muted-foreground">Choose date & time</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {deliveryType === "scheduled" && (
                <div className="flex flex-wrap gap-3 pt-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-[200px] justify-start text-left font-normal",
                          !scheduledDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {scheduledDate ? format(scheduledDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-popover" align="start">
                      <Calendar
                        mode="single"
                        selected={scheduledDate}
                        onSelect={setScheduledDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>

                  <div className="flex items-center gap-2">
                    <Label htmlFor="time" className="text-sm text-muted-foreground">at</Label>
                    <Input
                      id="time"
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-[130px]"
                    />
                  </div>
                </div>
              )}
            </div>

            {(channels.includes("email") || channels.includes("portal")) && (
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
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button type="submit" className="flex-1" size="lg">
                {deliveryType === "scheduled" ? (
                  <>
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Schedule Notification
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Notification
                  </>
                )}
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
                  onClick={handleSendTestNotification}
                  disabled={channels.length === 0 || !hasValidMessages() || isSendingTest}
                >
                  {isSendingTest ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <TestTube className="w-4 h-4 mr-2" />
                  )}
                  Test Notification
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
