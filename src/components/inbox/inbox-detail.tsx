"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, Avatar } from "@/components/ui/misc";
import { ArrowLeft, Sparkles, Send, Edit3, Check, X } from "lucide-react";

interface EmailData {
  id: string;
  from: string;
  fromName: string;
  subject: string;
  snippet: string;
  date: string;
  aiStatus: string;
  aiConfidence: number;
  clientName: string | null;
  eventType: string | null;
  isUnread: boolean;
}

// AI 草拟的回复（演示用）
const DEMO_AI_REPLY = {
  subject: "Re: Wedding photography inquiry — October 2026",
  body: `Hi Sarah,

Thank you so much for reaching out — I absolutely love that you found me through Instagram! Your wedding at The Garden House in October sounds like a dream. Fall weddings there are truly magical with the autumn colors.

I'm available on October 24, 2026, and I'd love to chat more about your vision for the day.

I've put together a personalized proposal with my wedding packages and pricing. You can view it here:

[Proposal Link Will Be Here]

In the meantime, here's a quick overview:
• 8-hour coverage: $4,200
• 10-hour coverage: $5,200
• Both include an engagement session, online gallery, and high-resolution downloads

Would you like to hop on a quick 15-minute call this week to discuss the details? I'm available Tuesday or Thursday afternoon.

Looking forward to hearing from you!

Warmly,
[Photographer Name]
Lightmeter Photography`,
  confidence: 92,
};

// AI 提取的客户信息（演示用）
const DEMO_EXTRACTED_INFO = {
  name: "Sarah Johnson",
  partnerName: "Michael Torres",
  weddingDate: "2026-10-24",
  eventType: "Wedding",
  budget: "$4,000–$5,000",
  location: "The Garden House, San Francisco",
  referralSource: "Instagram",
};

export function InboxDetail({
  email,
  onBack,
}: {
  email: EmailData;
  onBack: () => void;
}) {
  const [aiReply, setAiReply] = useState(DEMO_AI_REPLY);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBody, setEditedBody] = useState(aiReply.body);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const canAutoSend = aiReply.confidence >= 90;

  const handleSend = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSent(true);
      // 自动返回列表
      setTimeout(() => onBack(), 2000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* 返回按钮 */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Inbox
      </button>

      {/* 原始邮件 */}
      <Card padding="lg">
        <div className="flex items-start gap-4 mb-4">
          <Avatar name={email.fromName} size="lg" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-heading font-semibold">
                {email.fromName}
              </h2>
              <Badge variant="success">{email.eventType}</Badge>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {email.from}
            </p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
              {email.date}
            </p>
          </div>
        </div>

        <h3 className="text-base font-medium mb-3">{email.subject}</h3>

        <div className="prose prose-sm prose-invert max-w-none">
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            {email.snippet}
          </p>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mt-3">
            We&apos;re planning a wedding for October 24, 2026 at The Garden
            House in San Francisco. We love your natural, candid style. Our
            budget is around $4,000–$5,000. Do you have availability for that
            date? Would love to see your pricing and packages!
          </p>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mt-3">
            Thanks,
            <br />
            Sarah
          </p>
        </div>

        {/* AI 提取的信息 */}
        <div className="mt-4 p-3 rounded-lg bg-[var(--color-bg-overlay)] border border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">
              AI Extracted Info
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-[var(--color-text-disabled)]">Name</span>
              <p className="text-[var(--color-text-primary)] font-medium">
                {DEMO_EXTRACTED_INFO.name}
              </p>
            </div>
            <div>
              <span className="text-[var(--color-text-disabled)]">Date</span>
              <p className="text-[var(--color-text-primary)] font-medium">
                {DEMO_EXTRACTED_INFO.weddingDate}
              </p>
            </div>
            <div>
              <span className="text-[var(--color-text-disabled)]">Budget</span>
              <p className="text-[var(--color-text-primary)] font-medium">
                {DEMO_EXTRACTED_INFO.budget}
              </p>
            </div>
            <div>
              <span className="text-[var(--color-text-disabled)]">Venue</span>
              <p className="text-[var(--color-text-primary)] font-medium">
                {DEMO_EXTRACTED_INFO.location}
              </p>
            </div>
            <div>
              <span className="text-[var(--color-text-disabled)]">Source</span>
              <p className="text-[var(--color-text-primary)] font-medium">
                {DEMO_EXTRACTED_INFO.referralSource}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* AI 草拟回复 */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
            <h3 className="text-base font-heading font-semibold">
              AI Drafted Reply
            </h3>
            {canAutoSend && (
              <Badge variant="success">
                <Check className="w-3 h-3 mr-0.5" />
                Ready to send
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                Edit
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setEditedBody(aiReply.body);
                }}
              >
                <X className="w-3.5 h-3.5 mr-1.5" />
                Cancel
              </Button>
            )}
          </div>
        </div>

        {/* 主题 */}
        <div className="mb-3">
          <span className="text-xs text-[var(--color-text-disabled)]">
            Subject
          </span>
          <p className="text-sm text-[var(--color-text-primary)]">
            {aiReply.subject}
          </p>
        </div>

        {/* 正文 */}
        {isEditing ? (
          <textarea
            className="w-full h-64 p-4 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-overlay)] text-sm text-[var(--color-text-primary)] resize-none focus:outline-none focus:border-[var(--color-accent)]"
            value={editedBody}
            onChange={(e) => setEditedBody(e.target.value)}
          />
        ) : (
          <div className="p-4 rounded-lg bg-[var(--color-bg-overlay)] border border-[var(--color-border-subtle)]">
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">
              {editedBody}
            </p>
          </div>
        )}

        {/* 发送按钮 / 发送中 / 成功 */}
        {sent ? (
          <div className="send-success-exit flex items-center justify-center mt-4 p-6 rounded-xl bg-[var(--color-success-bg)] border border-[var(--color-success)]/30">
            <div className="text-center">
              <div className="send-success-check w-14 h-14 mx-auto mb-3 rounded-full bg-[var(--color-success)] flex items-center justify-center">
                <Check className="w-7 h-7 text-white" />
              </div>
              <p className="text-base font-semibold text-[var(--color-success)]">Reply sent!</p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">Returning to inbox…</p>
            </div>
          </div>
        ) : isSending ? (
          <div className="flex items-center justify-center mt-4 p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-[var(--color-gold)]/20" />
                <div className="absolute inset-0 rounded-full border-2 border-t-[var(--color-gold)] animate-spin" />
                <span className="envelope-fly absolute text-lg">✉️</span>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">Sending reply…</p>
                <p className="text-xs text-[var(--color-text-secondary)]">Please wait a moment</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-[var(--color-text-disabled)]">
              Confidence: {aiReply.confidence}% —{" "}
              {canAutoSend
                ? "This draft is ready to send as-is"
                : "Please review before sending"}
            </p>
            <Button
              size="md"
              onClick={handleSend}
            >
              <Send className="w-4 h-4 mr-2" />
              Send Reply
            </Button>
          </div>
        )}
      </Card>

      {/* 快速操作 */}
      <div className="flex items-center gap-3">
        <Button variant="secondary" size="sm">
          Create Proposal Link
        </Button>
        <Button variant="ghost" size="sm">
          Add to Clients
        </Button>
      </div>
    </div>
  );
}
