import heroBanner from "@/assets/hero-banner.jpg";
import { Network, Shield, Zap } from "lucide-react";

const HeroBanner = () => {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[hsl(var(--border))] mb-6">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBanner})` }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[hsl(222,47%,4%)/0.92] via-[hsl(222,47%,6%)/0.80] to-[hsl(222,47%,6%)/0.60]" />

      <div className="relative z-10 px-6 py-5 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-semibold tracking-widest text-[hsl(var(--primary))] uppercase">Uganda Martyrs University</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white leading-tight">
            Multi-Campus Email Agent Swarm
          </h1>
          <p className="text-sm text-[hsl(var(--foreground)/0.65)] mt-1 max-w-lg">
            AI-powered email identification, routing, and response generation across 7 campuses and 30+ faculties.
          </p>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-xl bg-[hsl(var(--primary)/0.15)] border border-[hsl(var(--primary)/0.3)] flex items-center justify-center">
              <Network className="w-5 h-5 text-[hsl(var(--primary))]" />
            </div>
            <span className="text-[9px] text-[hsl(var(--muted-foreground))] text-center">7 Agents</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-xl bg-[hsl(var(--accent)/0.15)] border border-[hsl(var(--accent)/0.3)] flex items-center justify-center">
              <Zap className="w-5 h-5 text-[hsl(var(--accent))]" />
            </div>
            <span className="text-[9px] text-[hsl(var(--muted-foreground))] text-center">Auto-Route</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-xl bg-[hsl(142,72%,45%/0.15)] border border-[hsl(142,72%,45%/0.3)] flex items-center justify-center">
              <Shield className="w-5 h-5 text-[hsl(142,72%,45%)]" />
            </div>
            <span className="text-[9px] text-[hsl(var(--muted-foreground))] text-center">KB-Grounded</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
