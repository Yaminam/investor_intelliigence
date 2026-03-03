import { X } from "lucide-react";
import type { Investor } from "../data/investors";

type ScoredInvestor = Investor & { computedMatch: number };

type Props = {
  investors: ScoredInvestor[];
  onClose: () => void;
};

const ATTRIBUTE_ROWS: Array<{ label: string; render: (inv: ScoredInvestor, isWinner: boolean) => React.ReactNode }> = [
  {
    label: "Match Score",
    render: (inv, isWinner) => (
      <span className={`text-sm font-bold ${isWinner ? "text-[#10B981]" : "text-[#111827]"}`}>
        {inv.computedMatch}%{isWinner && <span className="ml-1 text-xs">⭐ Best</span>}
      </span>
    ),
  },
  {
    label: "Cheque Size",
    render: (inv) => <span className="text-sm text-[#111827]">{inv.chequeSize}</span>,
  },
  {
    label: "Funding Type",
    render: (inv) => <span className="text-sm text-[#111827]">{inv.fundingType}</span>,
  },
  {
    label: "Investor Type",
    render: (inv) => <span className="text-sm text-[#111827]">{inv.investorType}</span>,
  },
  {
    label: "Typical Equity",
    render: (inv) => <span className="text-sm text-[#111827]">{inv.typicalEquity}</span>,
  },
  {
    label: "Sectors",
    render: (inv) => (
      <div className="flex flex-wrap gap-1">
        {inv.sectors.map((s) => (
          <span key={s} className="px-2 py-0.5 bg-[#F3F4F6] text-[#111827] text-xs rounded">
            {s}
          </span>
        ))}
      </div>
    ),
  },
  {
    label: "Stage",
    render: (inv) => (
      <div className="flex flex-wrap gap-1">
        {inv.stage.map((s) => (
          <span key={s} className="px-2 py-0.5 bg-[#EFF6FF] text-[#2563EB] text-xs rounded">
            {s}
          </span>
        ))}
      </div>
    ),
  },
  {
    label: "Geography",
    render: (inv) => (
      <div className="flex flex-wrap gap-1">
        {inv.geography.map((g) => (
          <span key={g} className="px-2 py-0.5 bg-[#F3F4F6] text-[#111827] text-xs rounded">
            {g}
          </span>
        ))}
      </div>
    ),
  },
];

export function CompareDrawer({ investors, onClose }: Props) {
  const bestMatchId = investors.reduce(
    (best, inv) => (inv.computedMatch > (investors.find((i) => i.id === best)?.computedMatch ?? 0) ? inv.id : best),
    investors[0]?.id
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-6 pointer-events-none">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden pointer-events-auto max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] flex-shrink-0">
            <div>
              <h2 className="text-lg font-semibold text-[#111827]">Compare Investors</h2>
              <p className="text-sm text-[#6B7280]">{investors.length} investors selected</p>
            </div>
            <button
              onClick={onClose}
              className="text-[#6B7280] hover:text-[#111827] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Table */}
          <div className="overflow-auto flex-1">
            <table className="w-full">
              <thead className="sticky top-0 bg-white border-b border-[#E5E7EB] z-10">
                <tr>
                  <th className="p-4 text-left text-sm font-medium text-[#6B7280] w-36 bg-[#F9FAFB]">
                    Attribute
                  </th>
                  {investors.map((inv) => (
                    <th key={inv.id} className="p-4 text-left min-w-[180px]">
                      <p className="text-sm font-semibold text-[#111827]">{inv.name}</p>
                      <p className="text-xs text-[#6B7280]">{inv.institution}</p>
                      {inv.id === bestMatchId && (
                        <span className="inline-flex mt-1 px-2 py-0.5 bg-[#D1FAE5] text-[#10B981] text-xs rounded-full font-medium">
                          Best Match
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ATTRIBUTE_ROWS.map(({ label, render }) => (
                  <tr key={label} className="border-b border-[#E5E7EB] last:border-0">
                    <td className="p-4 text-sm font-medium text-[#6B7280] bg-[#F9FAFB]">
                      {label}
                    </td>
                    {investors.map((inv) => (
                      <td key={inv.id} className={`p-4 ${inv.id === bestMatchId && label === "Match Score" ? "bg-[#F0FDF4]" : ""}`}>
                        {render(inv, label === "Match Score" && inv.id === bestMatchId)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
