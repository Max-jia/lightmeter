import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, CreditCard, Bell, Globe } from "lucide-react";

/**
 * 设置页面
 */
export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-heading font-semibold tracking-tight" style={{ fontFamily: "var(--font-space-grotesk)" }}>
          Settings
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Manage your profile, email, and billing.
        </p>
      </div>

      {/* Profile */}
      <Card padding="lg">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-[var(--color-text-secondary)]" />
          <h2 className="text-sm font-heading font-semibold">Profile</h2>
        </div>
        <div className="space-y-4">
          <Input label="Studio name" defaultValue="Darkroom Photography" />
          <Input label="Your name" defaultValue="Jane Smith" />
          <Input label="Email" defaultValue="jane@darkroomphoto.com" disabled />
        </div>
      </Card>

      {/* Gmail Connection */}
      <Card padding="lg">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-4 h-4 text-[var(--color-text-secondary)]" />
          <h2 className="text-sm font-heading font-semibold">Gmail Connection</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">jane@gmail.com</p>
            <p className="text-xs text-green-400 mt-0.5">Connected</p>
          </div>
          <Button variant="danger" size="sm">
            Disconnect
          </Button>
        </div>
      </Card>

      {/* AI Reply Tone */}
      <Card padding="lg">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-[var(--color-text-secondary)]" />
          <h2 className="text-sm font-heading font-semibold">AI Reply Tone</h2>
        </div>
        <div className="flex gap-2">
          {["Professional", "Friendly", "Minimal"].map((tone) => (
            <button
              key={tone}
              className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                tone === "Professional"
                  ? "bg-[var(--color-accent)] text-[var(--color-bg-base)] border-[var(--color-accent)]"
                  : "bg-[var(--color-bg-overlay)] text-[var(--color-text-secondary)] border-[var(--color-border-default)] hover:border-[var(--color-accent)]"
              }`}
            >
              {tone}
            </button>
          ))}
        </div>
      </Card>

      {/* Billing */}
      <Card padding="lg">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-4 h-4 text-[var(--color-text-secondary)]" />
          <h2 className="text-sm font-heading font-semibold">Billing</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Standard Plan — $19/month</p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Trial ends in 12 days
            </p>
          </div>
          <Button variant="secondary" size="sm">
            Upgrade to Pro
          </Button>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card padding="lg" className="!border-red-900/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-400">Delete account</p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Permanently delete all data
            </p>
          </div>
          <Button variant="danger" size="sm">
            Delete
          </Button>
        </div>
      </Card>
    </div>
  );
}
