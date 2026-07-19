import { Card } from "@/components/ui/card";
import { Badge, Avatar } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, CalendarDays } from "lucide-react";

export default function CalendarPage() {
  const today = new Date();
  const monthDays = Array.from({ length: 31 }, (_, i) => i + 1);

  const events: Record<number, { client: string; type: string; time?: string }[]> = {
    15: [{ client: "Olivia Kim", type: "Engagement", time: "2:00 PM" }],
    20: [{ client: "David & Lisa Park", type: "Wedding", time: "11:00 AM" }],
    24: [{ client: "Sarah Johnson", type: "Wedding", time: "1:00 PM" }],
    26: [{ client: "Emma Rodriguez", type: "Portrait", time: "10:00 AM" }],
  };

  const upcomingPayments = [
    { client: "Mike Chen", amount: "$1,500", due: "Nov 10", status: "pending" as const },
    { client: "Sarah Johnson", amount: "$2,100", due: "Oct 20", status: "pending" as const },
    { client: "Olivia Kim", amount: "$800", due: "Sep 10", status: "paid" as const },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold tracking-tight" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Calendar
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            July 2026 · 4 shoots this month
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="gold" size="sm">Today</Button>
          <Button variant="secondary" size="sm">
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Add Event
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <Card depth={2} padding="lg" className="lg:col-span-2">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-center text-xs font-medium text-[var(--color-text-disabled)] py-1">
                {d}
              </div>
            ))}
          </div>
          {/* Day grid */}
          <div className="grid grid-cols-7 gap-2">
            {monthDays.map((day) => {
              const hasEvent = events[day];
              return (
                <button
                  key={day}
                  className={`aspect-square rounded-xl text-sm font-medium flex flex-col items-center justify-center gap-0.5 transition-all duration-[var(--duration-fast)] hover:bg-[var(--color-bg-elevated)] hover:shadow-[var(--elevation-1)] ${
                    day === 19
                      ? "bg-[var(--color-gold)] text-[#1A1816] shadow-[var(--elevation-1)]"
                      : "text-[var(--color-text-secondary)]"
                  }`}
                >
                  {day}
                  {hasEvent && (
                    <div className={`w-1.5 h-1.5 rounded-full ${day === 19 ? "bg-[#1A1816]" : "bg-[var(--color-gold)]"}`} />
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Sidebar: Upcoming & Payments */}
        <div className="space-y-4">
          {/* Today's Schedule */}
          <Card depth={2} padding="lg">
            <h2 className="text-sm font-heading font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              <CalendarDays className="w-4 h-4 text-[var(--color-gold)]" />
              Today
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">No shoots scheduled today.</p>
            <p className="text-xs text-[var(--color-gold)] mt-2 cursor-pointer hover:underline">
              + Add shoot
            </p>
          </Card>

          {/* Upcoming Payments */}
          <Card depth={2} padding="lg">
            <h2 className="text-sm font-heading font-semibold mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              Upcoming Payments
            </h2>
            <div className="space-y-3">
              {upcomingPayments.map((p) => (
                <div key={p.client} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar name={p.client} size="sm" />
                    <div>
                      <p className="text-xs font-medium">{p.client}</p>
                      <p className="text-[10px] text-[var(--color-text-disabled)]">Due {p.due}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{p.amount}</p>
                    <Badge variant={p.status === "paid" ? "success" : "warning"}>
                      {p.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
