import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Bell, MessageSquare, Paperclip, X, Bold, Italic, Link, List } from "lucide-react";

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
  const emailFileInputRef = useRef<HTMLInputElement>(null);
  const portalFileInputRef = useRef<HTMLInputElement>(null);

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
    tag: string,
    wrapper?: { open: string; close: string }
  ) => {
    const content = channel === "email" ? messages.email.content : messages.portal.content;
    const newContent = wrapper
      ? `${content}${wrapper.open}${wrapper.close}`
      : `${content}<${tag}></${tag}>`;

    if (channel === "email") {
      updateEmailContent(newContent);
    } else {
      updatePortalContent(newContent);
    }
  };

  const RichTextToolbar = ({ channel }: { channel: "email" | "portal" }) => (
    <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/30">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0"
        onClick={() => insertHtmlTag(channel, "strong", { open: "<strong>", close: "</strong>" })}
        title="Bold"
      >
        <Bold className="w-3.5 h-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0"
        onClick={() => insertHtmlTag(channel, "em", { open: "<em>", close: "</em>" })}
        title="Italic"
      >
        <Italic className="w-3.5 h-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0"
        onClick={() =>
          insertHtmlTag(channel, "a", { open: '<a href="">', close: "</a>" })
        }
        title="Link"
      >
        <Link className="w-3.5 h-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0"
        onClick={() =>
          insertHtmlTag(channel, "ul", { open: "<ul>\n  <li>", close: "</li>\n</ul>" })
        }
        title="List"
      >
        <List className="w-3.5 h-3.5" />
      </Button>
      <span className="text-xs text-muted-foreground ml-2">HTML supported</span>
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

  // If only one channel, show directly without tabs
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
          <Label className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-accent" />
            SMS Message *
          </Label>
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

  // Multiple channels - use tabs
  return (
    <div className="space-y-3">
      <Label>Channel Messages *</Label>
      <Tabs defaultValue={channels[0]} className="w-full">
        <TabsList className="w-full justify-start">
          {channels.includes("email") && (
            <TabsTrigger value="email" className="gap-2">
              <Mail className="w-4 h-4" />
              Email
            </TabsTrigger>
          )}
          {channels.includes("portal") && (
            <TabsTrigger value="portal" className="gap-2">
              <Bell className="w-4 h-4" />
              Portal
            </TabsTrigger>
          )}
          {channels.includes("sms") && (
            <TabsTrigger value="sms" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              SMS
            </TabsTrigger>
          )}
        </TabsList>

        {channels.includes("email") && (
          <TabsContent value="email" className="space-y-3 mt-4">
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
          </TabsContent>
        )}

        {channels.includes("portal") && (
          <TabsContent value="portal" className="space-y-3 mt-4">
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
          </TabsContent>
        )}

        {channels.includes("sms") && (
          <TabsContent value="sms" className="space-y-3 mt-4">
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
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
