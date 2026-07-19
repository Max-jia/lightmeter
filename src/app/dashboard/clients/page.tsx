import { Card } from "@/components/ui/card";
import { Badge, Avatar } from "@/components/ui/misc";
import { Search, Filter, MoreVertical } from "lucide-react";

/**
 * 客户端管理页面
 * 查看所有客户、筛选状态、AI 跟进提醒
 */
export default function ClientsPage() {
  const clients = [
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah.johnson@gmail.com",
      event: "Wedding",
      date: "2026-10-24",
      contract: "signed",
      payment: "deposit_paid",
      status: "active",
    },
    {
      id: "2",
      name: "Mike Chen",
      email: "mike.chen@outlook.com",
      event: "Wedding",
      date: "2026-11-15",
      contract: "sent",
      payment: "pending",
      status: "pending",
    },
    {
      id: "3",
      name: "Emma Rodriguez",
      email: "emma.rodriguez@gmail.com",
      event: "Portrait",
      date: "2026-12-02",
      contract: "draft",
      payment: "pending",
      status: "lead",
    },
    {
      id: "4",
      name: "James Wilson",
      email: "james.wilson@icloud.com",
      event: "Wedding",
      date: "2027-03-08",
      contract: "signed",
      payment: "paid_full",
      status: "completed",
    },
    {
      id: "5",
      name: "Olivia Kim",
      email: "olivia.kim@gmail.com",
      event: "Engagement",
      date: "2026-09-15",
      contract: "signed",
      payment: "deposit_paid",
      status: "active",
    },
    {
      id: "6",
      name: "David & Lisa Park",
      email: "david.park@gmail.com",
      event: "Wedding",
      date: "2026-08-30",
      contract: "signed",
      payment: "paid_full",
      status: "completed",
    },
  ];

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: "default" | "success" | "warning" | "error" }> = {
      lead: { label: "Lead", variant: "default" },
      active: { label: "Active", variant: "success" },
      pending: { label: "Pending", variant: "warning" },
      completed: { label: "Completed", variant: "default" },
    };
    const s = map[status] || map.lead;
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold tracking-tight" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Clients
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {clients.length} clients · AI will flag who needs follow-up
          </p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-disabled)]" />
          <input
            type="text"
            placeholder="Search clients..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Client List */}
      <div className="space-y-2">
        {clients.map((client) => (
          <Card key={client.id} padding="md">
            <div className="flex items-center gap-4">
              <Avatar name={client.name} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{client.name}</span>
                  {statusBadge(client.status)}
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  {client.email}
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-6 text-xs text-[var(--color-text-secondary)]">
                <div className="text-right">
                  <span className="text-[var(--color-text-disabled)]">Event</span>
                  <p>{client.event}</p>
                </div>
                <div className="text-right">
                  <span className="text-[var(--color-text-disabled)]">Date</span>
                  <p>{client.date}</p>
                </div>
                <div className="text-right">
                  <span className="text-[var(--color-text-disabled)]">Contract</span>
                  <p className="capitalize">{client.contract.replace("_", " ")}</p>
                </div>
                <div className="text-right">
                  <span className="text-[var(--color-text-disabled)]">Payment</span>
                  <p className="capitalize">{client.payment.replace("_", " ")}</p>
                </div>
              </div>
              <button className="p-1.5 rounded-lg hover:bg-[var(--color-bg-overlay)] text-[var(--color-text-disabled)] hover:text-[var(--color-text-secondary)]">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
