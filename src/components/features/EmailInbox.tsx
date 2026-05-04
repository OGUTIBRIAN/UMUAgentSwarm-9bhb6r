import { useState, useEffect, useRef } from "react";
import {
  Inbox, Search, ChevronRight, CheckCircle, Percent,
  Building2, Tag, Clock, X, Copy, Mail, ChevronDown, ChevronUp, Send, AtSign,
} from "lucide-react";
import type { RoutingResult } from "@/types";
import { formatDateTime } from "@/lib/utils";
import { CAMPUSES, buildMailtoLink } from "@/constants/umuData";
import { toast } from "sonner";

interface EmailInboxProps {
  results: RoutingResult[];
  onViewResult: (result: RoutingResult) => void;
  onMarkSent?: (emailId: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  admissions: "#F5A623",
  student_support: "#29ABE2",
  academic: "#27AE60",
  administrative: "#9B59B6",
  medical: "#E74C3C",
  engineering: "#E67E22",
};

const ConfidenceBadge = ({ value }: { value: number }) => {
  const color = value >= 80 ? "#27AE60" : value >= 60 ? "#F5A623" : "#E74C3C";
  return (
    <div
      className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold mono"
      style={{ color, backgroundColor: `${color}20` }}
    >
      <Percent className="w-2.5 h-2.5" />
      {value}
    </div>
  );
};

// ── Typing effect for modal ──────────────────────────────────────────────────
function useTypingEffect(text: string, speed = 10) {
  const [displayed, setDisplayed] = useState("");
  const [isDone, setIsDone] = useState(false);
  const rafRef = useRef<number | null>(null);
  const indexRef = useRef(0);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    setDisplayed("");
    setIsDone(false);
    indexRef.current = 0;
    lastTimeRef.current = 0;

    const step = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const elapsed = timestamp - lastTimeRef.current;
      if (elapsed >= speed) {
        const charsPerFrame = Math.max(1, Math.floor(text.length / 250));
        indexRef.current = Math.min(indexRef.current + charsPerFrame, text.length);
        setDisplayed(text.slice(0, indexRef.current));
        lastTimeRef.current = timestamp;
        if (indexRef.current >= text.length) { setIsDone(true); return; }
      }
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [text, speed]);

  return { displayed, isDone };
}

// ── Detail Modal ─────────────────────────────────────────────────────────────
interface DetailModalProps {
  result: RoutingResult;
  onClose: () => void;
  onMarkSent?: (emailId: string) => void;
}

const DetailModal = ({ result, onClose, onMarkSent }: DetailModalProps) => {
  const [showOriginal, setShowOriginal] = useState(false);
  const [showCCInfo, setShowCCInfo] = useState(false);
  const [copied, setCopied] = useState(false);
  const campus = CAMPUSES.find((c) => c.id === result.campusId) ?? CAMPUSES[0];
  const catColor = CATEGORY_COLORS[result.category] || "#F5A623";
  const isSent = result.status === "sent";

  const { displayed: typedReply, isDone: typingDone } = useTypingEffect(result.draftReply, 10);

  const copyReply = () => {
    navigator.clipboard.writeText(result.draftReply);
    setCopied(true);
    toast.success("Draft reply copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendReply = () => {
    const url = buildMailtoLink({
      to: result.from,
      subject: result.subject,
      body: result.draftReply,
      cc: campus.ccEmail,
    });
    window.open(url, "_self");
    if (!isSent && onMarkSent) {
      onMarkSent(result.emailId);
      toast.success(`Reply sent — CC'd to ${campus.ccEmail}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: `0 0 40px ${campus.color}20` }}
      >
        {/* Modal header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3.5 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] rounded-t-2xl">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[hsl(142,72%,45%)]" />
            <span className="text-sm font-bold text-[hsl(var(--foreground))]">Email Result</span>
            <span className="text-[10px] mono text-[hsl(var(--muted-foreground))] px-1.5 py-0.5 bg-[hsl(var(--secondary))] rounded">{result.emailId}</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Subject */}
          <div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] mb-0.5">Subject</div>
            <div className="text-sm font-semibold text-[hsl(var(--foreground))]">{result.subject}</div>
            <div className="text-[11px] mono text-[hsl(var(--muted-foreground))] mt-0.5">{result.from}</div>
          </div>

          {/* Routing grid */}
          <div className="border rounded-xl p-4" style={{ borderColor: `${campus.color}40` }}>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[hsl(var(--background))] rounded-lg p-2.5 border border-[hsl(var(--border))]">
                <div className="flex items-center gap-1.5 mb-1">
                  <Building2 className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
                  <span className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Campus</span>
                </div>
                <div className="text-xs font-bold" style={{ color: campus.color }}>{campus.agentName}</div>
                <div className="text-[10px] text-[hsl(var(--muted-foreground))]">{campus.name}</div>
              </div>
              <div className="bg-[hsl(var(--background))] rounded-lg p-2.5 border border-[hsl(var(--border))]">
                <div className="flex items-center gap-1.5 mb-1">
                  <Tag className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
                  <span className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Category</span>
                </div>
                <div className="text-xs font-bold" style={{ color: catColor }}>{result.categoryLabel}</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <Percent className="w-2.5 h-2.5 text-[hsl(var(--muted-foreground))]" />
                  <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{result.confidence}% confidence</span>
                </div>
              </div>
              <div className="bg-[hsl(var(--background))] rounded-lg p-2.5 border border-[hsl(var(--border))]">
                <div className="flex items-center gap-1.5 mb-1">
                  <Mail className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
                  <span className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Faculty</span>
                </div>
                <div className="text-[11px] font-semibold text-[hsl(var(--foreground))] leading-tight">{result.faculty}</div>
              </div>
              <div className="bg-[hsl(var(--background))] rounded-lg p-2.5 border border-[hsl(var(--border))]">
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
                  <span className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Processed</span>
                </div>
                <div className="text-[11px] font-semibold text-[hsl(var(--foreground))]">{formatDateTime(result.processedAt)}</div>
              </div>
            </div>
            <div className="mt-3 bg-[hsl(var(--background))] rounded-lg p-2.5 border border-[hsl(var(--border))]">
              <div className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1">Agent Reasoning</div>
              <p className="text-[11px] text-[hsl(var(--foreground))] leading-relaxed">{result.reasoning}</p>
            </div>
          </div>

          {/* Draft reply with streaming effect */}
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[hsl(var(--border))] bg-[hsl(var(--secondary)/0.5)]">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[hsl(var(--primary))]" />
                <span className="text-xs font-semibold text-[hsl(var(--foreground))]">Draft Reply — {result.agentName}</span>
                {!typingDone && (
                  <span className="flex items-center gap-1 text-[10px] text-[hsl(var(--primary))] animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--primary))] inline-block" />
                    AI writing…
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyReply}
                  disabled={!typingDone}
                  className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-md bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--primary)/0.15)] border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {copied ? <CheckCircle className="w-3 h-3 text-[hsl(142,72%,45%)]" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={handleSendReply}
                  disabled={!typingDone}
                  className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-md border font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${
                    isSent
                      ? "bg-[hsl(142,72%,45%,0.15)] border-[hsl(142,72%,45%,0.4)] text-[hsl(142,72%,45%)] cursor-default"
                      : "bg-[hsl(var(--primary)/0.15)] border-[hsl(var(--primary)/0.4)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.25)]"
                  }`}
                >
                  {isSent ? <CheckCircle className="w-3 h-3" /> : <Send className="w-3 h-3" />}
                  {isSent ? "Sent" : "Send Reply"}
                </button>
              </div>
            </div>
            <div className="p-4 max-h-64 overflow-y-auto">
              <pre className="text-[12px] text-[hsl(var(--foreground))] whitespace-pre-wrap leading-relaxed font-sans">
                {typedReply}
                {!typingDone && (
                  <span className="inline-block w-0.5 h-3.5 bg-[hsl(var(--primary))] ml-0.5 animate-pulse align-middle" />
                )}
              </pre>
            </div>

            {/* CC info banner */}
            {typingDone && (
              <div className="border-t border-[hsl(var(--border))] px-4 py-2 bg-[hsl(var(--secondary)/0.3)]">
                <button
                  onClick={() => setShowCCInfo(!showCCInfo)}
                  className="flex items-center gap-2 text-[10px] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors w-full"
                >
                  <AtSign className="w-3 h-3 flex-shrink-0" />
                  <span>Sending will CC <strong className="text-[hsl(var(--foreground))]">{campus.ccEmail}</strong> ({campus.name})</span>
                  {showCCInfo ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
                </button>
                {showCCInfo && (
                  <div className="mt-2 p-2.5 rounded-lg bg-[hsl(var(--background))] border border-[hsl(var(--border))] space-y-1 text-[10px] text-[hsl(var(--muted-foreground))]">
                    <div className="flex gap-2"><span className="w-14 font-semibold text-[hsl(var(--foreground))]">To:</span><span className="mono">{result.from}</span></div>
                    <div className="flex gap-2"><span className="w-14 font-semibold text-[hsl(var(--foreground))]">CC:</span><span className="mono">{campus.ccEmail}</span></div>
                    <div className="flex gap-2"><span className="w-14 font-semibold text-[hsl(var(--foreground))]">Subject:</span><span>Re: {result.subject}</span></div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Original email toggle */}
          <button
            onClick={() => setShowOriginal(!showOriginal)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-xl text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            <span>View original email</span>
            {showOriginal ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {showOriginal && (
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4">
              <div className="space-y-2 text-[11px]">
                <div className="flex gap-2"><span className="text-[hsl(var(--muted-foreground))] w-14">From:</span><span className="text-[hsl(var(--foreground))] mono">{result.from}</span></div>
                <div className="flex gap-2"><span className="text-[hsl(var(--muted-foreground))] w-14">Subject:</span><span className="text-[hsl(var(--foreground))]">{result.subject}</span></div>
                <div className="flex gap-2"><span className="text-[hsl(var(--muted-foreground))] w-14">Time:</span><span className="text-[hsl(var(--foreground))]">{formatDateTime(result.receivedAt)}</span></div>
              </div>
              <div className="mt-3 pt-3 border-t border-[hsl(var(--border))]">
                <pre className="text-[11px] text-[hsl(var(--muted-foreground))] whitespace-pre-wrap leading-relaxed font-sans">{result.body}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Inbox Component ─────────────────────────────────────────────────────
const EmailInbox = ({ results, onViewResult, onMarkSent }: EmailInboxProps) => {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterCampus, setFilterCampus] = useState<string>("all");
  const [selectedResult, setSelectedResult] = useState<RoutingResult | null>(null);

  const categories = Array.from(new Set(results.map((r) => r.category)));
  const campuses = Array.from(new Set(results.map((r) => r.campusId)));

  const filtered = results.filter((r) => {
    const matchSearch =
      !search ||
      r.subject.toLowerCase().includes(search.toLowerCase()) ||
      r.from.toLowerCase().includes(search.toLowerCase()) ||
      r.agentName.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "all" || r.category === filterCategory;
    const matchCampus = filterCampus === "all" || r.campusId === filterCampus;
    return matchSearch && matchCat && matchCampus;
  });

  const handleRowClick = (result: RoutingResult) => {
    setSelectedResult(result);
    onViewResult(result);
  };

  // Keep modal result in sync when parent marks as sent
  const modalResult = selectedResult
    ? results.find((r) => r.emailId === selectedResult.emailId) ?? selectedResult
    : null;

  return (
    <>
      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-2">
            <Inbox className="w-4 h-4 text-[hsl(var(--primary))]" />
            <h2 className="text-sm font-bold text-[hsl(var(--foreground))]">Email History</h2>
            <span className="text-[10px] mono px-1.5 py-0.5 rounded bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.3)]">
              {results.length} processed
            </span>
          </div>
          <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
            {filtered.length !== results.length ? `${filtered.length} shown` : ""}
          </span>
        </div>

        {/* Search + filters */}
        <div className="px-4 py-3 border-b border-[hsl(var(--border))] space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by subject, sender, or agent…"
              className="w-full pl-8 pr-3 py-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg text-xs text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--primary)/0.6)] focus:ring-1 focus:ring-[hsl(var(--primary)/0.3)] transition-colors"
            />
          </div>
          {results.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="text-[11px] bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-md px-2 py-1 text-[hsl(var(--foreground))] focus:outline-none focus:border-[hsl(var(--primary)/0.5)] cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
              <select
                value={filterCampus}
                onChange={(e) => setFilterCampus(e.target.value)}
                className="text-[11px] bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-md px-2 py-1 text-[hsl(var(--foreground))] focus:outline-none focus:border-[hsl(var(--primary)/0.5)] cursor-pointer"
              >
                <option value="all">All Campuses</option>
                {campuses.map((id) => {
                  const campus = CAMPUSES.find((c) => c.id === id);
                  return <option key={id} value={id}>{campus?.agentName ?? id}</option>;
                })}
              </select>
              {(filterCategory !== "all" || filterCampus !== "all" || search) && (
                <button
                  onClick={() => { setFilterCategory("all"); setFilterCampus("all"); setSearch(""); }}
                  className="flex items-center gap-1 text-[11px] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] transition-colors"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
          )}
        </div>

        {/* Table */}
        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-12 h-12 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] flex items-center justify-center mb-3">
              <Inbox className="w-6 h-6 text-[hsl(var(--muted-foreground))] opacity-40" />
            </div>
            <p className="text-sm font-semibold text-[hsl(var(--foreground))]">Inbox is empty</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Process emails through the swarm to see history here</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <Search className="w-6 h-6 text-[hsl(var(--muted-foreground))] mb-2 opacity-40" />
            <p className="text-xs text-[hsl(var(--muted-foreground))]">No results match your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--secondary)/0.5)]">
                  <th className="text-left px-4 py-2.5 font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider w-[35%]">Subject</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider w-[18%]">From</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider w-[15%]">Campus Agent</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider w-[16%]">Category</th>
                  <th className="text-center px-3 py-2.5 font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider w-[8%]">Conf.</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider w-[8%]">Time</th>
                  <th className="text-center px-3 py-2.5 font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider w-[8%]">Status</th>
                  <th className="px-3 py-2.5 w-6" />
                </tr>
              </thead>
              <tbody>
                {filtered
                  .slice()
                  .reverse()
                  .map((result, idx) => {
                    const campus = CAMPUSES.find((c) => c.id === result.campusId) ?? CAMPUSES[0];
                    const catColor = CATEGORY_COLORS[result.category] || "#F5A623";
                    const isEven = idx % 2 === 0;
                    return (
                      <tr
                        key={result.emailId}
                        onClick={() => handleRowClick(result)}
                        className={`border-b border-[hsl(var(--border))] cursor-pointer transition-colors hover:bg-[hsl(var(--primary)/0.06)] group ${
                          isEven ? "bg-transparent" : "bg-[hsl(var(--secondary)/0.3)]"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="font-semibold text-[hsl(var(--foreground))] truncate max-w-[200px]">{result.subject}</div>
                          <div className="text-[hsl(var(--muted-foreground))] truncate max-w-[200px] mt-0.5 mono">{result.emailId}</div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="mono text-[hsl(var(--foreground))] truncate max-w-[130px]">{result.from.split("@")[0]}</div>
                          <div className="text-[hsl(var(--muted-foreground))] truncate max-w-[130px]">@{result.from.split("@")[1]}</div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: campus.color }} />
                            <span className="font-semibold truncate" style={{ color: campus.color }}>{campus.agentName}</span>
                          </div>
                          <div className="text-[hsl(var(--muted-foreground))] truncate mt-0.5 ml-3">{campus.short}</div>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold"
                            style={{ color: catColor, backgroundColor: `${catColor}18` }}
                          >
                            {result.categoryLabel}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <ConfidenceBadge value={result.confidence} />
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-[hsl(var(--muted-foreground))] mono whitespace-nowrap">{formatDateTime(result.processedAt)}</div>
                        </td>
                        <td className="px-3 py-3 text-center">
                          {result.status === "sent" ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[hsl(142,72%,45%,0.15)] text-[hsl(142,72%,45%)] border border-[hsl(142,72%,45%,0.3)]">
                              <CheckCircle className="w-2.5 h-2.5" /> Sent
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.3)]">
                              <Mail className="w-2.5 h-2.5" /> Draft
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <ChevronRight className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))] transition-colors" />
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalResult && (
        <DetailModal
          result={modalResult}
          onClose={() => setSelectedResult(null)}
          onMarkSent={onMarkSent}
        />
      )}
    </>
  );
};

export default EmailInbox;
