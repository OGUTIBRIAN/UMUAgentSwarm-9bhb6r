import { useState } from "react";
import { Send, ChevronDown, Zap } from "lucide-react";
import { SAMPLE_EMAILS } from "@/constants/umuData";
import type { EmailInput } from "@/types";

interface EmailComposerProps {
  onSubmit: (email: EmailInput) => void;
  isProcessing: boolean;
}

const EmailComposer = ({ onSubmit, isProcessing }: EmailComposerProps) => {
  const [from, setFrom] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [showSamples, setShowSamples] = useState(false);

  const loadSample = (idx: number) => {
    const s = SAMPLE_EMAILS[idx];
    setFrom(s.from);
    setSubject(s.subject);
    setBody(s.body);
    setShowSamples(false);
  };

  const handleSubmit = () => {
    if (!from.trim() || !subject.trim() || !body.trim()) return;
    onSubmit({
      from: from.trim(),
      subject: subject.trim(),
      body: body.trim(),
      receivedAt: new Date().toISOString(),
    });
  };

  const isValid = from.trim() && subject.trim() && body.trim();

  return (
    <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--border))]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[hsl(var(--destructive))]" />
          <div className="w-2 h-2 rounded-full bg-[hsl(43,96%,56%)]" />
          <div className="w-2 h-2 rounded-full bg-[hsl(142,72%,45%)]" />
          <span className="ml-2 text-xs font-semibold text-[hsl(var(--foreground))]">Simulate Incoming Email</span>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowSamples(!showSamples)}
            className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-md bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--accent)/0.15)] border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--accent))] transition-colors"
          >
            <Zap className="w-3 h-3" />
            Load Sample
            <ChevronDown className={`w-3 h-3 transition-transform ${showSamples ? "rotate-180" : ""}`} />
          </button>
          {showSamples && (
            <div className="absolute right-0 top-full mt-1 w-80 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg shadow-xl z-20 overflow-hidden">
              {SAMPLE_EMAILS.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => loadSample(i)}
                  className="w-full text-left px-3 py-2.5 hover:bg-[hsl(var(--secondary))] border-b border-[hsl(var(--border))] last:border-0 transition-colors"
                >
                  <div className="text-xs font-medium text-[hsl(var(--foreground))] truncate">{s.subject}</div>
                  <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5">{s.from}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <label className="text-[11px] font-semibold text-[hsl(var(--muted-foreground))] w-12 flex-shrink-0 uppercase tracking-wider">From</label>
          <input
            type="email"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="sender@example.com"
            className="flex-1 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-md px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--primary)/0.6)] focus:ring-1 focus:ring-[hsl(var(--primary)/0.3)] transition-colors mono"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="text-[11px] font-semibold text-[hsl(var(--muted-foreground))] w-12 flex-shrink-0 uppercase tracking-wider">Subj.</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject line..."
            className="flex-1 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-md px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--primary)/0.6)] focus:ring-1 focus:ring-[hsl(var(--primary)/0.3)] transition-colors"
          />
        </div>

        <div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write the email body here, or load a sample above..."
            rows={6}
            className="w-full bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-md px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--primary)/0.6)] focus:ring-1 focus:ring-[hsl(var(--primary)/0.3)] transition-colors resize-none leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
            {body.length > 0 ? `${body.length} characters` : "Compose a message to route through the swarm"}
          </span>
          <button
            onClick={handleSubmit}
            disabled={!isValid || isProcessing}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold text-sm hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all glow-gold"
          >
            <Send className="w-4 h-4" />
            {isProcessing ? "Processing…" : "Send to Swarm"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailComposer;
