"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge, Avatar } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const EVENT_TYPES = ["wedding", "portrait", "event", "engagement", "other"] as const;

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", event_type: "other", event_date: "", location: "", notes: "" });

  const loadClients = () => {
    fetch("/api/clients").then(r => r.json()).then(d => {
      setClients(d.clients || []);
      setLoading(false);
    });
  };

  useEffect(() => { loadClients(); }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) { toast.error("Client name is required"); return; }
    setCreating(true);
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        email: form.email.trim() || null,
        event_type: form.event_type,
        event_date: form.event_date || null,
        location: form.location.trim() || null,
        notes: form.notes.trim() || null,
      }),
    });
    const data = await res.json();
    if (data.error) { toast.error(data.error); setCreating(false); return; }
    toast.success("Client added!");
    setShowModal(false);
    setForm({ name: "", email: "", event_type: "other", event_date: "", location: "", notes: "" });
    setCreating(false);
    loadClients();
  };

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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading font-semibold" style={{ fontFamily: "var(--font-space-grotesk)" }}>Clients</h1>
          <Button variant="gold" size="sm" onClick={() => setShowModal(true)}><Plus className="w-4 h-4 mr-1.5" />Add Client</Button>
        </div>
        <Card padding="lg" className="text-center py-12 space-y-3">
          <p className="text-sm text-[var(--color-text-secondary)]">No clients yet.</p>
          <p className="text-xs text-[var(--color-text-disabled)]">Add manually or connect Gmail to auto-create from client emails.</p>
          <Button variant="gold" size="sm" onClick={() => setShowModal(true)}>Add Client</Button>
        </Card>
        {showModal && <AddClientModal form={form} setForm={setForm} creating={creating} onCreate={handleCreate} onClose={() => setShowModal(false)} />}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold tracking-tight" style={{ fontFamily: "var(--font-space-grotesk)" }}>Clients</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">{clients.length} client{clients.length > 1 ? "s" : ""}</p>
        </div>
        <Button variant="gold" size="sm" onClick={() => setShowModal(true)}><Plus className="w-4 h-4 mr-1.5" />Add Client</Button>
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
      {showModal && <AddClientModal form={form} setForm={setForm} creating={creating} onCreate={handleCreate} onClose={() => setShowModal(false)} />}
    </div>
  );
}

function AddClientModal({ form, setForm, creating, onCreate, onClose }: {
  form: any; setForm: any; creating: boolean; onCreate: () => void; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-border-default)] shadow-[var(--elevation-4)] p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-heading font-semibold">Add Client</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-disabled)]"><X className="w-5 h-5" /></button>
        </div>
        <Input label="Client name *" value={form.name} onChange={(e: any) => setForm({...form, name: e.target.value})} placeholder="Sarah Johnson" />
        <Input label="Email" type="email" value={form.email} onChange={(e: any) => setForm({...form, email: e.target.value})} placeholder="sarah@example.com" />
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text-secondary)]">Shoot type</label>
            <select className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-sm" value={form.event_type} onChange={e => setForm({...form, event_type: e.target.value})}>
              {EVENT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
          <Input label="Shoot date" type="date" value={form.event_date} onChange={(e: any) => setForm({...form, event_date: e.target.value})} />
        </div>
        <Input label="Location" value={form.location} onChange={(e: any) => setForm({...form, location: e.target.value})} placeholder="Grand Ballroom, NYC" />
        <Button variant="gold" className="w-full" loading={creating} onClick={onCreate}>Add Client</Button>
      </div>
    </div>
  );
}
