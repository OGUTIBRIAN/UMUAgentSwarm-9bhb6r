import { useState, useCallback, useEffect } from "react";
import { Send, Inbox, Loader2, Database } from "lucide-react";
import { CAMPUSES } from "@/constants/umuData";
import { processEmail, buildProcessingSteps } from "@/lib/agentEngine";
import { saveEmailLog, loadEmailLogs, markEmailSent } from "@/lib/emailStorage";
import { useAuth } from "@/hooks/useAuth";
import type { EmailInput, RoutingResult, ActivityEvent, ProcessingStep } from "@/types";

import Header from "@/components/layout/Header";
import HeroBanner from "@/components/features/HeroBanner";
import CampusAgentPanel from "@/components/features/CampusAgentPanel";
import EmailComposer from "@/components/features/EmailComposer";
import ProcessingView from "@/components/features/ProcessingView";
import ResultView from "@/components/features/ResultView";
import ActivityFeed from "@/components/features/ActivityFeed";
import AnalyticsPanel from "@/components/features/AnalyticsPanel";
import EmailInbox from "@/components/features/EmailInbox";

type ViewState = "compose" | "processing" | "result";
type CenterTab = "compose" | "inbox";

const Index = () => {
  const { user } = useAuth();
  const [view, setView] = useState<ViewState>("compose");
  const [centerTab, setCenterTab] = useState<CenterTab>("compose");
  const [pendingResult, setPendingResult] = useState<RoutingResult | null>(null);
  const [currentResult, setCurrentResult] = useState<RoutingResult | null>(null);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  const [allResults, setAllResults] = useState<RoutingResult[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityEvent[]>([]);
  const [activeCampusId, setActiveCampusId] = useState<string | undefined>();
  const [dbLoading, setDbLoading] = useState(true);

  // ── Load persisted emails from DB on mount ─────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setDbLoading(true);
      const logs = await loadEmailLogs();
      // Filter by campus if user is campus-scoped (RLS handles it, but also filter in memory)
      const filtered = user?.campusId
        ? logs.filter((l) => l.campusId === user.campusId)
        : logs;
      setAllResults(filtered);
      setDbLoading(false);
    };
    load();
  }, [user?.campusId]);

  // Campus processed counts
  const processedCounts: Record<string, number> = {};
  allResults.forEach((r) => {
    processedCounts[r.campusId] = (processedCounts[r.campusId] || 0) + 1;
  });

  const handleEmailSubmit = useCallback(async (email: EmailInput) => {
    const placeholderSteps = buildProcessingSteps("Campus Agent", "AI Agent", "email");
    setProcessingSteps(placeholderSteps);
    setActiveCampusId(undefined);
    setView("processing");

    const receivedEvent: ActivityEvent = {
      id: `ev-${Date.now()}-r`,
      type: "received",
      agentName: "Intake Agent",
      campusId: "nkozi",
      campusColor: "#F5A623",
      subject: email.subject,
      category: "Processing…",
      timestamp: new Date().toISOString(),
    };
    setActivityFeed((prev) => [...prev, receivedEvent]);

    const result = await processEmail(email);
    const steps = buildProcessingSteps(result.campusName, result.agentName, result.categoryLabel);
    const fullResult: RoutingResult = { ...result, processingSteps: steps };

    setPendingResult(fullResult);
    setProcessingSteps(steps);
    setActiveCampusId(result.campusId);
  }, []);

  const handleProcessingComplete = useCallback(async () => {
    if (!pendingResult) return;

    const campus = CAMPUSES.find((c) => c.id === pendingResult.campusId)!;

    const routedEvent: ActivityEvent = {
      id: `ev-${Date.now()}-rt`,
      type: "routed",
      agentName: pendingResult.agentName,
      campusId: pendingResult.campusId,
      campusColor: campus.color,
      subject: pendingResult.subject,
      category: pendingResult.categoryLabel,
      timestamp: new Date().toISOString(),
    };
    const repliedEvent: ActivityEvent = {
      id: `ev-${Date.now()}-rp`,
      type: "replied",
      agentName: pendingResult.agentName,
      campusId: pendingResult.campusId,
      campusColor: campus.color,
      subject: pendingResult.subject,
      category: pendingResult.categoryLabel,
      timestamp: new Date().toISOString(),
    };

    setActivityFeed((prev) => [...prev, routedEvent, repliedEvent]);
    setCurrentResult(pendingResult);
    setAllResults((prev) => [...prev, pendingResult]);
    setView("result");

    // Save to database
    await saveEmailLog(pendingResult);
  }, [pendingResult]);

  const handleReset = useCallback(() => {
    setView("compose");
    setCurrentResult(null);
    setPendingResult(null);
    setActiveCampusId(undefined);
    setProcessingSteps([]);
    setCenterTab("compose");
  }, []);

  const handleMarkSent = useCallback(async (emailId: string) => {
    setAllResults((prev) =>
      prev.map((r) => (r.emailId === emailId ? { ...r, status: "sent" as const } : r))
    );
    if (currentResult?.emailId === emailId) {
      setCurrentResult((prev) => prev ? { ...prev, status: "sent" as const } : prev);
    }
    // Persist to DB
    await markEmailSent(emailId);
  }, [currentResult]);

  const handleViewFromInbox = useCallback((_result: RoutingResult) => {
    // Shown in modal inside EmailInbox
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] grid-bg flex flex-col">
      <Header
        activeEmails={view === "processing" ? 1 : 0}
        totalProcessed={allResults.length}
      />

      <main className="flex-1 p-4 md:p-6 max-w-[1400px] mx-auto w-full">
        <HeroBanner />

        {/* Campus scope banner */}
        {user?.campusId && (
          <div className="mb-4 flex items-center gap-2 px-4 py-2.5 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: CAMPUSES.find((c) => c.id === user.campusId)?.color || '#F5A623' }}
            />
            <span className="text-xs text-[hsl(var(--foreground))]">
              Signed in as <strong>{user.username}</strong> — viewing{" "}
              <strong>{CAMPUSES.find((c) => c.id === user.campusId)?.agentName}</strong> emails only
            </span>
            {dbLoading && (
              <span className="ml-auto flex items-center gap-1.5 text-[10px] text-[hsl(var(--muted-foreground))]">
                <Loader2 className="w-3 h-3 animate-spin" />
                Loading history…
              </span>
            )}
            {!dbLoading && (
              <span className="ml-auto flex items-center gap-1.5 text-[10px] text-[hsl(142,72%,45%)]">
                <Database className="w-3 h-3" />
                {allResults.length} emails synced
              </span>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_260px] gap-4">
          {/* Left: Campus agent network */}
          <div className="space-y-4">
            <CampusAgentPanel activeCampusId={activeCampusId} processedCounts={processedCounts} />
          </div>

          {/* Center: Main interaction */}
          <div className="space-y-4">
            {view !== "processing" && (
              <div className="flex items-center gap-1 p-1 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl">
                <button
                  onClick={() => { setCenterTab("compose"); if (view === "result") handleReset(); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                    centerTab === "compose" || view === "result"
                      ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow"
                      : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]"
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  Compose
                </button>
                <button
                  onClick={() => setCenterTab("inbox")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                    centerTab === "inbox" && view === "compose"
                      ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow"
                      : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]"
                  }`}
                >
                  <Inbox className="w-3.5 h-3.5" />
                  Inbox
                  {allResults.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-[hsl(var(--primary)/0.2)] text-[hsl(var(--primary))] text-[10px] mono">
                      {allResults.length}
                    </span>
                  )}
                </button>
              </div>
            )}

            {(centerTab === "compose" || view === "processing" || view === "result") && (
              <>
                {view === "compose" && centerTab === "compose" && (
                  <EmailComposer onSubmit={handleEmailSubmit} isProcessing={false} />
                )}
                {view === "processing" && (
                  <ProcessingView steps={processingSteps} onComplete={handleProcessingComplete} />
                )}
                {view === "result" && currentResult && (
                  <ResultView result={currentResult} onReset={handleReset} onMarkSent={handleMarkSent} />
                )}
              </>
            )}

            {centerTab === "inbox" && view === "compose" && (
              dbLoading ? (
                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="w-6 h-6 text-[hsl(var(--primary))] animate-spin" />
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Loading email history from database…</p>
                </div>
              ) : (
                <EmailInbox results={allResults} onViewResult={handleViewFromInbox} onMarkSent={handleMarkSent} />
              )
            )}
          </div>

          {/* Right: Activity + Analytics */}
          <div className="space-y-4">
            <ActivityFeed events={activityFeed} />
            <AnalyticsPanel results={allResults} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
