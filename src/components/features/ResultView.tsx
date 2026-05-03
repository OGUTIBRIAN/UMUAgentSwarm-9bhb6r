import { useState } from "react";
import {
  CheckCircle, Copy, RotateCcw, Building2, Tag, Cpu,
  Mail, Clock, ChevronDown, ChevronUp, Percent, Send,
} from "lucide-react";
import { CAMPUSES } from "@/constants/umuData";
import { formatDateTime } from "@/lib/utils";
import type { RoutingResult } from "@/types";
import { toast } from "sonner";

interface ResultViewProps {
  result: RoutingResult;
  onReset: () => void;
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

const ResultView = ({ result, onReset, onMarkSent }: ResultViewProps) => {
  const [showOriginal, setShowOriginal] = useState(false);
  const [copied, setCopied] = useState(false);
  const campus = CAMPUSES.find((c) => c.id === result.campusId)!;
  const catColor = CATEGORY_COLORS[result.category] || "#F5A623";
  const isSent = result.status === "sent";

  const copyReply = () => {
    navigator.clipboard.writeText(result.draftReply);
    setCopied(true);
    toast.success("Draft reply copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendReply = () => {
    const mailtoUrl = `mailto:${encodeURIComponent(result.from)}?subject=${encodeURIComponent(`Re: ${result.subject}`)}&body=${encodeURIComponent(result.draftReply)}`;
    window.open(mailtoUrl, "_self");
    if (!isSent && onMarkSent) {
      onMarkSent(result.emailId);
      toast.success("Reply sent — email client opened");
    }
  };

  return (
    <div className="space-y-3 fade-in-up">
      {/* Routing summary */}
      <div
        className="bg-[hsl(var(--card))] border rounded-xl p-4"
        style={{ borderColor: `${campus.color}40` }}
      >
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="w-4 h-4 text-[hsl(142,72%,45%)]" />
          <span className="text-xs font-semibold text-[hsl(var(--foreground))]">Email Successfully Routed</span>
          <span className="ml-auto text-[10px] mono text-[hsl(var(--muted-foreground))]">{result.emailId}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[hsl(var(--background))] rounded-lg p-2.5 border border-[hsl(var(--border))]">
            <div className="flex items-center gap-1.5 mb-1">
              <Building2 className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
              <span className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Campus</span>
            </div>
            <div className="text-xs font-bold" style={{ color: campus.color }}>
              {campus.agentName}
            </div>
            <div className="text-[10px] text-[hsl(var(--muted-foreground))]">{campus.name}</div>
          </div>

          <div className="bg-[hsl(var(--background))] rounded-lg p-2.5 border border-[hsl(var(--border))]">
            <div className="flex items-center gap-1.5 mb-1">
              <Tag className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
              <span className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Category</span>
            </div>
            <div className="text-xs font-bold" style={{ color: catColor }}>
              {result.categoryLabel}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Percent className="w-2.5 h-2.5 text-[hsl(var(--muted-foreground))]" />
              <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{result.confidence}% confidence</span>
            </div>
          </div>

          <div className="bg-[hsl(var(--background))] rounded-lg p-2.5 border border-[hsl(var(--border))]">
            <div className="flex items-center gap-1.5 mb-1">
              <Cpu className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
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

        {/* Reasoning */}
        <div className="mt-3 bg-[hsl(var(--background))] rounded-lg p-2.5 border border-[hsl(var(--border))]">
          <div className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1">Agent reasoning</div>
          <p className="text-[11px] text-[hsl(var(--foreground))] leading-relaxed">{result.reasoning}</p>
        </div>
      </div>

      {/* Draft reply */}
      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[hsl(var(--border))] bg-[hsl(var(--secondary)/0.5)]">
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-[hsl(var(--primary))]" />
            <span className="text-xs font-semibold text-[hsl(var(--foreground))]">
              Draft Reply — {result.agentName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyReply}
              className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-md bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--primary)/0.15)] border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors"
            >
              {copied ? <CheckCircle className="w-3 h-3 text-[hsl(142,72%,45%)]" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={handleSendReply}
              className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-md border font-semibold transition-colors ${
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

        <div className="p-4">
          <pre className="text-[12px] text-[hsl(var(--foreground))] whitespace-pre-wrap leading-relaxed font-sans">
            {result.draftReply}
          </pre>
        </div>
      </div>

      {/* Original email toggle */}
      <button
        onClick={() => setShowOriginal(!showOriginal)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
      >
        <span>View original email</span>
        {showOriginal ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {showOriginal && (
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4 fade-in-up">
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

      {/* Reset */}
      <button
        onClick={onReset}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--border))] border border-[hsl(var(--border))] rounded-xl text-xs font-semibold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Process Another Email
      </button>
    </div>
  );
};

export default ResultView;
