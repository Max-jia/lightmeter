"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge, Avatar } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import Link from "next/link";

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetch("/api/calendar")
      .then((r) => r.json())
      .then((d) => {
        setEvents(d.events || []);
        setLoading(false);
      });
  }, []);

  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const today = new Date().getDate();
  const isCurrentMonth = month === new Date().getMonth() && year === new Date().getFullYear();

  const eventsByDay: Record<number, any[]> = {};
  events.forEach((e) => {
    if (!e.event_date) return;
    const d = new Date(e.event_date);
    if (d.getMonth() === month && d.getFullYear() === year) {
      const day = d.getDate();
      if (!eventsByDay[day]) eventsByDay[day] = [];
      eventsByDay[day].push(e);
    }
  });

  if (loading) {
    return <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-20 animate-shimmer rounded-xl bg-[var(--color-bg-surface)]" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold tracking-tight" style={{ fontFamily: "var(--font-space-grotesk)" }}>Calendar</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">{monthNames[month]} {year} · {events.length} event{events.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); }}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="gold" size="sm" onClick={() => { setMonth(new Date().getMonth()); setYear(new Date().getFullYear()); }}>Today</Button>
          <Button variant="secondary" size="sm" onClick={() => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); }}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card depth={2} padding="lg">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => <div key={d} className="text-center text-xs font-medium text-[var(--color-text-disabled)]">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {monthDays.map(day => {
            const hasEvent = eventsByDay[day];
            return (
              <div key={day} className={`aspect-square rounded-xl text-sm flex flex-col items-center justify-center gap-0.5 ${
                isCurrentMonth && day === today
                  ? "bg-[var(--color-gold)] text-[#1A1816] font-bold"
                  : hasEvent
                  ? "bg-[var(--color-gold-subtle)] text-[var(--color-text-primary)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)]"
              }`}>
                {day}
                {hasEvent && <div className={`w-1.5 h-1.5 rounded-full ${isCurrentMonth && day === today ? "bg-[#1A1816]" : "bg-[var(--color-gold)]"}`} />}
              </div>
            );
          })}
        </div>
      </Card>

      {events.length === 0 && !loading && (
        <Card padding="lg" className="text-center py-8">
          <p className="text-sm text-[var(--color-text-secondary)]">No events yet. Add a client with a shoot date to see them here.</p>
          <Link href="/dashboard/clients"><Button variant="gold" size="sm" className="mt-3">View Clients</Button></Link>
        </Card>
      )}
    </div>
  );
}
