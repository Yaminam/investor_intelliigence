import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { Users, Clock, TrendingUp, LogOut, Bookmark, Settings, Command, Menu, X } from "lucide-react";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

      {/* Mobile top header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-4 h-14">
        <h1 className="text-[#111827] font-semibold text-base">Investor Intelligence</h1>
        <button onClick={() => setSidebarOpen(true)} className="p-2 text-[#6B7280] hover:text-[#111827]">
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 bg-white flex flex-col h-full shadow-xl">
            <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between">
              <h1 className="text-[#111827] font-semibold">Investor Intelligence</h1>
              <button onClick={() => setSidebarOpen(false)} className="p-1 text-[#6B7280]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      active ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold' : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]'
                    }`}
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
            <div className="p-4 border-t border-[#E5E7EB]">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[#2563EB] flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">{user?.avatar ?? "?"}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#111827] font-medium truncate">{user?.name ?? "User"}</p>
                </div>
                <button className="text-[#6B7280] hover:text-[#111827]" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 bg-white border-r border-[#E5E7EB] flex-col">
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
      <main className="flex-1 overflow-auto pt-14 md:pt-0 pb-16 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#E5E7EB] flex items-center justify-around px-2 h-16">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all ${
                active ? 'text-[#2563EB]' : 'text-[#9CA3AF]'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>

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
