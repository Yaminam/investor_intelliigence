import { useState, useMemo } from "react";
import { useAuth, StartupProfile } from "../context/AuthContext";
import { useInvestors } from "../context/InvestorContext";
import { computeMatchScore } from "../utils/matchScore";
import { toast } from "sonner";
import { Save, User, Building2, Zap, CheckCircle2, AlertCircle } from "lucide-react";

const STAGES = ["Idea", "Pre-Seed", "Seed", "Series A", "Series B+"];
const SECTORS = [
  "SaaS", "FinTech", "HealthTech", "EdTech", "B2B", "Enterprise",
  "Consumer", "E-commerce", "DeepTech", "D2C", "AgriTech", "CleanTech",
];
const AMOUNTS = ["₹25L – ₹50L", "₹50L – ₹1 Cr", "₹1 Cr – ₹5 Cr", "₹5 Cr – ₹20 Cr", "₹20 Cr+"];
const GEOGRAPHIES = ["India", "Southeast Asia", "USA", "Middle East", "Global"];
const GEO_FLAGS: Record<string, string> = {
  India: "🇮🇳", "Southeast Asia": "🌏", USA: "🇺🇸", "Middle East": "🌍", Global: "🌐",
};

export function Settings() {
  const { user, updateProfile } = useAuth();
  const { investors } = useInvestors();
  const profile = user?.profile;

  const [companyName, setCompanyName] = useState(profile?.companyName ?? "");
  const [stage, setStage] = useState(profile?.stage ?? "");
  const [sectors, setSectors] = useState<string[]>(profile?.sectors ?? []);
  const [problem, setProblem] = useState(profile?.problem ?? "");
  const [raisingAmount, setRaisingAmount] = useState(profile?.raisingAmount ?? "");
  const [fundingType, setFundingType] = useState(profile?.fundingType ?? "");
  const [geographies, setGeographies] = useState<string[]>(profile?.geographies ?? []);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleSector = (s: string) =>
    setSectors((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const toggleGeo = (g: string) =>
    setGeographies((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));

  const requiredFields: boolean[] = [
    Boolean(companyName.trim()), Boolean(stage), sectors.length > 0,
    Boolean(raisingAmount), Boolean(fundingType), geographies.length > 0,
  ];
  const allFields: boolean[] = [...requiredFields, Boolean(problem.trim())];
  const completeness = Math.round((allFields.filter(Boolean).length / allFields.length) * 100);
  const canSave = requiredFields.every(Boolean);

  const completenessColor =
    completeness === 100 ? "#10B981" :
    completeness >= 70 ? "#2563EB" :
    completeness >= 40 ? "#F59E0B" : "#EF4444";

  const previewProfile: StartupProfile | null = canSave
    ? { companyName: companyName.trim(), stage, sectors, problem, raisingAmount, fundingType, geographies }
    : null;

  const matchPreview = useMemo(() => {
    if (!previewProfile) return null;
    const scores = investors.map((inv) => computeMatchScore(inv, previewProfile));
    return {
      excellent: scores.filter((s) => s >= 80).length,
      good: scores.filter((s) => s >= 60 && s < 80).length,
      total: scores.length,
    };
  }, [previewProfile, investors]);

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    updateProfile({
      companyName: companyName.trim(), stage, sectors,
      problem, raisingAmount, fundingType, geographies,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    toast.success("Profile saved", { description: "Match scores have been recalculated." });
  };

  return (
    <div className="p-8 max-w-2xl space-y-5">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#111827]">Settings</h1>
        <p className="text-sm text-[#6B7280] mt-1">Manage your account and startup profile.</p>
      </div>

      {/* Account card */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center shrink-0">
          <span className="text-white text-xl font-bold">{user?.avatar ?? "?"}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#111827]">{user?.name ?? "—"}</p>
          <p className="text-sm text-[#6B7280] truncate">{user?.email ?? "—"}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#D1FAE5] text-[#059669] text-xs font-semibold rounded-full shrink-0">
          <User className="h-3 w-3" /> Founder
        </span>
      </div>

      {/* Profile completeness */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {completeness === 100
              ? <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
              : <AlertCircle className="h-4 w-4 text-[#F59E0B]" />}
            <span className="text-sm font-medium text-[#111827]">Profile Completeness</span>
          </div>
          <span className="text-sm font-semibold" style={{ color: completenessColor }}>{completeness}%</span>
        </div>
        <div className="w-full h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${completeness}%`, backgroundColor: completenessColor }}
          />
        </div>
        {!canSave && (
          <p className="text-xs text-[#9CA3AF] mt-2">Complete all required fields to unlock match scoring.</p>
        )}
      </div>

      {/* Live match preview */}
      {matchPreview && (
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-4 w-4 text-[#2563EB]" />
            <span className="text-sm font-semibold text-[#1E40AF]">Live Match Preview</span>
            <span className="text-xs text-[#93C5FD] ml-1">updates as you edit</span>
          </div>
          <div className="flex gap-8">
            <div>
              <p className="text-3xl font-bold text-[#10B981]">{matchPreview.excellent}</p>
              <p className="text-xs text-[#6B7280] mt-0.5">Excellent (80%+)</p>
            </div>
            <div className="w-px bg-[#BFDBFE]" />
            <div>
              <p className="text-3xl font-bold text-[#2563EB]">{matchPreview.good}</p>
              <p className="text-xs text-[#6B7280] mt-0.5">Good (60–79%)</p>
            </div>
            <div className="w-px bg-[#BFDBFE]" />
            <div>
              <p className="text-3xl font-bold text-[#111827]">{matchPreview.total}</p>
              <p className="text-xs text-[#6B7280] mt-0.5">Total investors</p>
            </div>
          </div>
        </div>
      )}

      {/* Startup profile form */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">

        {/* Form header */}
        <div className="px-6 py-4 border-b border-[#F3F4F6] flex items-center gap-2">
          <Building2 className="h-4 w-4 text-[#6B7280]" />
          <h2 className="font-semibold text-[#111827]">Startup Profile</h2>
          <span className="ml-auto text-xs text-[#9CA3AF]">
            Fields marked <span className="text-red-400">*</span> are required
          </span>
        </div>

        <div className="divide-y divide-[#F9FAFB]">

          {/* Company Name */}
          <div className="px-6 py-5">
            <label className="block text-sm font-medium text-[#111827] mb-2">
              Company Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Acme Inc."
              className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition"
            />
          </div>

          {/* Stage */}
          <div className="px-6 py-5">
            <label className="block text-sm font-medium text-[#111827] mb-2">
              Stage <span className="text-red-400">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {STAGES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStage(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    stage === s
                      ? "bg-[#2563EB] text-white border-[#2563EB] shadow-sm"
                      : "bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#2563EB] hover:text-[#2563EB]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Sectors */}
          <div className="px-6 py-5">
            <label className="block text-sm font-medium text-[#111827] mb-1">
              Sectors <span className="text-red-400">*</span>{" "}
              <span className="text-[#9CA3AF] font-normal text-xs">(select all that apply)</span>
            </label>
            {sectors.length > 0 && (
              <p className="text-xs text-[#2563EB] mb-2">{sectors.length} selected</p>
            )}
            <div className="flex flex-wrap gap-2">
              {SECTORS.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleSector(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                    sectors.includes(s)
                      ? "bg-[#2563EB] text-white border-[#2563EB] shadow-sm"
                      : "bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#2563EB] hover:text-[#2563EB]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Problem Statement */}
          <div className="px-6 py-5">
            <label className="block text-sm font-medium text-[#111827] mb-1">
              Problem Statement{" "}
              <span className="text-[#9CA3AF] font-normal text-xs">(optional — used in email templates)</span>
            </label>
            <textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              rows={3}
              placeholder="Describe the problem your startup solves..."
              className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB] resize-none transition"
            />
            <p className="text-xs text-[#C4C9D4] mt-1 text-right">{problem.length} / 300</p>
          </div>

          {/* Raising Amount */}
          <div className="px-6 py-5">
            <label className="block text-sm font-medium text-[#111827] mb-2">
              Raising Amount <span className="text-red-400">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {AMOUNTS.map((a) => (
                <button
                  key={a}
                  onClick={() => setRaisingAmount(a)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                    raisingAmount === a
                      ? "bg-[#2563EB] text-white border-[#2563EB] shadow-sm"
                      : "bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#2563EB] hover:text-[#2563EB]"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Funding Type */}
          <div className="px-6 py-5">
            <label className="block text-sm font-medium text-[#111827] mb-2">
              Funding Type <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2">
              {["Equity", "Debt", "Both"].map((t) => (
                <button
                  key={t}
                  onClick={() => setFundingType(t)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium border transition-all ${
                    fundingType === t
                      ? "bg-[#2563EB] text-white border-[#2563EB] shadow-sm"
                      : "bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#2563EB] hover:text-[#2563EB]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Geographies */}
          <div className="px-6 py-5">
            <label className="block text-sm font-medium text-[#111827] mb-2">
              Target Geographies <span className="text-red-400">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {GEOGRAPHIES.map((g) => (
                <button
                  key={g}
                  onClick={() => toggleGeo(g)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all flex items-center gap-1.5 ${
                    geographies.includes(g)
                      ? "bg-[#2563EB] text-white border-[#2563EB] shadow-sm"
                      : "bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#2563EB] hover:text-[#2563EB]"
                  }`}
                >
                  <span>{GEO_FLAGS[g]}</span>
                  {g}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Save footer */}
        <div className="px-6 py-4 bg-[#F9FAFB] border-t border-[#F3F4F6] flex items-center justify-between">
          {!canSave ? (
            <p className="text-xs text-[#9CA3AF]">
              Fill all required <span className="text-red-400">*</span> fields to save.
            </p>
          ) : (
            <p className="text-xs text-[#6B7280]">
              Saving will recalculate match scores across all investors.
            </p>
          )}
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              saved
                ? "bg-[#10B981] text-white"
                : "bg-[#2563EB] text-white hover:bg-[#1D4ED8] active:scale-95"
            }`}
          >
            {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

    </div>
  );
}
