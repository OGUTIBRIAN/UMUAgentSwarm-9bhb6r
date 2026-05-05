import { useState, useEffect, useRef } from "react";
import {
  CheckCircle, Copy, RotateCcw, Building2, Tag, Cpu,
  Mail, Clock, ChevronDown, ChevronUp, Percent, Send, AtSign, Loader2, AlertTriangle,
} from "lucide-react";
import { CAMPUSES, buildMailtoLink, UMU_ESCALATION_CONTACTS } from "@/constants/umuData";
import { formatDateTime } from "@/lib/utils";
import type { RoutingResult } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { FunctionsHttpError } from "@supabase/supabase-js";

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

// ── Typing animation hook ────────────────────────────────────────────────────
function useTypingEffect(text: string, speed = 12) {
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
        const charsPerFrame = Math.max(1, Math.floor(text.length / 300));
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

// ── Component ────────────────────────────────────────────────────────────────
const ResultView = ({ result, onReset, onMarkSent }: ResultViewProps) => {
  const [showOriginal, setShowOriginal] = useState(false);
  const [showCCInfo, setShowCCInfo] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const campus = CAMPUSES.find((c) => c.id === result.campusId) ?? CAMPUSES[0];
  const catColor = CATEGORY_COLORS[result.category] || "#F5A623";
  const isSent = result.status === "sent";
  const isEscalated = result.escalated === true;

  // Build CC summary — escalated emails include Dean + VC
  const ccSummary = isEscalated
    ? `${campus.ccEmail}, ${UMU_ESCALATION_CONTACTS.deanOfStudies}, ${UMU_ESCALATION_CONTACTS.vc}`
    : campus.ccEmail;

  const { displayed: typedReply, isDone: typingDone } = useTypingEffect(result.draftReply, 12);

  const copyReply = () => {
    navigator.clipboard.writeText(result.draftReply);
    setCopied(true);
    toast.success("Draft reply copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendReply = async () => {
    if (isSent || sending) return;
    setSending(true);

    const escalationContacts = isEscalated
      ? [UMU_ESCALATION_CONTACTS.deanOfStudies, UMU_ESCALATION_CONTACTS.vc]
      : undefined;

    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: result.from,
        subject: `Re: ${result.subject}`,
        body: result.draftReply,
        cc: campus.ccEmail,
        fromName: `${result.agentName} — Uganda Martyrs University`,
        replyTo: campus.email,
        escalated: isEscalated,
        escalationContacts,
      },
    });

    if (error) {
      let errorMessage = error.message;
      if (error instanceof FunctionsHttpError) {
        try {
          const textContent = await error.context?.text();
          errorMessage = textContent || error.message;
        } catch { /* ignore */ }
      }

      if (errorMessage.includes('RESEND_API_KEY') || errorMessage.includes('not configured')) {
        toast.info('Email service not yet configured — opening your email client instead');
        const url = buildMailtoLink({ to: result.from, subject: result.subject, body: result.draftReply, cc: ccSummary });
        window.open(url, '_self');
        if (onMarkSent) onMarkSent(result.emailId);
      } else {
        toast.error(`Send failed: ${errorMessage}`);
      }
      setSending(false);
      return;
    }

    setSending(false);
    if (onMarkSent) onMarkSent(result.emailId);
    const sentMsg = isEscalated
      ? `Email sent — CC'd ${campus.ccEmail}, Dean of Studies & Vice Chancellor`
      : `Email sent to ${result.from} — CC'd ${campus.ccEmail}`;
    toast.success(sentMsg);
    console.log('[send-email] Message ID:', data?.messageId);
  };

  return (
    <div className="space-y-3 fade-in-up">
      {/* Escalation banner */}
      {isEscalated && (
        <div className="flex items-start gap-2.5 px-4 py-3 bg-[#E67E2210] border border-[#E67E2240] rounded-xl">
          <AlertTriangle className="w-4 h-4 text-[#E67E22] flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-[#E67E22] mb-0.5">Escalation Flag Active</div>
            <div className="text-[11px] text-[hsl(var(--muted-foreground))]">{result.escalationReason}</div>
            <div className="text-[11px] text-[hsl(var(--muted-foreground))] mt-1">
              Dean of Studies &amp; Vice Chancellor will be CC'd when you send this reply.
            </div>
          </div>
        </div>
      )}

      {/* Routing summary */}
      <div className="bg-[hsl(var(--card))] border rounded-xl p-4" style={{ borderColor: `${campus.color}40` }}>
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

        <div className="mt-3 bg-[hsl(var(--background))] rounded-lg p-2.5 border border-[hsl(var(--border))]">
          <div className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1">Agent reasoning</div>
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
            {typingDone && isEscalated && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-[#E67E22] px-1.5 py-0.5 rounded bg-[#E67E2218]">
                <AlertTriangle className="w-3 h-3" /> Escalated
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
              disabled={!typingDone || sending || isSent}
              className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-md border font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${
                isSent
                  ? "bg-[hsl(142,72%,45%,0.15)] border-[hsl(142,72%,45%,0.4)] text-[hsl(142,72%,45%)] cursor-default"
                  : isEscalated
                  ? "bg-[#E67E2218] border-[#E67E2240] text-[#E67E22] hover:bg-[#E67E2230]"
                  : "bg-[hsl(var(--primary)/0.15)] border-[hsl(var(--primary)/0.4)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.25)]"
              }`}
            >
              {sending ? (
                <><Loader2 className="w-3 h-3 animate-spin" />Sending…</>
              ) : isSent ? (
                <><CheckCircle className="w-3 h-3" />Sent</>
              ) : (
                <><Send className="w-3 h-3" />Send{isEscalated ? " + Escalate" : " Reply"}</>
              )}
            </button>
          </div>
        </div>

        {/* Streaming text */}
        <div className="p-4 min-h-[120px]">
          <pre className="text-[12px] text-[hsl(var(--foreground))] whitespace-pre-wrap leading-relaxed font-sans">
            {typedReply}
            {!typingDone && (
              <span className="inline-block w-0.5 h-3.5 bg-[hsl(var(--primary))] ml-0.5 animate-pulse align-middle" />
            )}
          </pre>
        </div>

        {/* CC info */}
        {typingDone && (
          <div className={`border-t px-4 py-2 ${isEscalated ? "border-[#E67E2240] bg-[#E67E2208]" : "border-[hsl(var(--border))] bg-[hsl(var(--secondary)/0.3)]"}`}>
            <button
              onClick={() => setShowCCInfo(!showCCInfo)}
              className="flex items-center gap-2 text-[10px] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors w-full"
            >
              <AtSign className="w-3 h-3 flex-shrink-0" />
              <span>
                {isSent
                  ? <>Email sent ✓ — CC'd <strong className="text-[hsl(var(--foreground))]">{ccSummary}</strong></>
                  : <>Sending will CC <strong className={isEscalated ? "text-[#E67E22]" : "text-[hsl(var(--foreground))]"}>{ccSummary}</strong></>}
              </span>
              {showCCInfo ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
            </button>
            {showCCInfo && (
              <div className="mt-2 p-2.5 rounded-lg bg-[hsl(var(--background))] border border-[hsl(var(--border))] space-y-1.5 text-[10px] text-[hsl(var(--muted-foreground))]">
                <div className="flex gap-2"><span className="w-14 font-semibold text-[hsl(var(--foreground))]">To:</span><span className="mono">{result.from}</span></div>
                <div className="flex gap-2"><span className="w-14 font-semibold text-[hsl(var(--foreground))]">CC:</span><span className="mono">{ccSummary}</span></div>
                <div className="flex gap-2"><span className="w-14 font-semibold text-[hsl(var(--foreground))]">Subject:</span><span>Re: {result.subject}</span></div>
                {isEscalated && (
                  <div className="mt-2 pt-2 border-t border-[#E67E2240] text-[#E67E22] font-medium">
                    ⚠ Escalated — Dean of Studies and Vice Chancellor automatically included in CC.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
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
