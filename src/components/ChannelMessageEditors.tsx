import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Mail, Bell, MessageSquare, Paperclip, X, Bold, Italic, Link, List, Database, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChannelMessages {
  email: { content: string; attachments: File[] };
  portal: { content: string; attachments: File[] };
  sms: { content: string };
}

interface ChannelMessageEditorsProps {
  channels: ("email" | "sms" | "portal")[];
  messages: ChannelMessages;
  onMessagesChange: (messages: ChannelMessages) => void;
}

const SMS_CHAR_LIMIT = 160;

export const ChannelMessageEditors = ({
  channels,
  messages,
  onMessagesChange,
}: ChannelMessageEditorsProps) => {
  const [activeTab, setActiveTab] = useState<"email" | "sms" | "portal">(channels[0] || "email");
  const emailFileInputRef = useRef<HTMLInputElement>(null);
  const portalFileInputRef = useRef<HTMLInputElement>(null);

  // Ensure active tab is valid when channels change
  const validActiveTab = channels.includes(activeTab) ? activeTab : channels[0];

  if (channels.length === 0) {
    return (
      <div className="p-6 text-center border border-dashed border-border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">
          Select at least one delivery channel above to compose your message
        </p>
      </div>
    );
  }

  const updateEmailContent = (content: string) => {
    onMessagesChange({
      ...messages,
      email: { ...messages.email, content },
    });
  };

  const updatePortalContent = (content: string) => {
    onMessagesChange({
      ...messages,
      portal: { ...messages.portal, content },
    });
  };

  const updateSmsContent = (content: string) => {
    if (content.length <= SMS_CHAR_LIMIT) {
      onMessagesChange({
        ...messages,
        sms: { content },
      });
    }
  };

  const handleEmailAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onMessagesChange({
      ...messages,
      email: {
        ...messages.email,
        attachments: [...messages.email.attachments, ...files],
      },
    });
    e.target.value = "";
  };

  const handlePortalAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onMessagesChange({
      ...messages,
      portal: {
        ...messages.portal,
        attachments: [...messages.portal.attachments, ...files],
      },
    });
    e.target.value = "";
  };

  const removeEmailAttachment = (index: number) => {
    onMessagesChange({
      ...messages,
      email: {
        ...messages.email,
        attachments: messages.email.attachments.filter((_, i) => i !== index),
      },
    });
  };

  const removePortalAttachment = (index: number) => {
    onMessagesChange({
      ...messages,
      portal: {
        ...messages.portal,
        attachments: messages.portal.attachments.filter((_, i) => i !== index),
      },
    });
  };

  const insertHtmlTag = (
    channel: "email" | "portal",
    wrapper: { open: string; close: string }
  ) => {
    const content = channel === "email" ? messages.email.content : messages.portal.content;
    const newContent = `${content}${wrapper.open}${wrapper.close}`;

    if (channel === "email") {
      updateEmailContent(newContent);
    } else {
      updatePortalContent(newContent);
    }
  };

  const insertPlaceholder = (channel: "email" | "portal" | "sms", placeholder: string) => {
    const tag = `{{${placeholder}}}`;
    if (channel === "email") {
      updateEmailContent(messages.email.content + tag);
    } else if (channel === "portal") {
      updatePortalContent(messages.portal.content + tag);
    } else {
      const newContent = messages.sms.content + tag;
      if (newContent.length <= SMS_CHAR_LIMIT) {
        updateSmsContent(newContent);
      }
    }
  };

  const availableFields = [
    { key: "name", label: "Full Name", description: "Employee's full name" },
    { key: "first_name", label: "First Name", description: "Employee's first name" },
    { key: "last_name", label: "Last Name", description: "Employee's last name" },
    { key: "email", label: "Email", description: "Employee's email address" },
    { key: "role", label: "Role", description: "Job title or role" },
    { key: "department", label: "Department", description: "Department name" },
    { key: "location", label: "Location", description: "Office location" },
    { key: "manager", label: "Manager", description: "Direct manager's name" },
    { key: "employee_id", label: "Employee ID", description: "Unique employee identifier" },
    { key: "start_date", label: "Start Date", description: "Employment start date" },
  ];

  const FieldPlaceholderButton = ({ channel }: { channel: "email" | "portal" | "sms" }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 gap-1 text-xs"
        >
          <Database className="w-3.5 h-3.5" />
          Insert Field
          <ChevronDown className="w-3 h-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2 bg-popover" align="start">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground px-2 py-1">
            Database Fields
          </p>
          {availableFields.map((field) => (
            <button
              key={field.key}
              type="button"
              onClick={() => insertPlaceholder(channel, field.key)}
              className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-muted flex items-center justify-between group"
            >
              <div>
                <span className="font-medium">{field.label}</span>
                <p className="text-xs text-muted-foreground">{field.description}</p>
              </div>
              <code className="text-xs bg-muted px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {`{{${field.key}}}`}
              </code>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );

  const RichTextToolbar = ({ channel }: { channel: "email" | "portal" }) => (
    <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/30 flex-wrap">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0"
        onClick={() => insertHtmlTag(channel, { open: "<strong>", close: "</strong>" })}
        title="Bold"
      >
        <Bold className="w-3.5 h-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0"
        onClick={() => insertHtmlTag(channel, { open: "<em>", close: "</em>" })}
        title="Italic"
      >
        <Italic className="w-3.5 h-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0"
        onClick={() => insertHtmlTag(channel, { open: '<a href="">', close: "</a>" })}
        title="Link"
      >
        <Link className="w-3.5 h-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0"
        onClick={() => insertHtmlTag(channel, { open: "<ul>\n  <li>", close: "</li>\n</ul>" })}
        title="List"
      >
        <List className="w-3.5 h-3.5" />
      </Button>
      <div className="w-px h-5 bg-border mx-1" />
      <FieldPlaceholderButton channel={channel} />
      <span className="text-xs text-muted-foreground ml-auto">HTML supported</span>
    </div>
  );

  const AttachmentSection = ({
    attachments,
    onRemove,
    onAdd,
    inputRef,
  }: {
    attachments: File[];
    onRemove: (index: number) => void;
    onAdd: (e: React.ChangeEvent<HTMLInputElement>) => void;
    inputRef: React.RefObject<HTMLInputElement>;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          className="gap-2"
        >
          <Paperclip className="w-4 h-4" />
          Add Attachment
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={onAdd}
          className="hidden"
        />
      </div>
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <Badge key={index} variant="secondary" className="gap-1 py-1">
              <Paperclip className="w-3 h-3" />
              {file.name}
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );

  // Single channel - show directly
  if (channels.length === 1) {
    const channel = channels[0];

    if (channel === "email") {
      return (
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            Email Message *
          </Label>
          <Card className="overflow-hidden">
            <RichTextToolbar channel="email" />
            <Textarea
              placeholder="Compose your email message with HTML formatting..."
              value={messages.email.content}
              onChange={(e) => updateEmailContent(e.target.value)}
              rows={6}
              className="border-0 rounded-none focus-visible:ring-0"
            />
          </Card>
          <AttachmentSection
            attachments={messages.email.attachments}
            onRemove={removeEmailAttachment}
            onAdd={handleEmailAttachment}
            inputRef={emailFileInputRef}
          />
        </div>
      );
    }

    if (channel === "portal") {
      return (
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            Portal Message *
          </Label>
          <Card className="overflow-hidden">
            <RichTextToolbar channel="portal" />
            <Textarea
              placeholder="Compose your portal notification with HTML formatting..."
              value={messages.portal.content}
              onChange={(e) => updatePortalContent(e.target.value)}
              rows={6}
              className="border-0 rounded-none focus-visible:ring-0"
            />
          </Card>
          <AttachmentSection
            attachments={messages.portal.attachments}
            onRemove={removePortalAttachment}
            onAdd={handlePortalAttachment}
            inputRef={portalFileInputRef}
          />
        </div>
      );
    }

    if (channel === "sms") {
      const remaining = SMS_CHAR_LIMIT - messages.sms.content.length;
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-accent" />
              SMS Message *
            </Label>
            <FieldPlaceholderButton channel="sms" />
          </div>
          <div className="relative">
            <Textarea
              placeholder="Enter SMS message (max 160 characters)..."
              value={messages.sms.content}
              onChange={(e) => updateSmsContent(e.target.value)}
              rows={3}
              maxLength={SMS_CHAR_LIMIT}
            />
            <div
              className={`absolute bottom-2 right-2 text-xs ${
                remaining < 20 ? "text-warning" : "text-muted-foreground"
              }`}
            >
              {remaining} characters remaining
            </div>
          </div>
        </div>
      );
    }
  }

  // Multiple channels - use custom tabs (no Radix)
  return (
    <div className="space-y-3">
      <Label>Channel Messages *</Label>
      
      {/* Custom Tab List */}
      <div className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground">
        {channels.includes("email") && (
          <button
            type="button"
            onClick={() => setActiveTab("email")}
            className={cn(
              "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all",
              validActiveTab === "email"
                ? "bg-background text-foreground shadow-sm"
                : "hover:bg-background/50"
            )}
          >
            <Mail className="w-4 h-4" />
            Email
          </button>
        )}
        {channels.includes("portal") && (
          <button
            type="button"
            onClick={() => setActiveTab("portal")}
            className={cn(
              "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all",
              validActiveTab === "portal"
                ? "bg-background text-foreground shadow-sm"
                : "hover:bg-background/50"
            )}
          >
            <Bell className="w-4 h-4" />
            Portal
          </button>
        )}
        {channels.includes("sms") && (
          <button
            type="button"
            onClick={() => setActiveTab("sms")}
            className={cn(
              "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all",
              validActiveTab === "sms"
                ? "bg-background text-foreground shadow-sm"
                : "hover:bg-background/50"
            )}
          >
            <MessageSquare className="w-4 h-4" />
            SMS
          </button>
        )}
      </div>

      {/* Tab Content */}
      {validActiveTab === "email" && channels.includes("email") && (
        <div className="space-y-3 mt-4">
          <Card className="overflow-hidden">
            <RichTextToolbar channel="email" />
            <Textarea
              placeholder="Compose your email message with HTML formatting..."
              value={messages.email.content}
              onChange={(e) => updateEmailContent(e.target.value)}
              rows={6}
              className="border-0 rounded-none focus-visible:ring-0"
            />
          </Card>
          <AttachmentSection
            attachments={messages.email.attachments}
            onRemove={removeEmailAttachment}
            onAdd={handleEmailAttachment}
            inputRef={emailFileInputRef}
          />
        </div>
      )}

      {validActiveTab === "portal" && channels.includes("portal") && (
        <div className="space-y-3 mt-4">
          <Card className="overflow-hidden">
            <RichTextToolbar channel="portal" />
            <Textarea
              placeholder="Compose your portal notification with HTML formatting..."
              value={messages.portal.content}
              onChange={(e) => updatePortalContent(e.target.value)}
              rows={6}
              className="border-0 rounded-none focus-visible:ring-0"
            />
          </Card>
          <AttachmentSection
            attachments={messages.portal.attachments}
            onRemove={removePortalAttachment}
            onAdd={handlePortalAttachment}
            inputRef={portalFileInputRef}
          />
        </div>
      )}

      {validActiveTab === "sms" && channels.includes("sms") && (
        <div className="space-y-3 mt-4">
          <div className="flex justify-end">
            <FieldPlaceholderButton channel="sms" />
          </div>
          <div className="relative">
            <Textarea
              placeholder="Enter SMS message (max 160 characters)..."
              value={messages.sms.content}
              onChange={(e) => updateSmsContent(e.target.value)}
              rows={3}
              maxLength={SMS_CHAR_LIMIT}
            />
            <div
              className={`absolute bottom-2 right-2 text-xs ${
                SMS_CHAR_LIMIT - messages.sms.content.length < 20
                  ? "text-warning"
                  : "text-muted-foreground"
              }`}
            >
              {SMS_CHAR_LIMIT - messages.sms.content.length} characters remaining
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            SMS messages are limited to 160 characters. No HTML or attachments supported.
          </p>
        </div>
      )}
    </div>
  );
};
