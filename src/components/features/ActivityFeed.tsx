import { ArrowRight, Clock } from "lucide-react";
import type { ActivityEvent } from "@/types";
import { formatTime } from "@/lib/utils";

interface ActivityFeedProps {
  events: ActivityEvent[];
}

const TYPE_LABELS: Record<string, string> = {
  received: "Received",
  routed: "Routed",
  replied: "Draft Ready",
  escalated: "Escalated",
};

const TYPE_COLORS: Record<string, string> = {
  received: "hsl(199,89%,48%)",
  routed: "hsl(43,96%,56%)",
  replied: "hsl(142,72%,45%)",
  escalated: "hsl(0,70%,55%)",
};

const ActivityFeed = ({ events }: ActivityFeedProps) => {
  return (
    <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--border))]">
        <div className="flex items-center gap-2">
          <div className="relative w-2 h-2">
            <div className="absolute inset-0 rounded-full bg-[hsl(142,72%,45%)]" />
            <div className="pulse-dot absolute inset-0 rounded-full text-[hsl(142,72%,45%)]" />
          </div>
          <h2 className="text-sm font-semibold text-[hsl(var(--foreground))]">Live Activity Feed</h2>
        </div>
        <span className="text-[10px] mono text-[hsl(var(--muted-foreground))]">{events.length} events</span>
      </div>

      <div className="flex-1 overflow-y-auto max-h-64 p-2 space-y-1">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="w-6 h-6 text-[hsl(var(--muted-foreground))] mb-2 opacity-50" />
            <p className="text-xs text-[hsl(var(--muted-foreground))]">No activity yet</p>
            <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1 opacity-70">Send an email to see swarm activity</p>
          </div>
        ) : (
          events.slice().reverse().map((event) => (
            <div
              key={event.id}
              className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-[hsl(var(--secondary)/0.5)] transition-colors slide-in"
            >
              {/* Category dot */}
              <div
                className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5"
                style={{ backgroundColor: event.campusColor }}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                    style={{ color: TYPE_COLORS[event.type], backgroundColor: `${TYPE_COLORS[event.type]}20` }}
                  >
                    {TYPE_LABELS[event.type]}
                  </span>
                  <ArrowRight className="w-2.5 h-2.5 text-[hsl(var(--muted-foreground))]" />
                  <span className="text-[10px] font-semibold" style={{ color: event.campusColor }}>
                    {event.agentName}
                  </span>
                </div>
                <div className="text-[11px] text-[hsl(var(--foreground))] mt-0.5 truncate">{event.subject}</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[9px] text-[hsl(var(--muted-foreground))]">{event.category}</span>
                  <span className="text-[9px] text-[hsl(var(--muted-foreground))]">·</span>
                  <span className="text-[9px] mono text-[hsl(var(--muted-foreground))]">{formatTime(event.timestamp)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
