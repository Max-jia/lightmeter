"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, Badge, Skeleton } from "@/components/ui/misc";
import { Mail, Zap, ChevronRight, Sparkles, Send, Edit3, Check, X, ArrowLeft, RefreshCw } from "lucide-react";
import { useApi } from "@/hooks/use-api";

// ============================================================
// TypeScript types matching the DB schema
// ============================================================
interface Email {
  id: string;
  from_address: string;
  subject: string;
  snippet: string;
  body_text?: string;
  received_at: string;
  status: "unread" | "read" | "draft_ready" | "sent" | "archived";
  ai_classification?: string;
  ai_confidence?: number;
  ai_draft_subject?: string;
  ai_draft_body?: string;
  ai_extracted_info?: { name?: string; eventType?: string; weddingDate?: string; location?: string; budget?: string; referralSource?: string; partnerName?: string };
  client_id?: string;
}

// ============================================================
// 收件箱主组件
// ============================================================
export function InboxClient() {
  const { call, loading: apiLoading } = useApi<any>();
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [gmailConnected, setGmailConnected] = useState<boolean | null>(null);
  const [fetching, setFetching] = useState(false);

  // 检查 Gmail 是否已连接 + 拉取邮件
  const fetchEmails = useCallback(async () => {
    setFetching(true);
    // 先尝试拉取最新邮件
    const fetchResult = await call("/api/emails/fetch");
    if (fetchResult?.error === "Gmail not connected") {
      setGmailConnected(false);
      setFetching(false);
      return;
    }
    // 拉取数据库中的邮件
    const res = await fetch("/api/emails/list");
    if (res.ok) {
      const data = await res.json();
      setEmails(data.emails || []);
      setGmailConnected(true);
    } else if (res.status === 400) {
      setGmailConnected(false);
    }
    setFetching(false);
  }, [call]);

  useEffect(() => {
    fetchEmails();
  }, []);

  // 处理单封邮件（调用 AI）
  const processEmail = async (emailId: string) => {
    const result = await call("/api/emails/process", {
      method: "POST",
      body: JSON.stringify({ emailId }),
    });
    if (result) {
      // 刷新列表
      fetchEmails();
    }
  };

  // 未连接 Gmail
  if (gmailConnected === false) {
    return (
      <Card className="text-center py-16 space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--color-bg-overlay)] flex items-center justify-center">
          <Mail className="w-8 h-8 text-[var(--color-text-secondary)]" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-heading font-semibold" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Connect your Gmail
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] max-w-md mx-auto">
            Darkroom needs access to your Gmail to read inquiries and draft replies. We only read email subjects and bodies.
          </p>
        </div>
        <a href="/api/gmail">
          <Button size="lg" variant="gold">
            <Mail className="w-4 h-4 mr-2" />
            Connect Gmail
          </Button>
        </a>
      </Card>
    );
  }

  // 加载中
  if (gmailConnected === null || fetching) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  // 邮件详情视图
  if (selectedEmail) {
    return <InboxDetailView email={selectedEmail} onBack={() => setSelectedEmail(null)} onRefresh={fetchEmails} />;
  }

  // 收件箱列表
  const draftsReady = emails.filter((e) => e.status === "draft_ready").length;
  const unread = emails.filter((e) => e.status === "unread").length;

  return (
    <div className="space-y-3">
      {/* 操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)]">
            <Sparkles className="w-4 h-4 text-[var(--color-gold)]" />
            <span className="text-[var(--color-text-secondary)]">
              <span className="text-[var(--color-text-primary)] font-medium">{draftsReady}</span> drafts ready
            </span>
          </div>
          {unread > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)]">
              <span className="text-[var(--color-text-secondary)]">
                <span className="text-[var(--color-text-primary)] font-medium">{unread}</span> unread
              </span>
            </div>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={fetchEmails} loading={fetching}>
          <RefreshCw className="w-4 h-4 mr-1.5" />
          Refresh
        </Button>
      </div>

      {/* 邮件列表 */}
      {emails.length === 0 ? (
        <Card className="text-center py-12 text-sm text-[var(--color-text-secondary)]">
          No emails yet. When a client emails you, they&apos;ll appear here.
        </Card>
      ) : (
        <div className="space-y-2">
          {emails.map((email) => (
            <button
              key={email.id}
              onClick={async () => {
                // 如果是未处理邮件，先触发 AI 处理
                if (email.status === "unread") {
                  await processEmail(email.id);
                }
                setSelectedEmail(email);
              }}
              className="w-full text-left"
            >
              <Card padding="md" className="flex items-center gap-4">
                <Avatar name={email.from_address} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{email.from_address}</span>
                    {email.status === "unread" && (
                      <span className="w-2 h-2 rounded-full bg-[var(--color-gold)] flex-shrink-0" />
                    )}
                    {email.ai_classification === "new_inquiry" && (
                      <Badge variant="gold">{email.ai_extracted_info?.eventType || "Lead"}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-[var(--color-text-primary)] truncate mt-0.5">
                    {email.subject}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] truncate mt-0.5">
                    {email.snippet}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {email.status === "draft_ready" && email.ai_confidence && (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[var(--color-gold-subtle)] border border-[var(--color-gold)]/20">
                      <Sparkles className="w-3 h-3 text-[var(--color-gold)]" />
                      <span className="text-xs text-[var(--color-gold)]">{email.ai_confidence}%</span>
                    </div>
                  )}
                  {email.status === "unread" && (
                    <span className="text-xs text-[var(--color-amber)]">Processing...</span>
                  )}
                  <span className="text-xs text-[var(--color-text-disabled)] w-16 text-right">
                    {email.received_at ? new Date(email.received_at).toLocaleDateString() : ""}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[var(--color-text-disabled)]" />
                </div>
              </Card>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// 邮件详情 + AI 草稿视图
// ============================================================
function InboxDetailView({
  email,
  onBack,
  onRefresh,
}: {
  email: Email;
  onBack: () => void;
  onRefresh: () => void;
}) {
  const { call, loading: apiLoading } = useApi<any>();
  const [isEditing, setIsEditing] = useState(false);
  const [editedBody, setEditedBody] = useState(email.ai_draft_body || "");
  const [editedSubject, setEditedSubject] = useState(email.ai_draft_subject || `Re: ${email.subject}`);
  const [sent, setSent] = useState(email.status === "sent");

  const handleSend = async () => {
    const result = await call("/api/emails/send", {
      method: "POST",
      body: JSON.stringify({
        emailId: email.id,
        subject: editedSubject,
        body: editedBody,
      }),
    });
    if (result?.success) {
      setSent(true);
      onRefresh();
    }
  };

  const extracted = email.ai_extracted_info;

  return (
    <div className="space-y-6">
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
          <Avatar name={email.from_address} size="lg" />
          <div className="flex-1">
            <h2 className="text-base font-heading font-semibold">{email.from_address}</h2>
            <h3 className="text-sm font-medium mt-0.5">{email.subject}</h3>
            <p className="text-xs text-[var(--color-text-disabled)] mt-1">
              {email.received_at ? new Date(email.received_at).toLocaleString() : ""}
            </p>
          </div>
        </div>
        <div className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">
          {email.body_text || email.snippet}
        </div>

        {/* AI 提取的信息 */}
        {extracted && extracted.name && (
          <div className="mt-4 p-3 rounded-xl bg-[var(--color-gold-subtle)] border border-[var(--color-gold)]/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-gold)]" />
              <span className="text-xs font-medium text-[var(--color-gold)]">AI Extracted Info</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              {extracted.name && <div><span className="text-[var(--color-text-disabled)]">Name</span><p className="text-[var(--color-text-primary)] font-medium">{extracted.name}</p></div>}
              {extracted.weddingDate && <div><span className="text-[var(--color-text-disabled)]">Date</span><p className="text-[var(--color-text-primary)] font-medium">{extracted.weddingDate}</p></div>}
              {extracted.budget && <div><span className="text-[var(--color-text-disabled)]">Budget</span><p className="text-[var(--color-text-primary)] font-medium">{extracted.budget}</p></div>}
              {extracted.location && <div><span className="text-[var(--color-text-disabled)]">Location</span><p className="text-[var(--color-text-primary)] font-medium">{extracted.location}</p></div>}
              {extracted.eventType && <div><span className="text-[var(--color-text-disabled)]">Type</span><p className="text-[var(--color-text-primary)] font-medium">{extracted.eventType}</p></div>}
              {extracted.referralSource && <div><span className="text-[var(--color-text-disabled)]">Source</span><p className="text-[var(--color-text-primary)] font-medium">{extracted.referralSource}</p></div>}
            </div>
          </div>
        )}
      </Card>

      {/* AI 草稿 / 已发送 */}
      {email.status !== "unread" && (
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--color-gold)]" />
              <h3 className="text-sm font-heading font-semibold">
                {sent ? "Sent" : "AI Drafted Reply"}
              </h3>
              {!sent && email.ai_confidence && email.ai_confidence >= 90 && (
                <Badge variant="success"><Check className="w-3 h-3 mr-0.5" />Ready to send</Badge>
              )}
            </div>
            {!sent && (
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit3 className="w-3.5 h-3.5 mr-1.5" />Edit
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => { setIsEditing(false); setEditedBody(email.ai_draft_body || ""); }}>
                    <X className="w-3.5 h-3.5 mr-1.5" />Cancel
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="mb-3">
            <span className="text-xs text-[var(--color-text-disabled)]">Subject</span>
            {isEditing ? (
              <input className="w-full mt-1 p-2 text-sm rounded-lg bg-[var(--color-bg-overlay)] border border-[var(--color-border-default)] text-[var(--color-text-primary)]" value={editedSubject} onChange={(e) => setEditedSubject(e.target.value)} />
            ) : (
              <p className="text-sm text-[var(--color-text-primary)] mt-1">{editedSubject}</p>
            )}
          </div>

          {isEditing ? (
            <textarea className="w-full h-64 p-4 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] text-sm resize-none focus:outline-none focus:border-[var(--color-gold)]" value={editedBody} onChange={(e) => setEditedBody(e.target.value)} />
          ) : (
            <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">{editedBody || "No draft available. Click 'AI Process' to generate one."}</p>
            </div>
          )}

          {!sent && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-[var(--color-text-disabled)]">
                Confidence: {email.ai_confidence || "?"}%
              </p>
              <Button size="md" variant="gold" loading={apiLoading} onClick={handleSend} disabled={!editedBody}>
                <Send className="w-4 h-4 mr-2" />
                Send Reply
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* 未处理邮件：触发 AI */}
      {email.status === "unread" && (
        <div className="text-center">
          <Button variant="gold" size="md" loading={apiLoading} onClick={() => {
            // 重新处理
            window.location.reload();
          }}>
            <Sparkles className="w-4 h-4 mr-2" />
            Process with AI
          </Button>
        </div>
      )}
    </div>
  );
}
