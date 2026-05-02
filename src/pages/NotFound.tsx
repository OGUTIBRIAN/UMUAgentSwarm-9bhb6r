import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] grid-bg">
      <div className="text-center">
        <div className="text-6xl font-bold mono text-[hsl(var(--primary))] mb-2">404</div>
        <h1 className="text-xl font-bold text-[hsl(var(--foreground))] mb-2">Page not found</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">This route does not exist in the UMU Agent Swarm system.</p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2.5 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Return to Command Center
        </button>
      </div>
    </div>
  );
};

export default NotFound;
