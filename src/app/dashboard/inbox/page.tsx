import { InboxClient } from "@/components/inbox/inbox-client";

/**
 * AI 收件箱页面
 * 显示经过 AI 处理的客户邮件
 */
export default function InboxPage() {
  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-heading font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Inbox
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            AI reads your emails and drafts replies. You review and send.
          </p>
        </div>
      </div>

      {/* 收件箱内容 */}
      <InboxClient />
    </div>
  );
}
