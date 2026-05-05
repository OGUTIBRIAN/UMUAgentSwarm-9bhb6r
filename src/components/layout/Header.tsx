import { Activity, Cpu, LogOut, Building2, User, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { CAMPUSES } from "@/constants/umuData";
import { toast } from "sonner";

interface HeaderProps {
  activeEmails: number;
  totalProcessed: number;
}

const Header = ({ activeEmails, totalProcessed }: HeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-UG", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const campus = user?.campusId ? CAMPUSES.find((c) => c.id === user.campusId) : null;

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out successfully");
  };

  return (
    <header className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 py-3 flex items-center justify-between">
      {/* Left: Logo + title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[hsl(var(--primary)/0.15)] border border-[hsl(var(--primary)/0.3)]">
          <Cpu className="w-5 h-5 text-[hsl(var(--primary))]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[hsl(var(--foreground))] text-sm tracking-wide">UMU Agent Swarm</span>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.3)] mono">
              v1.0
            </span>
          </div>
          <p className="text-[11px] text-[hsl(var(--muted-foreground))]">Uganda Martyrs University — Email Intelligence System</p>
        </div>
      </div>

      {/* Center: live stats */}
      <div className="hidden md:flex items-center gap-6">
        <div className="text-center">
          <div className="text-lg font-bold text-[hsl(var(--primary))] mono leading-none">{totalProcessed}</div>
          <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5">Processed</div>
        </div>
        <div className="w-px h-8 bg-[hsl(var(--border))]" />
        <div className="text-center">
          <div className="text-lg font-bold text-[hsl(var(--accent))] mono leading-none">{activeEmails}</div>
          <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5">Active</div>
        </div>
        <div className="w-px h-8 bg-[hsl(var(--border))]" />
        <div className="text-center">
          <div className="text-lg font-bold text-[hsl(142,72%,45%)] mono leading-none">7</div>
          <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5">Campuses</div>
        </div>
      </div>

      {/* Right: user info + logout */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2">
          <div className="relative w-2 h-2">
            <div className="absolute inset-0 rounded-full bg-[hsl(142,72%,45%)]" />
            <div className="pulse-dot absolute inset-0 rounded-full" />
          </div>
          <span className="text-[11px] text-[hsl(142,72%,45%)] font-medium">LIVE</span>
        </div>
        <div className="hidden sm:block text-[11px] mono text-[hsl(var(--muted-foreground))]">{timeStr}</div>

        {user && (
          <div className="flex items-center gap-2 pl-3 border-l border-[hsl(var(--border))]">
            {/* Campus badge */}
            {campus && (
              <div
                className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-semibold"
                style={{ color: campus.color, backgroundColor: `${campus.color}15`, borderColor: `${campus.color}30` }}
              >
                <Building2 className="w-3 h-3" />
                {campus.agentName}
              </div>
            )}
            {/* User name */}
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-[10px] text-[hsl(var(--foreground))]">
              <User className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
              <span className="font-medium">{user.username}</span>
            </div>
            {/* Admin button */}
            {user?.role === "admin" && (
              <button
                onClick={() => navigate("/admin")}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-[hsl(var(--primary)/0.1)] hover:bg-[hsl(var(--primary)/0.2)] border border-[hsl(var(--primary)/0.3)] text-[hsl(var(--primary))] transition-colors"
                title="Admin Dashboard"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[10px] font-semibold">Admin</span>
              </button>
            )}
            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--destructive)/0.1)] border border-[hsl(var(--border))] hover:border-[hsl(var(--destructive)/0.3)] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] transition-colors"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[10px] font-medium">Sign out</span>
            </button>
          </div>
        )}

        <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-[hsl(var(--muted-foreground))]">
          <Activity className="w-3.5 h-3.5" />
          <span>All systems nominal</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
