"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge, Avatar } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { Plus, Search, MoreVertical } from "lucide-react";
import Link from "next/link";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/clients").then(r => r.json()).then(d => {
      setClients(d.clients || []);
      setLoading(false);
    });
  }, []);

  const statusVariant = (s: string): "default" | "success" | "warning" | "error" => {
    const m: Record<string, "default" | "success" | "warning" | "error"> = {
      lead: "default", active: "success", pending: "warning", completed: "default",
    };
    return m[s] || "default";
  };

  if (loading) {
    return <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-16 animate-shimmer rounded-xl bg-[var(--color-bg-surface)]" />)}</div>;
  }

  if (clients.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-semibold" style={{ fontFamily: "var(--font-space-grotesk)" }}>Clients</h1>
        </div>
        <Card padding="lg" className="text-center py-12 space-y-3">
          <p className="text-sm text-[var(--color-text-secondary)]">No clients yet.</p>
          <p className="text-xs text-[var(--color-text-disabled)]">Clients are automatically created when someone emails you. Connect Gmail to get started.</p>
          <Link href="/dashboard/inbox"><Button variant="gold" size="sm">Go to Inbox</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-semibold tracking-tight" style={{ fontFamily: "var(--font-space-grotesk)" }}>Clients</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">{clients.length} client{clients.length > 1 ? "s" : ""}</p>
      </div>
      <div className="space-y-2">
        {clients.map((c) => (
          <Card key={c.id} padding="md">
            <div className="flex items-center gap-4">
              <Avatar name={c.name} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{c.name}</span>
                  <Badge variant={statusVariant(c.status)}>{c.status}</Badge>
                  {c.event_type && <Badge variant="gold">{c.event_type}</Badge>}
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{c.email || "No email"}</p>
              </div>
              {c.event_date && (
                <span className="text-xs text-[var(--color-text-disabled)] hidden sm:inline">{c.event_date}</span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
