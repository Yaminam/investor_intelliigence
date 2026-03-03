import { useState } from "react";
import { Search, Mail, ExternalLink, Bookmark, BookmarkCheck } from "lucide-react";
import { Checkbox } from "../components/ui/checkbox";
import { InvestorDetailDrawer } from "../components/InvestorDetailDrawer";
import { useInvestors } from "../context/InvestorContext";
import { toast } from "sonner";
import { CRM_STATUSES, CRMStatus } from "../data/investors";

const crmColors: Record<CRMStatus, string> = {
  Active: "bg-[#D1FAE5] text-[#10B981]",
  Contacted: "bg-[#EFF6FF] text-[#2563EB]",
  "In Talks": "bg-[#FEF3C7] text-[#D97706]",
  Passed: "bg-[#F3F4F6] text-[#6B7280]",
};

export function Saved() {
  const { investors, savedIds, toggleSave, crmStatuses, updateCRMStatus } = useInvestors();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvestor, setSelectedInvestor] = useState<(typeof investors)[0] | null>(null);

  const savedInvestors = investors.filter((i) => savedIds.has(i.id));

  const filtered = savedInvestors.filter((inv) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      inv.name.toLowerCase().includes(q) ||
      inv.institution.toLowerCase().includes(q) ||
      inv.sectors.some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-semibold text-[#111827] mb-2">Saved Investors</h1>
            <p className="text-[#6B7280]">Your watchlist of bookmarked investors</p>
          </div>
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search saved investors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg bg-white text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Empty State */}
      {savedInvestors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-lg border border-[#E5E7EB]">
          <div className="h-16 w-16 rounded-full bg-[#EFF6FF] flex items-center justify-center mb-4">
            <Bookmark className="h-8 w-8 text-[#2563EB]" />
          </div>
          <h3 className="text-lg font-semibold text-[#111827] mb-2">No saved investors yet</h3>
          <p className="text-[#6B7280] text-sm text-center max-w-xs">
            Bookmark investors from the All Investors page to build your personal watchlist.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  <th className="px-4 py-3 text-left"><Checkbox /></th>
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
                {filtered.map((investor) => {
                  const crmStatus = crmStatuses[investor.id] ?? investor.status;
                  return (
                    <tr
                      key={investor.id}
                      onClick={() => setSelectedInvestor(investor)}
                      className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <Checkbox />
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-[#EFF6FF] text-[#2563EB] text-sm font-semibold">
                          {investor.match}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#111827]">{investor.name}</span>
                          {investor.isNew && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#D1FAE5] text-[#10B981]">
                              New
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-[#6B7280]">{investor.institution}</td>
                      <td className="px-4 py-4 text-sm text-[#111827]">{investor.chequeSize}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {investor.sectors.map((sector) => (
                            <span key={sector} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-[#F3F4F6] text-[#6B7280]">
                              {sector}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {investor.stage.map((stage) => (
                            <span key={stage} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-[#EFF6FF] text-[#2563EB]">
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
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(investor.email);
                              toast.success("Email copied!", { description: investor.email });
                            }}
                            className="p-1 text-[#6B7280] hover:text-[#2563EB] transition-colors"
                          >
                            <Mail className="h-4 w-4" />
                          </button>
                          <a
                            href={investor.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-[#6B7280] hover:text-[#2563EB] transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          <button
                            onClick={() => {
                              toggleSave(investor.id);
                              toast.success("Removed from saved");
                            }}
                            className="p-1 text-[#2563EB] transition-colors"
                          >
                            <BookmarkCheck className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-[#E5E7EB]">
            <p className="text-sm text-[#6B7280]">
              <span className="font-medium text-[#111827]">{filtered.length}</span> saved investor{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      )}

      <InvestorDetailDrawer
        investor={selectedInvestor}
        onClose={() => setSelectedInvestor(null)}
      />
    </div>
  );
}
