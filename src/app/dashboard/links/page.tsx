"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LinkIcon, Copy, ExternalLink, Plus, X, FileText } from "lucide-react";
import { LoadingDots } from "@/components/ui/loading-dots";
import toast from "react-hot-toast";
import { CONTRACT_TEMPLATES, renderContract } from "@/lib/contracts/templates";

export default function LinksPage() {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // 新建表单
  const [clientName, setClientName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [contractTemplate, setContractTemplate] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [showContractPreview, setShowContractPreview] = useState(false);
  const [studioName, setStudioName] = useState("My Photo Studio");
  const [templates, setTemplates] = useState<any[]>([]);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");

  useEffect(() => {
    loadLinks();
    fetch("/api/profile").then(r => r.json()).then(d => {
      if (d.studio_name) setStudioName(d.studio_name);
    });
    fetch("/api/links/templates").then(r => r.json()).then(d => setTemplates(d.templates || []));
  }, []);

  const loadLinks = () => {
    fetch("/api/links")
      .then((r) => r.json())
      .then((d) => {
        setLinks(d.links || []);
        setLoading(false);
      });
  };

  const handleCreate = async () => {
    if (!clientName || !amount) {
      toast.error("Client name and amount are required");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          amount: Math.round(parseFloat(amount) * 100),
          description: description || `${clientName} — Photography Services`,
          contractTemplate: contractTemplate || undefined,
        }),
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success("Link created!");
        if (saveAsTemplate && templateName.trim()) {
          await fetch("/api/links/templates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: templateName.trim(), proposal_amount: Math.round(parseFloat(amount) * 100), proposal_description: description }) });
          toast.success("Template saved!");
        }
        setShowModal(false);
        setClientName(""); setAmount(""); setDescription(""); setContractTemplate("");
        setSelectedTemplate(""); setShowContractPreview(false);
        setSaveAsTemplate(false); setTemplateName("");
        loadLinks();
      }
    } catch {
      toast.error("Failed to create link");
    } finally {
      setCreating(false);
    }
  };

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/l/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied!");
  };

  const openLink = (slug: string) => {
    window.open(`/l/${slug}`, "_blank");
  };

  if (loading) return <LoadingDots />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold tracking-tight" style={{ fontFamily: "var(--font-space-grotesk)" }}>Links</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">One link = proposal + contract + payment.</p>
        </div>
        <Button variant="gold" size="md" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />New Link
        </Button>
      </div>

      {links.length === 0 ? (
        <Card padding="lg" className="text-center py-12 space-y-3">
          <p className="text-sm text-[var(--color-text-secondary)]">No links yet.</p>
          <p className="text-xs text-[var(--color-text-disabled)]">Create a link to send proposals with payments to your clients.</p>
          <Button variant="gold" size="sm" onClick={() => setShowModal(true)}>Create your first link</Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {links.map((link) => (
            <Card key={link.id} padding="md">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-gold-subtle)] flex items-center justify-center">
                  <LinkIcon className="w-5 h-5 text-[var(--color-gold)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{link.proposal_title}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full capitalize bg-[var(--color-bg-overlay)] text-[var(--color-text-secondary)]">{link.status}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-[var(--color-text-disabled)]">
                    <span>/{link.slug}</span>
                    <span>·</span>
                    <span>{link.view_count || 0} views</span>
                    <span>·</span>
                    <span>${link.proposal_amount ? (link.proposal_amount / 100).toFixed(0) : "0"}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => copyLink(link.slug)}><Copy className="w-4 h-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => openLink(link.slug)}><ExternalLink className="w-4 h-4" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* New Link Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 bg-black/60 backdrop-blur-sm overflow-y-auto" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-border-default)] shadow-[var(--elevation-4)] p-5 space-y-3.5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-heading font-semibold">New Link</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-disabled)]"><X className="w-5 h-5" /></button>
            </div>
            {/* 已保存的提案模板 */}
            {templates.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {templates.map((tpl) => (
                  <button key={tpl.id} type="button" onClick={() => { setAmount(tpl.proposal_amount ? String(tpl.proposal_amount / 100) : ""); setDescription(tpl.proposal_description || ""); }}
                    className="px-3 py-1.5 rounded-lg text-xs bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)]/50 hover:text-[var(--color-gold)] transition-all"
                  >{tpl.name}</button>
                ))}
              </div>
            )}
            <Input label="Client name" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Sarah Johnson" />
            <Input label="Amount (USD)" prefix="$" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="500" helperText="Total proposal amount" />
            <Input label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Wedding Photography Package" />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text-secondary)]">Contract (optional)</label>
              {/* 模板选择 */}
              <div className="grid grid-cols-3 gap-2">
                {CONTRACT_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => {
                      setSelectedTemplate(tpl.id);
                      const rendered = renderContract(tpl.content, {
                        client_name: clientName || "[Client Name]",
                        studio_name: studioName,
                        amount: amount ? `$${amount}` : "[Amount]",
                        deposit: amount ? `$${(parseFloat(amount) / 2).toFixed(0)}` : "[Deposit]",
                      });
                      setContractTemplate(rendered);
                      setShowContractPreview(true);
                    }}
                    className={`p-2 rounded-xl border text-xs text-left transition-all ${
                      selectedTemplate === tpl.id
                        ? "bg-[var(--color-gold-subtle)] border-[var(--color-gold)] text-[var(--color-gold)]"
                        : "bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-default)]"
                    }`}
                  >
                    <FileText className="w-4 h-4 mb-1" />
                    <span className="font-medium block">{tpl.name}</span>
                    <span className="text-[10px] opacity-70">{tpl.description}</span>
                  </button>
                ))}
              </div>
              {/* 合同预览/编辑 */}
              {showContractPreview && (
                <div className="relative mt-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[var(--color-text-disabled)]">Edit contract text — client will sign this before paying</span>
                    <button type="button" className="text-xs text-[var(--color-gold)]" onClick={() => { setShowContractPreview(false); setSelectedTemplate(""); setContractTemplate(""); }}>
                      Remove
                    </button>
                  </div>
                  <textarea
                    value={contractTemplate}
                    onChange={(e) => setContractTemplate(e.target.value)}
                    className="w-full min-h-[120px] p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-sm text-[var(--color-text-primary)] leading-relaxed resize-y focus:outline-none focus:border-[var(--color-gold)] transition-colors"
                    placeholder="Paste or edit your contract terms here..."
                  />
                </div>
              )}
            </div>
            {/* 保存为模板 */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={saveAsTemplate} onChange={e => setSaveAsTemplate(e.target.checked)} className="w-4 h-4 rounded accent-[var(--color-gold)]" />
                <span className="text-xs text-[var(--color-text-secondary)]">Save as template</span>
              </label>
              {saveAsTemplate && (
                <input type="text" value={templateName} onChange={e => setTemplateName(e.target.value)} placeholder="Template name" className="flex-1 px-2.5 py-1.5 rounded-lg text-xs bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-gold)]" />
              )}
            </div>
            <Button variant="gold" className="w-full" loading={creating} onClick={handleCreate}>
              Create link
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
