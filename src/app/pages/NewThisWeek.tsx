import { useState } from "react";
import { Search, Mail, ExternalLink, Bookmark, BookmarkCheck, Clock } from "lucide-react";
import { useInvestors } from "../context/InvestorContext";
import { toast } from "sonner";
import { CRM_STATUSES, CRMStatus } from "../data/investors";

const crmColors: Record<CRMStatus, string> = {
  Active: "bg-[#D1FAE5] text-[#10B981]",
  Contacted: "bg-[#EFF6FF] text-[#2563EB]",
  "In Talks": "bg-[#FEF3C7] text-[#D97706]",
  Passed: "bg-[#F3F4F6] text-[#6B7280]",
};


export function NewThisWeek() {
  const { investors, savedIds, toggleSave, crmStatuses, updateCRMStatus, setSelectedInvestorId } = useInvestors();
  const [searchQuery, setSearchQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState<string | null>(null);
  const [stageFilter, setStageFilter] = useState<string | null>(null);

  const newInvestors = investors.filter((i) => i.isNew);

  const filtered = newInvestors.filter((inv) => {
    const q = searchQuery.toLowerCase();
    const matchesQ = !q || inv.name.toLowerCase().includes(q) || inv.institution.toLowerCase().includes(q) || inv.sectors.some((s) => s.toLowerCase().includes(q));
    const matchesSector = !sectorFilter || inv.sectors.includes(sectorFilter);
    const matchesStage = !stageFilter || inv.stage.includes(stageFilter);
    return matchesQ && matchesSector && matchesStage;
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-semibold text-[#111827] mb-2">New This Week</h1>
            <p className="text-[#6B7280]">{newInvestors.length} new investors added this week</p>
          </div>
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search by name, fund or sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg bg-white text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Empty State */}
      {newInvestors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-lg border border-[#E5E7EB]">
          <div className="h-16 w-16 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-[#6B7280]" />
          </div>
          <h3 className="text-lg font-semibold text-[#111827] mb-2">No new investors this week</h3>
          <p className="text-[#6B7280] text-sm text-center max-w-xs">
            Check back soon — new investors are added every week.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  <th className="px-4 py-3 w-8"></th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#111827]">Match %</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#111827]">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#111827]">Institution</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#111827]">Cheque Size</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#111827]">Sectors</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#111827]">Stage</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#111827]">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#111827]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-16 text-center text-[#6B7280] text-sm">
                      No investors match your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map((investor) => {
                    const crmStatus = crmStatuses[investor.id] ?? investor.status;
                    const isSaved = savedIds.has(investor.id);
                    return (
                      <tr
                        key={investor.id}
                        onClick={() => setSelectedInvestorId(investor.id)}
                        className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-4"></td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-[#EFF6FF] text-[#2563EB] text-sm font-semibold">
                            {investor.match}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[#111827]">{investor.name}</span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#D1FAE5] text-[#10B981]">
                              New
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-[#6B7280]">{investor.institution}</td>
                        <td className="px-4 py-4 text-sm text-[#111827]">{investor.chequeSize}</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1">
                            {investor.sectors.map((sector) => (
                              <span
                                key={sector}
                                onClick={(e) => { e.stopPropagation(); setSectorFilter(sectorFilter === sector ? null : sector); }}
                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs cursor-pointer transition-colors ${
                                  sectorFilter === sector ? "bg-[#2563EB] text-white" : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
                                }`}
                              >
                                {sector}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1">
                            {investor.stage.map((stage) => (
                              <span
                                key={stage}
                                onClick={(e) => { e.stopPropagation(); setStageFilter(stageFilter === stage ? null : stage); }}
                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs cursor-pointer transition-colors ${
                                  stageFilter === stage ? "bg-[#2563EB] text-white" : "bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE]"
                                }`}
                              >
                                {stage}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={crmStatus}
                            onChange={(e) => updateCRMStatus(investor.id, e.target.value as CRMStatus)}
                            className={`text-xs font-medium px-2 py-1 rounded-md border-0 outline-none cursor-pointer ${crmColors[crmStatus]}`}
                          >
                            {CRM_STATUSES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(investor.email);
                                toast.success("Email copied!", { description: investor.email });
                              }}
                              className="p-1 text-[#6B7280] hover:text-[#2563EB] transition-colors"
                            >
                              <Mail className="h-4 w-4" />
                            </button>
                            <a href={investor.website} target="_blank" rel="noopener noreferrer" className="p-1 text-[#6B7280] hover:text-[#2563EB] transition-colors">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                            <button
                              onClick={() => {
                                toggleSave(investor.id);
                                toast.success(isSaved ? "Removed from saved" : "Saved to watchlist", { description: investor.name });
                              }}
                              className={`p-1 transition-colors ${isSaved ? "text-[#2563EB]" : "text-[#6B7280] hover:text-[#2563EB]"}`}
                            >
                              {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-[#E5E7EB]">
            <p className="text-sm text-[#6B7280]">
              Showing <span className="font-medium text-[#111827]">{filtered.length}</span> of{" "}
              <span className="font-medium text-[#111827]">{newInvestors.length}</span> new investors
            </p>
          </div>
        </div>
      )}

    </div>
  );
}