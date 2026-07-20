"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LinkIcon, Copy, ExternalLink, Plus } from "lucide-react";

export default function LinksPage() {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/links")
      .then((r) => r.json())
      .then((d) => {
        setLinks(d.links || []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 animate-shimmer rounded-xl bg-[var(--color-bg-surface)]" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold tracking-tight" style={{ fontFamily: "var(--font-space-grotesk)" }}>Links</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">One link = proposal + contract + payment.</p>
        </div>
        <Button variant="gold" size="md">
          <Plus className="w-4 h-4 mr-2" />New Link
        </Button>
      </div>

      {links.length === 0 ? (
        <Card padding="lg" className="text-center py-12 space-y-3">
          <p className="text-sm text-[var(--color-text-secondary)]">No links yet.</p>
          <p className="text-xs text-[var(--color-text-disabled)]">Create a link to send proposals with contracts and payments to your clients.</p>
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
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm"><Copy className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm"><ExternalLink className="w-4 h-4" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
