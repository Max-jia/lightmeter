import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LinkIcon, Copy, ExternalLink, Plus } from "lucide-react";

/**
 * 一键链接管理页面
 * 生成包含报价、合同和付款的客户端链接
 */
export default function LinksPage() {
  const links = [
    {
      id: "1",
      clientName: "Sarah Johnson",
      eventType: "Wedding",
      slug: "sarah-johnson-wedding",
      status: "pending",
      opened: 3,
      created: "2h ago",
    },
    {
      id: "2",
      clientName: "Mike Chen",
      eventType: "Wedding",
      slug: "mike-chen-wedding",
      status: "viewed",
      opened: 8,
      created: "1d ago",
    },
    {
      id: "3",
      clientName: "Emma Rodriguez",
      eventType: "Portrait",
      slug: "emma-rodriguez-portrait",
      status: "signed",
      opened: 5,
      created: "2d ago",
    },
    {
      id: "4",
      clientName: "Olivia Kim",
      eventType: "Engagement",
      slug: "olivia-kim-engagement",
      status: "paid",
      opened: 12,
      created: "5d ago",
    },
  ];

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-[var(--color-bg-overlay)] text-[var(--color-text-secondary)]",
      viewed: "bg-blue-950/50 text-blue-400",
      signed: "bg-amber-950/50 text-amber-400",
      paid: "bg-green-950/50 text-green-400",
    };
    return map[status] || "";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold tracking-tight" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Links
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            One link = proposal + contract + payment. Send it and wait.
          </p>
        </div>
        <Button size="md">
          <Plus className="w-4 h-4 mr-2" />
          New Link
        </Button>
      </div>

      {/* Link List */}
      <div className="space-y-2">
        {links.map((link) => (
          <Card key={link.id} padding="md">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-bg-overlay)] flex items-center justify-center">
                <LinkIcon className="w-5 h-5 text-[var(--color-text-secondary)]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{link.clientName}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusBadge(
                      link.status
                    )}`}
                  >
                    {link.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-[var(--color-text-disabled)]">
                  <span>/{link.slug}</span>
                  <span>·</span>
                  <span>{link.opened} views</span>
                  <span>·</span>
                  <span>{link.created}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
