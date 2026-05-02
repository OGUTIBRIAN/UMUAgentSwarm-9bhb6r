import { useState, useCallback } from "react";
import { Send, Inbox } from "lucide-react";
import { CAMPUSES } from "@/constants/umuData";
import { processEmail, buildProcessingSteps } from "@/lib/agentEngine";
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
  const [view, setView] = useState<ViewState>("compose");
  const [centerTab, setCenterTab] = useState<CenterTab>("compose");
  const [pendingResult, setPendingResult] = useState<RoutingResult | null>(null);
  const [currentResult, setCurrentResult] = useState<RoutingResult | null>(null);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  const [allResults, setAllResults] = useState<RoutingResult[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityEvent[]>([]);
  const [activeCampusId, setActiveCampusId] = useState<string | undefined>();

  // Campus processed counts
  const processedCounts: Record<string, number> = {};
  allResults.forEach((r) => {
    processedCounts[r.campusId] = (processedCounts[r.campusId] || 0) + 1;
  });

  const handleEmailSubmit = useCallback((email: EmailInput) => {
    const result = processEmail(email);
    const steps = buildProcessingSteps(result.campusName, result.agentName, result.categoryLabel);
    const fullResult: RoutingResult = { ...result, processingSteps: steps };

    setPendingResult(fullResult);
    setProcessingSteps(steps);
    setActiveCampusId(result.campusId);
    setView("processing");

    // Add to activity feed immediately
    const campus = CAMPUSES.find((c) => c.id === result.campusId)!;
    const receivedEvent: ActivityEvent = {
      id: `ev-${Date.now()}-r`,
      type: "received",
      agentName: result.agentName,
      campusId: result.campusId,
      campusColor: campus.color,
      subject: result.subject,
      category: result.categoryLabel,
      timestamp: new Date().toISOString(),
    };
    setActivityFeed((prev) => [...prev, receivedEvent]);
  }, []);

  const handleProcessingComplete = useCallback(() => {
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
  }, [pendingResult]);

  const handleReset = useCallback(() => {
    setView("compose");
    setCurrentResult(null);
    setPendingResult(null);
    setActiveCampusId(undefined);
    setProcessingSteps([]);
    setCenterTab("compose");
  }, []);

  const handleViewFromInbox = useCallback((_result: RoutingResult) => {
    // Result is shown in the modal inside EmailInbox
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] grid-bg flex flex-col">
      <Header
        activeEmails={view === "processing" ? 1 : 0}
        totalProcessed={allResults.length}
      />

      <main className="flex-1 p-4 md:p-6 max-w-[1400px] mx-auto w-full">
        <HeroBanner />

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_260px] gap-4">
          {/* Left: Campus agent network */}
          <div className="space-y-4">
            <CampusAgentPanel
              activeCampusId={activeCampusId}
              processedCounts={processedCounts}
            />
          </div>

          {/* Center: Main interaction */}
          <div className="space-y-4">
            {/* Tab switcher — only show when not actively processing */}
            {view !== "processing" && (
              <div className="flex items-center gap-1 p-1 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl">
                <button
                  onClick={() => { setCenterTab("compose"); if (view === "result") handleReset(); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                    centerTab === "compose" && view !== "result"
                      ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow"
                      : view === "result"
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
                    centerTab === "inbox" && view !== "result"
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

            {/* Compose / processing / result flow */}
            {(centerTab === "compose" || view === "processing" || view === "result") && (
              <>
                {view === "compose" && centerTab === "compose" && (
                  <EmailComposer onSubmit={handleEmailSubmit} isProcessing={false} />
                )}
                {view === "processing" && (
                  <ProcessingView
                    steps={processingSteps}
                    onComplete={handleProcessingComplete}
                  />
                )}
                {view === "result" && currentResult && (
                  <ResultView result={currentResult} onReset={handleReset} />
                )}
              </>
            )}

            {/* Inbox tab */}
            {centerTab === "inbox" && view === "compose" && (
              <EmailInbox
                results={allResults}
                onViewResult={handleViewFromInbox}
              />
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
