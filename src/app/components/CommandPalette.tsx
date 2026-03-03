import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Search, Users, TrendingUp, Clock, Bookmark, Settings, X, BarChart2 } from "lucide-react";
import { allInvestors } from "../data/investors";
import { useInvestors } from "../context/InvestorContext";

type Props = {
  open: boolean;
  onClose: () => void;
};

const PAGES = [
  { label: "All Investors", path: "/", icon: Users, description: "Browse & filter all investors" },
  { label: "New This Week", path: "/new-this-week", icon: Clock, description: "Recently added investors" },
  { label: "Analytics", path: "/analytics", icon: BarChart2, description: "Charts & insights" },
  { label: "Saved", path: "/saved", icon: Bookmark, description: "Your watchlist" },
  { label: "Settings", path: "/settings", icon: Settings, description: "Profile & preferences" },
];

export function CommandPalette({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const { setSelectedInvestorId } = useInvestors();

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

  const filteredPages = PAGES.filter(
    (p) =>
      !query ||
      p.label.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase())
  );

  const filteredInvestors =
    query.length > 1
      ? allInvestors
          .filter(
            (inv) =>
              inv.name.toLowerCase().includes(query.toLowerCase()) ||
              inv.institution.toLowerCase().includes(query.toLowerCase()) ||
              inv.sectors.some((s) => s.toLowerCase().includes(query.toLowerCase()))
          )
          .slice(0, 5)
      : [];

  const handleSelectInvestor = (id: number) => {
    navigate("/");
    setSelectedInvestorId(id);
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-50" onClick={onClose} />
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg bg-white rounded-xl shadow-2xl z-50 overflow-hidden">
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E7EB]">
          <Search className="h-5 w-5 text-[#6B7280] flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search investors, pages..."
            className="flex-1 text-[#111827] placeholder:text-[#9CA3AF] outline-none text-sm bg-transparent"
            onKeyDown={(e) => e.key === "Escape" && onClose()}
          />
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {/* Pages section */}
          {filteredPages.length > 0 && (
            <div>
              <p className="px-4 py-1.5 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
                Pages
              </p>
              {filteredPages.map((page) => {
                const Icon = page.icon;
                return (
                  <button
                    key={page.path}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#F3F4F6] transition-colors"
                    onClick={() => {
                      navigate(page.path);
                      onClose();
                    }}
                  >
                    <div className="h-8 w-8 rounded-lg bg-[#F3F4F6] flex items-center justify-center flex-shrink-0">
                      <Icon className="h-4 w-4 text-[#6B7280]" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-[#111827]">{page.label}</p>
                      <p className="text-xs text-[#9CA3AF]">{page.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Investors section */}
          {filteredInvestors.length > 0 && (
            <div className="mt-1">
              <p className="px-4 py-1.5 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
                Investors
              </p>
              {filteredInvestors.map((inv) => (
                <button
                  key={inv.id}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#F3F4F6] transition-colors"
                  onClick={() => handleSelectInvestor(inv.id)}
                >
                  <div className="h-8 w-8 rounded-full bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-[#2563EB]">
                      {inv.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-[#111827]">{inv.name}</p>
                    <p className="text-xs text-[#9CA3AF]">
                      {inv.institution} · {inv.sectors.slice(0, 2).join(", ")}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[#10B981]">{inv.match}%</span>
                </button>
              ))}
            </div>
          )}

          {/* Empty */}
          {filteredPages.length === 0 && filteredInvestors.length === 0 && (
            <div className="px-4 py-10 text-center">
              <p className="text-sm text-[#9CA3AF]">No results for "{query}"</p>
            </div>
          )}
        </div>

        {/* Footer hints */}
        <div className="px-4 py-2 border-t border-[#E5E7EB] flex items-center gap-4 bg-[#F9FAFB]">
          <span className="text-xs text-[#9CA3AF]">
            <kbd className="bg-white border border-[#E5E7EB] px-1.5 py-0.5 rounded text-xs">↵</kbd>{" "}
            select
          </span>
          <span className="text-xs text-[#9CA3AF]">
            <kbd className="bg-white border border-[#E5E7EB] px-1.5 py-0.5 rounded text-xs">Esc</kbd>{" "}
            close
          </span>
          <span className="text-xs text-[#9CA3AF] ml-auto">
            <kbd className="bg-white border border-[#E5E7EB] px-1.5 py-0.5 rounded text-xs">⌘K</kbd>{" "}
            to open
          </span>
        </div>
      </div>
    </>
  );
}
