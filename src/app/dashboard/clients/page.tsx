"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge, Avatar } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Pencil, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

const EVENT_TYPES = ["wedding", "portrait", "event", "engagement", "other"] as const;
const CONTACT_OPTIONS = ["email", "phone", "instagram", "whatsapp"] as const;
type ContactKey = typeof CONTACT_OPTIONS[number];

const CONTACT_LABELS: Record<ContactKey, string> = { email: "Email", phone: "Phone", instagram: "Instagram", whatsapp: "WhatsApp" };
const CONTACT_PLACEHOLDERS: Record<ContactKey, string> = { email: "sarah@example.com", phone: "+1 555-0123", instagram: "sarahjohnson", whatsapp: "+1 555-0123" };

interface ClientForm { name: string; contacts: Partial<Record<ContactKey, string>>; event_type: string; event_date: string; location: string; partner_name: string; budget: string; referral_source: string; notes: string; }

const EMPTY_FORM: ClientForm = { name: "", contacts: {}, event_type: "other", event_date: "", location: "", partner_name: "", budget: "", referral_source: "", notes: "" };

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ClientForm>({...EMPTY_FORM});
  const [contactMenuOpen, setContactMenuOpen] = useState(false);

  const loadClients = () => {
    fetch("/api/clients").then(r => r.json()).then(d => {
      setClients(d.clients || []);
      setLoading(false);
    });
  };
  useEffect(() => { loadClients(); }, []);

  const openAdd = () => { setEditId(null); setForm({...EMPTY_FORM, contacts: {email: ""}}); setShowModal(true); };
  const openEdit = (c: any) => {
    setEditId(c.id);
    const contacts: Partial<Record<ContactKey, string>> = {};
    // 始终显示已填的 + 默认显示 email
    CONTACT_OPTIONS.forEach(k => { if (c[k]) contacts[k] = c[k]; });
    if (!contacts.email) contacts.email = "";
    setForm({
      name: c.name || "", contacts,
      event_type: c.event_type || "other", event_date: c.event_date || "", location: c.location || "",
      partner_name: c.partner_name || "", budget: c.budget || "", referral_source: c.referral_source || "",
      notes: c.notes || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Client name is required"); return; }
    setSaving(true);
    const body: any = { name: form.name.trim(), event_type: form.event_type, event_date: form.event_date || null, location: form.location.trim() || null, partner_name: form.partner_name.trim() || null, budget: form.budget.trim() || null, referral_source: form.referral_source.trim() || null, notes: form.notes.trim() || null };
    CONTACT_OPTIONS.forEach(k => { body[k] = form.contacts[k]?.trim() || null; });
    if (editId) body.id = editId;
    const res = await fetch("/api/clients", {
      method: editId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.error) { toast.error(data.error); setSaving(false); return; }
    toast.success(editId ? "Client updated!" : "Client added!");
    setShowModal(false); setSaving(false); loadClients();
  };

  const addContact = (key: ContactKey) => {
    setForm({...form, contacts: {...form.contacts, [key]: form.contacts[key] || ""}});
    setContactMenuOpen(false);
  };
  const removeContact = (key: ContactKey) => {
    const next = {...form.contacts}; delete next[key]; setForm({...form, contacts: next});
  };
  const availableContacts = CONTACT_OPTIONS.filter(k => !(k in form.contacts));

  const statusVariant = (s: string): "default" | "success" | "warning" | "error" => {
    const m: Record<string, "default" | "success" | "warning" | "error"> = { lead: "default", active: "success", pending: "warning", completed: "default" };
    return m[s] || "default";
  };

  if (loading) {
    return <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-16 animate-shimmer rounded-xl bg-[var(--color-bg-surface)]" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold tracking-tight" style={{ fontFamily: "var(--font-space-grotesk)" }}>Clients</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">{clients.length} client{clients.length > 1 ? "s" : ""}</p>
        </div>
        <Button variant="gold" size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1.5" />Add Client</Button>
      </div>

      {clients.length === 0 ? (
        <Card padding="lg" className="text-center py-12 space-y-3">
          <p className="text-sm text-[var(--color-text-secondary)]">No clients yet.</p>
          <p className="text-xs text-[var(--color-text-disabled)]">Add manually or connect Gmail to auto-create from client emails.</p>
          <Button variant="gold" size="sm" onClick={openAdd}>Add Client</Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {clients.map((c) => (
            <Card key={c.id} padding="md" className="group">
              <div className="flex items-center gap-4">
                <Avatar name={c.name} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{c.name}</span>
                    <Badge variant={statusVariant(c.status)}>{c.status}</Badge>
                    {c.event_type && <Badge variant="gold">{c.event_type}</Badge>}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-[var(--color-text-secondary)] flex-wrap">
                    {c.email && <span>✉️ {c.email}</span>}
                    {c.phone && <span>📞 {c.phone}</span>}
                    {c.instagram && <span>📷 @{c.instagram}</span>}
                    {c.whatsapp && <span>💬 {c.whatsapp}</span>}
                    {c.event_date && <span>· {c.event_date}</span>}
                  </div>
                </div>
                <button onClick={() => openEdit(c)} className="p-2 rounded-lg text-[var(--color-text-disabled)] hover:text-[var(--color-gold)] hover:bg-[var(--color-gold-subtle)] opacity-0 group-hover:opacity-100 transition-all">
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-lg bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-border-default)] shadow-[var(--elevation-4)] p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-heading font-semibold">{editId ? "Edit Client" : "Add Client"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-disabled)]"><X className="w-5 h-5" /></button>
            </div>

            <Input label="Client name *" value={form.name} onChange={(e: any) => setForm({...form, name: e.target.value})} placeholder="Sarah Johnson" />

            {/* Dynamic contact methods */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-text-secondary)]">Contact</label>
              {CONTACT_OPTIONS.map(k => form.contacts[k] !== undefined && (
                <div key={k} className="flex items-center gap-2">
                  <span className="text-xs text-[var(--color-text-disabled)] w-20 shrink-0">{CONTACT_LABELS[k]}</span>
                  <Input value={form.contacts[k] || ""} onChange={(e: any) => setForm({...form, contacts: {...form.contacts, [k]: e.target.value}})} placeholder={CONTACT_PLACEHOLDERS[k]} className="flex-1" />
                  <button onClick={() => removeContact(k)} className="p-1.5 rounded-lg text-[var(--color-text-disabled)] hover:text-[var(--color-error)]"><X className="w-4 h-4" /></button>
                </div>
              ))}
              {availableContacts.length > 0 && (
                <div className="relative">
                  <button onClick={() => setContactMenuOpen(!contactMenuOpen)} className="flex items-center gap-1.5 text-xs text-[var(--color-gold)] hover:text-[var(--color-gold-light)] transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Add contact
                  </button>
                  {contactMenuOpen && (
                    <div className="absolute top-full left-0 mt-1 z-50 w-40 rounded-xl bg-[var(--color-bg-overlay)] border border-[var(--color-border-default)] shadow-[var(--elevation-3)] py-1">
                      {availableContacts.map(k => (
                        <button key={k} onClick={() => addContact(k)} className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--color-bg-elevated)] transition-colors">{CONTACT_LABELS[k]}</button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input label="Partner name" value={form.partner_name} onChange={(e: any) => setForm({...form, partner_name: e.target.value})} placeholder="John Smith" helperText="For weddings/engagements" />
              <Input label="Budget" prefix="$" value={form.budget} onChange={(e: any) => setForm({...form, budget: e.target.value})} placeholder="3000" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--color-text-secondary)]">Shoot type</label>
                <select className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-sm text-[var(--color-text-primary)]" value={form.event_type} onChange={e => setForm({...form, event_type: e.target.value})}>
                  {EVENT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <Input label="Shoot date" type="date" value={form.event_date} onChange={(e: any) => setForm({...form, event_date: e.target.value})} />
            </div>

            <Input label="Location" value={form.location} onChange={(e: any) => setForm({...form, location: e.target.value})} placeholder="Grand Ballroom, NYC" />
            <Input label="Referral source" value={form.referral_source} onChange={(e: any) => setForm({...form, referral_source: e.target.value})} placeholder="Instagram / Friend / Google" />
            <Input label="Notes" value={form.notes} onChange={(e: any) => setForm({...form, notes: e.target.value})} placeholder="Prefers afternoon shoots. Has 2 dogs." />

            <Button variant="gold" className="w-full" loading={saving} onClick={handleSave}>
              {editId ? "Save Changes" : "Add Client"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
