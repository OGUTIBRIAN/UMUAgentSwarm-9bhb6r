import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck, BarChart2, Users, Building2, Mail, AlertTriangle,
  TrendingUp, CheckCircle, Filter, Search, X, ChevronRight,
  Percent, RefreshCw, LogOut, Tag, Clock,
} from "lucide-react";
import { CAMPUSES, EMAIL_CATEGORIES } from "@/constants/umuData";
import { loadEmailLogs } from "@/lib/emailStorage";
import { useAuth } from "@/hooks/useAuth";
import { formatDateTime } from "@/lib/utils";
import type { RoutingResult } from "@/types";
import EmailInbox from "@/components/features/EmailInbox";
import { markEmailSent } from "@/lib/emailStorage";

const CATEGORY_COLORS: Record<string, string> = {
  admissions: "#F5A623",
  student_support: "#29ABE2",
  academic: "#27AE60",
  administrative: "#9B59B6",
  medical: "#E74C3C",
  engineering: "#E67E22",
};

// ── StatCard ─────────────────────────────────────────────────────────────────
const StatCard = ({
  label, value, sub, color, icon: Icon,
}: { label: string; value: number | string; sub?: string; color: string; icon: React.ElementType }) => (
  <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4 flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider font-semibold">{label}</span>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
        <Icon className="w-3.5 h-3.5" style={{ color }} />
      </div>
    </div>
    <div className="text-3xl font-bold mono" style={{ color }}>{value}</div>
    {sub && <div className="text-[11px] text-[hsl(var(--muted-foreground))]">{sub}</div>}
  </div>
);

// ── Campus breakdown row ──────────────────────────────────────────────────────
const CampusRow = ({ campus, count, total, escalated, sent }: {
  campus: typeof CAMPUSES[0]; count: number; total: number; escalated: number; sent: number;
}) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[hsl(var(--border))] last:border-0">
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: campus.color }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold" style={{ color: campus.color }}>{campus.agentName}</span>
          <div className="flex items-center gap-2">
            {escalated > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#E67E2220] text-[#E67E22] border border-[#E67E2240]">
                {escalated} escalated
              </span>
            )}
            <span className="text-[11px] mono text-[hsl(var(--foreground))]">{count}</span>
          </div>
        </div>
        <div className="w-full h-1.5 bg-[hsl(var(--secondary))] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, backgroundColor: campus.color }}
          />
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{pct}% of total</span>
          <span className="text-[10px] text-[hsl(142,72%,45%)]">{sent} sent</span>
          <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{count - sent} draft</span>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [allResults, setAllResults] = useState<RoutingResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCampus, setFilterCampus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterEscalated, setFilterEscalated] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "inbox">("overview");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const logs = await loadEmailLogs();
    setAllResults(logs);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/");
      return;
    }
    load();
  }, [user, navigate, load]);

  const handleMarkSent = useCallback(async (emailId: string) => {
    setAllResults((prev) =>
      prev.map((r) => (r.emailId === emailId ? { ...r, status: "sent" as const } : r))
    );
    await markEmailSent(emailId);
  }, []);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const total = allResults.length;
  const escalatedCount = allResults.filter((r) => r.escalated).length;
  const sentCount = allResults.filter((r) => r.status === "sent").length;
  const avgConf = total > 0 ? Math.round(allResults.reduce((s, r) => s + r.confidence, 0) / total) : 0;
  const activeCampuses = new Set(allResults.map((r) => r.campusId)).size;

  // ── Filtered results ───────────────────────────────────────────────────────
  const filtered = allResults.filter((r) => {
    if (filterCampus !== "all" && r.campusId !== filterCampus) return false;
    if (filterCategory !== "all" && r.category !== filterCategory) return false;
    if (filterEscalated && !r.escalated) return false;
    if (search && !r.subject.toLowerCase().includes(search.toLowerCase()) &&
        !r.from.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // ── Campus breakdown ───────────────────────────────────────────────────────
  const campusBreakdown = CAMPUSES.map((c) => {
    const emails = allResults.filter((r) => r.campusId === c.id);
    return {
      campus: c,
      count: emails.length,
      escalated: emails.filter((r) => r.escalated).length,
      sent: emails.filter((r) => r.status === "sent").length,
    };
  }).filter((c) => c.count > 0).sort((a, b) => b.count - a.count);

  // ── Category breakdown ─────────────────────────────────────────────────────
  const catBreakdown = EMAIL_CATEGORIES.map((cat) => ({
    ...cat,
    count: allResults.filter((r) => r.category === cat.id).length,
    escalated: allResults.filter((r) => r.category === cat.id && r.escalated).length,
  })).filter((c) => c.count > 0).sort((a, b) => b.count - a.count);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] grid-bg flex flex-col">
      {/* ── Admin Header ── */}
      <header className="sticky top-0 z-40 border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/0.95)] backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--primary)/0.15)] border border-[hsl(var(--primary)/0.3)] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[hsl(var(--primary))]" />
            </div>
            <div>
              <div className="text-sm font-bold text-[hsl(var(--foreground))]">UMU Admin Dashboard</div>
              <div className="text-[10px] text-[hsl(var(--muted-foreground))]">All-campus command view</div>
            </div>
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[hsl(142,72%,45%,0.12)] border border-[hsl(142,72%,45%,0.3)] text-[10px] font-semibold text-[hsl(142,72%,45%)]">
              <div className="w-1.5 h-1.5 rounded-full bg-[hsl(142,72%,45%)] animate-pulse" />
              Live
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/")}
              className="text-[11px] px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))] transition-colors"
            >
              ← Swarm View
            </button>
            <button
              onClick={load}
              className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))] transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5 text-[hsl(var(--primary))]" />
              <span className="text-[11px] font-semibold text-[hsl(var(--foreground))]">{user?.username}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] font-bold uppercase">admin</span>
            </div>
            <button
              onClick={async () => { await logout(); navigate("/login"); }}
              className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg border border-[hsl(var(--destructive)/0.3)] text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/0.1)] transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 flex items-center gap-1 pb-0 border-t border-[hsl(var(--border))]">
          {(["overview", "inbox"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-xs font-semibold transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))]"
                  : "border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              }`}
            >
              {tab === "overview" ? "Overview" : `All Emails (${total})`}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 max-w-[1400px] mx-auto w-full space-y-5">
        {/* ── Overview tab ── */}
        {activeTab === "overview" && (
          <>
            {/* KPI row */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              <StatCard label="Total Emails" value={total} sub="All campuses" color="#F5A623" icon={Mail} />
              <StatCard label="Active Campuses" value={activeCampuses} sub={`of 7 campuses`} color="#29ABE2" icon={Building2} />
              <StatCard label="Escalated" value={escalatedCount} sub="Need senior review" color="#E67E22" icon={AlertTriangle} />
              <StatCard label="Replies Sent" value={sentCount} sub={`${total > 0 ? Math.round((sentCount / total) * 100) : 0}% resolved`} color="#27AE60" icon={CheckCircle} />
              <StatCard label="Avg. Confidence" value={`${avgConf}%`} sub="AI routing accuracy" color="#9B59B6" icon={Percent} />
            </div>

            {/* Escalation alert banner */}
            {escalatedCount > 0 && (
              <div className="flex items-center gap-3 px-4 py-3 bg-[#E67E2210] border border-[#E67E2240] rounded-xl">
                <AlertTriangle className="w-4 h-4 text-[#E67E22] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-[#E67E22]">{escalatedCount} email{escalatedCount > 1 ? "s" : ""} flagged for escalation</span>
                  <span className="text-xs text-[hsl(var(--muted-foreground))] ml-2">
                    — Dean of Studies &amp; Vice Chancellor CC'd on replies
                  </span>
                </div>
                <button
                  onClick={() => { setFilterEscalated(true); setActiveTab("inbox"); }}
                  className="text-[11px] px-3 py-1.5 rounded-lg bg-[#E67E22] text-white font-semibold hover:opacity-90 transition-opacity flex-shrink-0"
                >
                  Review Now
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Campus breakdown */}
              <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[hsl(var(--border))]">
                  <Building2 className="w-4 h-4 text-[hsl(var(--primary))]" />
                  <h2 className="text-sm font-bold text-[hsl(var(--foreground))]">Campus Breakdown</h2>
                  <span className="ml-auto text-[10px] text-[hsl(var(--muted-foreground))]">{campusBreakdown.length} active</span>
                </div>
                <div className="px-4 py-2 divide-y divide-transparent">
                  {campusBreakdown.length === 0 ? (
                    <div className="py-10 text-center">
                      <Building2 className="w-6 h-6 mx-auto text-[hsl(var(--muted-foreground))] opacity-30 mb-2" />
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">No data yet</p>
                    </div>
                  ) : (
                    campusBreakdown.map((item) => (
                      <CampusRow
                        key={item.campus.id}
                        campus={item.campus}
                        count={item.count}
                        total={total}
                        escalated={item.escalated}
                        sent={item.sent}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Category breakdown */}
              <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[hsl(var(--border))]">
                  <Tag className="w-4 h-4 text-[hsl(var(--primary))]" />
                  <h2 className="text-sm font-bold text-[hsl(var(--foreground))]">Category Breakdown</h2>
                </div>
                <div className="p-4 space-y-3">
                  {catBreakdown.length === 0 ? (
                    <div className="py-10 text-center">
                      <Tag className="w-6 h-6 mx-auto text-[hsl(var(--muted-foreground))] opacity-30 mb-2" />
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">No data yet</p>
                    </div>
                  ) : (
                    catBreakdown.map((cat) => {
                      const pct = total > 0 ? Math.round((cat.count / total) * 100) : 0;
                      return (
                        <div key={cat.id}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                              <span className="text-xs font-medium text-[hsl(var(--foreground))]">{cat.label}</span>
                              {cat.escalated > 0 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E67E2218] text-[#E67E22] font-bold">
                                  {cat.escalated}↑
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-[hsl(var(--muted-foreground))]">{pct}%</span>
                              <span className="text-[11px] font-bold mono" style={{ color: cat.color }}>{cat.count}</span>
                            </div>
                          </div>
                          <div className="w-full h-2 bg-[hsl(var(--secondary))] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${pct}%`, backgroundColor: cat.color }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Recent escalated emails */}
            {escalatedCount > 0 && (
              <div className="bg-[hsl(var(--card))] border border-[#E67E2240] rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[#E67E2240] bg-[#E67E2208]">
                  <AlertTriangle className="w-4 h-4 text-[#E67E22]" />
                  <h2 className="text-sm font-bold text-[hsl(var(--foreground))]">Escalated Emails</h2>
                  <span className="ml-auto text-[10px] font-bold text-[#E67E22] px-2 py-0.5 rounded bg-[#E67E2220]">
                    {escalatedCount} flagged
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--secondary)/0.4)]">
                        <th className="text-left px-4 py-2.5 font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Subject</th>
                        <th className="text-left px-3 py-2.5 font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Campus</th>
                        <th className="text-left px-3 py-2.5 font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Reason</th>
                        <th className="text-center px-3 py-2.5 font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Conf.</th>
                        <th className="text-left px-3 py-2.5 font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Time</th>
                        <th className="text-center px-3 py-2.5 font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allResults
                        .filter((r) => r.escalated)
                        .slice()
                        .reverse()
                        .map((r) => {
                          const campus = CAMPUSES.find((c) => c.id === r.campusId) ?? CAMPUSES[0];
                          return (
                            <tr key={r.emailId} className="border-b border-[hsl(var(--border))] hover:bg-[#E67E2208] transition-colors">
                              <td className="px-4 py-3">
                                <div className="font-semibold text-[hsl(var(--foreground))] truncate max-w-[200px]">{r.subject}</div>
                                <div className="mono text-[hsl(var(--muted-foreground))] truncate max-w-[200px]">{r.from}</div>
                              </td>
                              <td className="px-3 py-3">
                                <span className="font-semibold" style={{ color: campus.color }}>{campus.agentName}</span>
                              </td>
                              <td className="px-3 py-3">
                                <span className="text-[#E67E22] font-medium">{r.escalationReason ?? "—"}</span>
                              </td>
                              <td className="px-3 py-3 text-center">
                                <span className="mono font-bold" style={{ color: r.confidence < 60 ? "#E74C3C" : "#E67E22" }}>
                                  {r.confidence}%
                                </span>
                              </td>
                              <td className="px-3 py-3 text-[hsl(var(--muted-foreground))] mono whitespace-nowrap">
                                {formatDateTime(r.processedAt)}
                              </td>
                              <td className="px-3 py-3 text-center">
                                {r.status === "sent" ? (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[hsl(142,72%,45%,0.15)] text-[hsl(142,72%,45%)]">
                                    <CheckCircle className="w-2.5 h-2.5" /> Sent
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E67E2218] text-[#E67E22]">
                                    <AlertTriangle className="w-2.5 h-2.5" /> Pending
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Inbox tab ── */}
        {activeTab === "inbox" && (
          <div className="space-y-4">
            {/* Filters bar */}
            <div className="flex items-center gap-2 flex-wrap p-3 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl">
              <Filter className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
              <span className="text-[11px] font-semibold text-[hsl(var(--muted-foreground))] mr-1">Filter:</span>
              <div className="relative flex-1 min-w-[180px] max-w-[260px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[hsl(var(--muted-foreground))]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search…"
                  className="w-full pl-7 pr-3 py-1.5 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg text-[11px] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--primary)/0.5)]"
                />
              </div>
              <select
                value={filterCampus}
                onChange={(e) => setFilterCampus(e.target.value)}
                className="text-[11px] bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg px-2.5 py-1.5 text-[hsl(var(--foreground))] focus:outline-none cursor-pointer"
              >
                <option value="all">All Campuses</option>
                {CAMPUSES.map((c) => <option key={c.id} value={c.id}>{c.agentName}</option>)}
              </select>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="text-[11px] bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg px-2.5 py-1.5 text-[hsl(var(--foreground))] focus:outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {EMAIL_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
              <button
                onClick={() => setFilterEscalated(!filterEscalated)}
                className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg border font-semibold transition-colors ${
                  filterEscalated
                    ? "bg-[#E67E2218] border-[#E67E2240] text-[#E67E22]"
                    : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                Escalated only
              </button>
              {(filterCampus !== "all" || filterCategory !== "all" || filterEscalated || search) && (
                <button
                  onClick={() => { setFilterCampus("all"); setFilterCategory("all"); setFilterEscalated(false); setSearch(""); }}
                  className="flex items-center gap-1 text-[11px] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Clear all
                </button>
              )}
              <span className="ml-auto text-[11px] text-[hsl(var(--muted-foreground))]">{filtered.length} emails</span>
            </div>

            <EmailInbox results={filtered} onViewResult={() => {}} onMarkSent={handleMarkSent} />
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
