import { CAMPUSES } from "@/constants/umuData";
import { MapPin, Wifi, WifiOff } from "lucide-react";

interface CampusAgentPanelProps {
  activeCampusId?: string;
  processedCounts: Record<string, number>;
}

const CampusAgentPanel = ({ activeCampusId, processedCounts }: CampusAgentPanelProps) => {
  return (
    <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[hsl(var(--foreground))]">Campus Agent Network</h2>
        <span className="text-[10px] mono text-[hsl(var(--muted-foreground))]">7 nodes</span>
      </div>

      <div className="space-y-2">
        {CAMPUSES.map((campus) => {
          const isActive = campus.id === activeCampusId;
          const count = processedCounts[campus.id] || 0;

          return (
            <div
              key={campus.id}
              className={`relative flex items-center gap-3 p-2.5 rounded-lg border transition-all duration-300 ${
                isActive
                  ? "border-[hsl(var(--primary)/0.5)] bg-[hsl(var(--primary)/0.07)]"
                  : "border-[hsl(var(--border))] bg-[hsl(var(--background)/0.5)] hover:border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))]"
              }`}
            >
              {/* Status dot */}
              <div className="relative flex-shrink-0">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: campus.status === "online" ? campus.color : "#555" }}
                />
                {isActive && (
                  <div
                    className="absolute inset-0 rounded-full animate-ping opacity-60"
                    style={{ backgroundColor: campus.color }}
                  />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[hsl(var(--foreground))] truncate">
                    {campus.agentName}
                  </span>
                  <span
                    className="text-[10px] mono font-bold ml-2"
                    style={{ color: campus.color }}
                  >
                    {campus.short}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin className="w-2.5 h-2.5 text-[hsl(var(--muted-foreground))] flex-shrink-0" />
                  <span className="text-[10px] text-[hsl(var(--muted-foreground))] truncate">
                    {campus.location.split(",")[0]}
                  </span>
                </div>
              </div>

              {/* Count + status */}
              <div className="flex flex-col items-end gap-1">
                {count > 0 && (
                  <span
                    className="text-[10px] font-bold mono px-1.5 py-0.5 rounded"
                    style={{ color: campus.color, backgroundColor: `${campus.color}20` }}
                  >
                    {count}
                  </span>
                )}
                <div className="flex items-center gap-1">
                  {campus.status === "online" ? (
                    <Wifi className="w-2.5 h-2.5 text-[hsl(142,72%,45%)]" />
                  ) : (
                    <WifiOff className="w-2.5 h-2.5 text-[hsl(var(--muted-foreground))]" />
                  )}
                </div>
              </div>

              {/* Active glow border */}
              {isActive && (
                <div
                  className="absolute inset-0 rounded-lg pointer-events-none"
                  style={{ boxShadow: `0 0 12px ${campus.color}30, inset 0 0 12px ${campus.color}08` }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CampusAgentPanel;
