import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { Users, Clock, TrendingUp, LogOut, Bookmark, Settings, Command } from "lucide-react";
import { useInvestors } from "../context/InvestorContext";
import { useAuth } from "../context/AuthContext";
import { CommandPalette } from "../components/CommandPalette";
import { InvestorDetailDrawer } from "../components/InvestorDetailDrawer";

export function Root() {
  const location = useLocation();
  const navigate = useNavigate();
  const { investors, savedIds, selectedInvestorId, setSelectedInvestorId } = useInvestors();
  const { user, logout } = useAuth();
  const [cmdOpen, setCmdOpen] = useState(false);

  const selectedInvestor = selectedInvestorId != null
    ? investors.find((i) => i.id === selectedInvestorId) ?? null
    : null;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const currentDate = new Date().toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const navItems = [
    { path: "/", label: "All Investors", icon: Users, badge: investors.length },
    { path: "/new-this-week", label: "New This Week", icon: Clock, badge: null },
    { path: "/analytics", label: "Analytics", icon: TrendingUp, badge: null },
    { path: "/saved", label: "Saved", icon: Bookmark, badge: savedIds.size || null },
    { path: "/settings", label: "Settings", icon: Settings, badge: null },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB]">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-[#E5E7EB] flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-[#E5E7EB]">
          <h1 className="text-[#111827] font-semibold text-lg">
            Investor Intelligence
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300
                  ${active 
                    ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold border-l-4 border-[#2563EB] -ml-4 pl-7' 
                    : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span className="flex-1">{item.label}</span>
                {item.badge !== null && item.badge !== undefined && item.badge > 0 && (
                  <span className={`inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full text-xs font-medium ${active ? 'bg-[#2563EB] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t border-[#E5E7EB] space-y-3">
          {/* Command palette hint */}
          <button
            onClick={() => setCmdOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#9CA3AF] bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg hover:text-[#6B7280] transition-colors"
          >
            <Command className="h-3 w-3" />
            <span className="flex-1 text-left">Quick search</span>
            <kbd className="text-[10px] bg-white border border-[#E5E7EB] px-1 rounded">⌘K</kbd>
          </button>
          <p className="text-xs text-[#6B7280]">
            Last updated: {currentDate}
          </p>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-[#2563EB] flex items-center justify-center">
              <span className="text-white text-sm font-semibold">{user?.avatar ?? "?"}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-[#111827] font-medium">{user?.name ?? "User"}</p>
            </div>
            <button 
              className="text-[#6B7280] hover:text-[#111827] transition-colors"
              title="Logout"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

      {/* Global: Detail drawer (opened via CommandPalette or any page) */}
      <InvestorDetailDrawer
        investor={selectedInvestor}
        onClose={() => setSelectedInvestorId(null)}
      />

      {/* Command palette */}
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}
