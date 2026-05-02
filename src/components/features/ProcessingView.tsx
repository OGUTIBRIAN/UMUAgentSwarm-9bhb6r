import { useEffect, useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import type { ProcessingStep } from "@/types";

interface ProcessingViewProps {
  steps: ProcessingStep[];
  onComplete: () => void;
}

const ProcessingView = ({ steps, onComplete }: ProcessingViewProps) => {
  const [completedIndices, setCompletedIndices] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    steps.forEach((step, i) => {
      const t = setTimeout(() => {
        setCompletedIndices((prev) => [...prev, i]);
        setCurrentIndex(i + 1);
        if (i === steps.length - 1) {
          setTimeout(onComplete, 400);
        }
      }, step.doneAt);
      timers.push(t);
    });

    return () => timers.forEach(clearTimeout);
  }, [steps, onComplete]);

  const progress = Math.round((completedIndices.length / steps.length) * 100);

  return (
    <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5">
      <div className="flex items-center gap-3 mb-5">
        <Loader2 className="w-5 h-5 text-[hsl(var(--primary))] animate-spin" />
        <div>
          <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">Swarm Processing Email</h3>
          <p className="text-[11px] text-[hsl(var(--muted-foreground))]">Agents are analyzing and routing your message…</p>
        </div>
        <span className="ml-auto text-sm font-bold mono text-[hsl(var(--primary))]">{progress}%</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-[hsl(var(--secondary))] rounded-full mb-5 overflow-hidden">
        <div
          className="h-full bg-[hsl(var(--primary))] rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, i) => {
          const isDone = completedIndices.includes(i);
          const isActive = i === currentIndex;

          return (
            <div
              key={i}
              className={`flex items-start gap-3 transition-opacity duration-300 ${
                i > currentIndex ? "opacity-30" : "opacity-100"
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {isDone ? (
                  <CheckCircle className="w-4 h-4 text-[hsl(142,72%,45%)]" />
                ) : isActive ? (
                  <Loader2 className="w-4 h-4 text-[hsl(var(--primary))] animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-[hsl(var(--border))]" />
                )}
              </div>
              <div>
                <div className={`text-xs font-semibold ${isDone ? "text-[hsl(var(--foreground))]" : isActive ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))]"}`}>
                  {step.label}
                </div>
                {(isDone || isActive) && (
                  <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5 slide-in">
                    {step.detail}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProcessingView;
