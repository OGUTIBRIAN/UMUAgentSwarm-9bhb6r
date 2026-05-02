import { BarChart2, TrendingUp, Mail } from "lucide-react";
import { CAMPUSES, EMAIL_CATEGORIES } from "@/constants/umuData";
import type { RoutingResult } from "@/types";

interface AnalyticsPanelProps {
  results: RoutingResult[];
}

const AnalyticsPanel = ({ results }: AnalyticsPanelProps) => {
  const total = results.length;

  // Per-campus counts
  const campusCounts = CAMPUSES.map((c) => ({
    ...c,
    count: results.filter((r) => r.campusId === c.id).length,
  })).filter((c) => c.count > 0).sort((a, b) => b.count - a.count);

  // Per-category counts
  const catCounts = EMAIL_CATEGORIES.map((cat) => ({
    ...cat,
    count: results.filter((r) => r.category === cat.id).length,
  })).filter((c) => c.count > 0).sort((a, b) => b.count - a.count);

  const avgConfidence = total > 0
    ? Math.round(results.reduce((s, r) => s + r.confidence, 0) / total)
    : 0;

  return (
    <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[hsl(var(--border))]">
        <BarChart2 className="w-4 h-4 text-[hsl(var(--primary))]" />
        <h2 className="text-sm font-semibold text-[hsl(var(--foreground))]">Swarm Analytics</h2>
      </div>

      {total === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center px-4">
          <Mail className="w-7 h-7 text-[hsl(var(--muted-foreground))] mb-2 opacity-40" />
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Analytics will appear here</p>
          <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1 opacity-60">Process emails to generate data</p>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {/* Summary row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[hsl(var(--background))] rounded-lg p-2.5 text-center border border-[hsl(var(--border))]">
              <div className="text-xl font-bold text-[hsl(var(--primary))] mono">{total}</div>
              <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5">Total</div>
            </div>
            <div className="bg-[hsl(var(--background))] rounded-lg p-2.5 text-center border border-[hsl(var(--border))]">
              <div className="text-xl font-bold text-[hsl(142,72%,45%)] mono">{campusCounts.length}</div>
              <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5">Campuses</div>
            </div>
            <div className="bg-[hsl(var(--background))] rounded-lg p-2.5 text-center border border-[hsl(var(--border))]">
              <div className="text-xl font-bold text-[hsl(var(--accent))] mono">{avgConfidence}%</div>
              <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5">Avg. Conf.</div>
            </div>
          </div>

          {/* By campus */}
          {campusCounts.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingUp className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
                <span className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider font-semibold">By Campus</span>
              </div>
              <div className="space-y-1.5">
                {campusCounts.map((c) => (
                  <div key={c.id}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[11px] font-medium" style={{ color: c.color }}>{c.agentName}</span>
                      <span className="text-[11px] mono text-[hsl(var(--foreground))]">{c.count}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[hsl(var(--secondary))] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.round((c.count / total) * 100)}%`,
                          backgroundColor: c.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* By category */}
          {catCounts.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <BarChart2 className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
                <span className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider font-semibold">By Category</span>
              </div>
              <div className="space-y-1.5">
                {catCounts.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-[10px] text-[hsl(var(--muted-foreground))] flex-1 truncate">{cat.label}</span>
                    <span className="text-[11px] font-bold mono" style={{ color: cat.color }}>{cat.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyticsPanel;
