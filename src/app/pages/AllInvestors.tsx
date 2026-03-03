import { useState, useMemo, useRef, useEffect } from "react";
import { Search, ChevronDown, Mail, ExternalLink, Bookmark, BookmarkCheck, Download, ArrowUpDown, ArrowUp, ArrowDown, GitCompare, Star, X } from "lucide-react";
import { Checkbox } from "../components/ui/checkbox";
import { InvestorDetailDrawer } from "../components/InvestorDetailDrawer";
import { CompareDrawer } from "../components/CompareDrawer";
import { useInvestors } from "../context/InvestorContext";
import { useAuth } from "../context/AuthContext";
import { computeMatchScore } from "../utils/matchScore";
import { toast } from "sonner";
import { SECTORS, STAGES, GEOGRAPHIES, CRM_STATUSES, CRMStatus } from "../data/investors";

type SortKey = "match" | "chequeSize" | null;
type SortDir = "asc" | "desc";

const crmColors: Record<CRMStatus, string> = {
  Active: "bg-[#D1FAE5] text-[#10B981]",
  Contacted: "bg-[#EFF6FF] text-[#2563EB]",
  "In Talks": "bg-[#FEF3C7] text-[#D97706]",
  Passed: "bg-[#F3F4F6] text-[#6B7280]",
};

function parseCheque(val: string): number {
  const m = val.match(/[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
}

const PAGE_SIZE = 10;

export function AllInvestors() {
  const { investors, savedIds, toggleSave, crmStatuses, updateCRMStatus, setSelectedInvestorId } = useInvestors();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [compareIds, setCompareIds] = useState<Set<number>>(new Set());
  const [showCompare, setShowCompare] = useState(false);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [selectedGeographies, setSelectedGeographies] = useState<string[]>([]);
  const [fundingTypeFilter, setFundingTypeFilter] = useState<"All" | "Equity" | "Debt">("All");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [minMatch, setMinMatch] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setShowAutocomplete(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        searchRef.current?.querySelector("input")?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const investorsWithScores = useMemo(
    () => investors.map((inv) => ({ ...inv, computedMatch: computeMatchScore(inv, user?.profile ?? null) })),
    [investors, user?.profile]
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
    setPage(1);
  };

  const handleTagFilter = (type: "sector" | "stage", value: string) => {
    if (type === "sector") setSelectedSectors((prev) => prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]);
    else setSelectedStages((prev) => prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]);
    setPage(1);
  };

  const toggleCompare = (id: number) => {
    setCompareIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); return next; }
      if (next.size >= 3) { toast.error("Max 3 investors to compare"); return prev; }
      next.add(id);
      return next;
    });
  };

  const clearFilters = () => {
    setSelectedSectors([]); setSelectedStages([]); setSelectedGeographies([]);
    setFundingTypeFilter("All"); setSearchQuery(""); setMinMatch(0); setPage(1);
  };

  const autocompleteSuggestions = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    const names = investorsWithScores.filter((i) => i.name.toLowerCase().includes(q)).slice(0, 3).map((i) => ({ label: i.name, type: "investor" as const }));
    const funds = investorsWithScores.filter((i) => i.institution.toLowerCase().includes(q)).slice(0, 2).map((i) => ({ label: i.institution, type: "fund" as const }));
    const sectors = SECTORS.filter((s) => s.toLowerCase().includes(q)).slice(0, 2).map((s) => ({ label: s, type: "sector" as const }));
    return [...names, ...funds, ...sectors].slice(0, 6);
  }, [searchQuery, investorsWithScores]);

  const filtered = useMemo(() => {
    let list = [...investorsWithScores];
    const q = searchQuery.toLowerCase();
    if (q) list = list.filter((inv) => inv.name.toLowerCase().includes(q) || inv.institution.toLowerCase().includes(q) || inv.sectors.some((s) => s.toLowerCase().includes(q)));
    if (selectedSectors.length) list = list.filter((inv) => selectedSectors.some((s) => inv.sectors.includes(s)));
    if (selectedStages.length) list = list.filter((inv) => selectedStages.some((s) => inv.stage.includes(s)));
    if (selectedGeographies.length) list = list.filter((inv) => selectedGeographies.some((g) => inv.geography.includes(g)));
    if (fundingTypeFilter !== "All") list = list.filter((inv) => inv.fundingType === fundingTypeFilter || inv.fundingType === "Both");
    if (minMatch > 0) list = list.filter((inv) => inv.computedMatch >= minMatch);
    if (sortKey === "match") list.sort((a, b) => sortDir === "desc" ? b.computedMatch - a.computedMatch : a.computedMatch - b.computedMatch);
    else if (sortKey === "chequeSize") list.sort((a, b) => sortDir === "desc" ? parseCheque(b.chequeSize) - parseCheque(a.chequeSize) : parseCheque(a.chequeSize) - parseCheque(b.chequeSize));
    else list.sort((a, b) => b.computedMatch - a.computedMatch);
    return list;
  }, [investorsWithScores, searchQuery, selectedSectors, selectedStages, selectedGeographies, fundingTypeFilter, minMatch, sortKey, sortDir]);

  const bestMatches = useMemo(
    () => [...investorsWithScores].sort((a, b) => b.computedMatch - a.computedMatch).slice(0, 3),
    [investorsWithScores]
  );

  const exportCSV = () => {
    const headers = ["Name", "Institution", "Match%", "Cheque Size", "Sectors", "Stage", "Funding Type", "Status", "Email"];
    const rows = filtered.map((inv) => [inv.name, inv.institution, inv.computedMatch, inv.chequeSize, inv.sectors.join(";"), inv.stage.join(";"), inv.fundingType, crmStatuses[inv.id] ?? inv.status, inv.email]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "investors.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported", { description: `${filtered.length} investors downloaded` });
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const compareInvestors = investorsWithScores.filter((inv) => compareIds.has(inv.id));

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
    return sortDir === "desc" ? <ArrowDown className="h-3 w-3 ml-1 text-[#2563EB]" /> : <ArrowUp className="h-3 w-3 ml-1 text-[#2563EB]" />;
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-semibold text-[#111827] mb-2">All Investors</h1>
            <p className="text-[#6B7280]">Discover active investors across India</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 text-sm border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] transition-all">
              <Download className="h-4 w-4" />Export CSV
            </button>
            <div className="relative w-80" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6B7280]" />
              <input
                type="text"
                placeholder='Search... (press "/" to focus)'
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); setShowAutocomplete(true); }}
                onFocus={() => setShowAutocomplete(true)}
                className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg bg-white text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
              {showAutocomplete && autocompleteSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E5E7EB] rounded-lg shadow-lg z-50 overflow-hidden">
                  {autocompleteSuggestions.map((s, i) => (
                    <button key={i} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#F3F4F6]"
                      onClick={() => {
                        if (s.type === "sector") setSelectedSectors((prev) => prev.includes(s.label) ? prev : [...prev, s.label]);
                        else setSearchQuery(s.label);
                        setShowAutocomplete(false); setPage(1);
                      }}>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${s.type === "investor" ? "bg-[#EFF6FF] text-[#2563EB]" : s.type === "fund" ? "bg-[#F3F4F6] text-[#6B7280]" : "bg-[#D1FAE5] text-[#10B981]"}`}>
                        {s.type === "investor" ? "Name" : s.type === "fund" ? "Fund" : "Sector"}
                      </span>
                      <span className="text-sm text-[#111827]">{s.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {user?.profile && (
        <div className="mb-6 bg-gradient-to-r from-[#EFF6FF] to-[#F0FDF4] border border-[#DBEAFE] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Star className="h-4 w-4 text-[#2563EB] fill-[#2563EB]" />
            <span className="text-sm font-semibold text-[#2563EB]">Your Top Matches</span>
            <span className="text-xs text-[#6B7280]">� personalised for {user.profile.companyName || "your startup"}</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {bestMatches.map((inv, idx) => (
              <button key={inv.id} onClick={() => setSelectedInvestorId(inv.id)}
                className="flex items-center gap-3 bg-white rounded-lg border border-[#E5E7EB] px-4 py-3 hover:border-[#2563EB] hover:shadow-sm transition-all text-left">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${idx === 0 ? "bg-[#F59E0B]" : idx === 1 ? "bg-[#9CA3AF]" : "bg-[#CD7F32]"}`}>
                  #{idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#111827] truncate">{inv.name}</p>
                  <p className="text-xs text-[#6B7280] truncate">{inv.institution}</p>
                </div>
                <span className="text-sm font-bold text-[#10B981] flex-shrink-0">{inv.computedMatch}%</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3">
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[#111827]">Filters</h3>
              <button onClick={clearFilters} className="text-sm text-[#2563EB] hover:underline">Clear All</button>
            </div>
            <div>
              <h4 className="text-sm font-medium text-[#111827] mb-3">Sector</h4>
              <div className="space-y-2">
                {SECTORS.slice(0, 8).map((sector) => (
                  <label key={sector} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={selectedSectors.includes(sector)} onCheckedChange={(c) => { setSelectedSectors(c ? [...selectedSectors, sector] : selectedSectors.filter((s) => s !== sector)); setPage(1); }} />
                    <span className="text-sm text-[#6B7280]">{sector}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-[#111827] mb-3">Stage</h4>
              <div className="space-y-2">
                {STAGES.map((stage) => (
                  <label key={stage} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={selectedStages.includes(stage)} onCheckedChange={(c) => { setSelectedStages(c ? [...selectedStages, stage] : selectedStages.filter((s) => s !== stage)); setPage(1); }} />
                    <span className="text-sm text-[#6B7280]">{stage}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-[#111827] mb-3">Geography</h4>
              <div className="space-y-2">
                {GEOGRAPHIES.map((geo) => (
                  <label key={geo} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={selectedGeographies.includes(geo)} onCheckedChange={(c) => { setSelectedGeographies(c ? [...selectedGeographies, geo] : selectedGeographies.filter((g) => g !== geo)); setPage(1); }} />
                    <span className="text-sm text-[#6B7280]">{geo}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-[#111827] mb-3">Funding Type</h4>
              <div className="flex gap-2">
                {(["All", "Equity", "Debt"] as const).map((type) => (
                  <button key={type} onClick={() => { setFundingTypeFilter(type); setPage(1); }}
                    className={`flex-1 px-2 py-2 text-sm rounded-lg transition-all ${fundingTypeFilter === type ? "bg-[#2563EB] text-white" : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"}`}>
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 text-sm text-[#2563EB] hover:underline">
                <span>Advanced</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="mt-3 p-3 bg-[#F9FAFB] rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-[#111827]">Min Match %</p>
                    <span className="text-sm font-semibold text-[#2563EB]">{minMatch}%</span>
                  </div>
                  <input type="range" min={0} max={100} step={5} value={minMatch} onChange={(e) => { setMinMatch(Number(e.target.value)); setPage(1); }} className="w-full accent-[#2563EB]" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-9">
          <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                    <th className="px-4 py-3 text-left w-10"><GitCompare className="h-4 w-4 text-[#6B7280]" title="Select to compare" /></th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#111827] cursor-pointer select-none" onClick={() => handleSort("match")}>
                      <span className="inline-flex items-center">Match <SortIcon col="match" /></span>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#111827]">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#111827]">Institution</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#111827] cursor-pointer select-none" onClick={() => handleSort("chequeSize")}>
                      <span className="inline-flex items-center">Cheque <SortIcon col="chequeSize" /></span>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#111827]">Sectors</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#111827]">Stage</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#111827]">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#111827]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr><td colSpan={9} className="px-4 py-16 text-center text-[#6B7280] text-sm">No investors match your filters.</td></tr>
                  ) : paginated.map((investor) => {
                    const crmStatus = crmStatuses[investor.id] ?? investor.status;
                    const isSaved = savedIds.has(investor.id);
                    const isCompared = compareIds.has(investor.id);
                    return (
                      <tr key={investor.id} onClick={() => setSelectedInvestorId(investor.id)}
                        className={`border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors cursor-pointer ${isCompared ? "bg-[#EFF6FF]" : ""}`}>
                        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                          <Checkbox checked={isCompared} onCheckedChange={() => toggleCompare(investor.id)} title="Add to compare" />
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full text-sm font-semibold ${investor.computedMatch >= 80 ? "bg-[#D1FAE5] text-[#10B981]" : investor.computedMatch >= 60 ? "bg-[#EFF6FF] text-[#2563EB]" : "bg-[#F3F4F6] text-[#6B7280]"}`}>
                            {investor.computedMatch}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[#111827]">{investor.name}</span>
                            {investor.isNew && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#D1FAE5] text-[#10B981]">New</span>}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-[#6B7280]">{investor.institution}</td>
                        <td className="px-4 py-4 text-sm text-[#111827]">{investor.chequeSize}</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1">
                            {investor.sectors.map((s) => (
                              <span key={s} onClick={(e) => { e.stopPropagation(); handleTagFilter("sector", s); }}
                                className={`px-2 py-0.5 rounded-md text-xs cursor-pointer transition-colors ${selectedSectors.includes(s) ? "bg-[#2563EB] text-white" : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"}`}>
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1">
                            {investor.stage.map((s) => (
                              <span key={s} onClick={(e) => { e.stopPropagation(); handleTagFilter("stage", s); }}
                                className={`px-2 py-0.5 rounded-md text-xs cursor-pointer transition-colors ${selectedStages.includes(s) ? "bg-[#2563EB] text-white" : "bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE]"}`}>
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                          <select value={crmStatus} onChange={(e) => updateCRMStatus(investor.id, e.target.value as CRMStatus)}
                            className={`text-xs font-medium px-2 py-1 rounded-md border-0 outline-none cursor-pointer ${crmColors[crmStatus]}`}>
                            {CRM_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <button onClick={() => { navigator.clipboard.writeText(investor.email); toast.success("Email copied!", { description: investor.email }); }} className="p-1 text-[#6B7280] hover:text-[#2563EB] transition-colors" title="Copy email">
                              <Mail className="h-4 w-4" />
                            </button>
                            <a href={investor.website} target="_blank" rel="noopener noreferrer" className="p-1 text-[#6B7280] hover:text-[#2563EB] transition-colors">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                            <button onClick={() => { toggleSave(investor.id); toast.success(isSaved ? "Removed from saved" : "Saved to watchlist", { description: investor.name }); }}
                              className={`p-1 transition-colors ${isSaved ? "text-[#2563EB]" : "text-[#6B7280] hover:text-[#2563EB]"}`}>
                              {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-[#E5E7EB] flex items-center justify-between">
              <p className="text-sm text-[#6B7280]">
                Showing <span className="font-medium text-[#111827]">{filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}�{Math.min(page * PAGE_SIZE, filtered.length)}</span> of <span className="font-medium text-[#111827]">{filtered.length}</span> investors
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 text-sm text-[#6B7280] hover:text-[#111827] disabled:opacity-40">Previous</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1).map((p, idx, arr) => (
                  <>
                    {idx > 0 && arr[idx - 1] !== p - 1 && <span key={`e${p}`} className="px-1 text-[#6B7280]">�</span>}
                    <button key={p} onClick={() => setPage(p)} className={`px-3 py-1 text-sm rounded-md transition-colors ${p === page ? "bg-[#2563EB] text-white" : "text-[#6B7280] hover:text-[#111827]"}`}>{p}</button>
                  </>
                ))}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 text-sm text-[#6B7280] hover:text-[#111827] disabled:opacity-40">Next</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {compareIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#111827] text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-4 z-40">
          <span className="text-sm">{compareIds.size} investor{compareIds.size > 1 ? "s" : ""} selected</span>
          {compareIds.size >= 2 && (
            <button onClick={() => setShowCompare(true)} className="flex items-center gap-2 bg-[#2563EB] px-4 py-1.5 rounded-full text-sm font-medium hover:bg-[#1D4ED8] transition-colors">
              <GitCompare className="h-3.5 w-3.5" />Compare
            </button>
          )}
          <button onClick={() => setCompareIds(new Set())} className="text-[#9CA3AF] hover:text-white transition-colors"><X className="h-4 w-4" /></button>
        </div>
      )}

      {showCompare && <CompareDrawer investors={compareInvestors} onClose={() => setShowCompare(false)} />}
    </div>
  );
}
