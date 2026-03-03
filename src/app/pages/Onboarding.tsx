import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth, StartupProfile } from "../context/AuthContext";
import { Check, ChevronRight, Loader2, X } from "lucide-react";

const STAGES = ["Idea", "Pre-Seed", "Seed", "Series A", "Series B+"];
const SECTORS = ["SaaS", "FinTech", "HealthTech", "EdTech", "B2B", "Enterprise", "Consumer", "E-commerce", "DeepTech", "D2C", "AgriTech", "CleanTech"];
const AMOUNTS = ["₹25L – ₹50L", "₹50L – ₹1 Cr", "₹1 Cr – ₹5 Cr", "₹5 Cr – ₹20 Cr", "₹20 Cr+"];
const GEOGRAPHIES = ["India", "Southeast Asia", "USA", "Middle East", "Global"];

const STEPS = [
  { number: 1, label: "Startup Profile" },
  { number: 2, label: "What You Build" },
  { number: 3, label: "Fundraise" },
  { number: 4, label: "All Set" },
];

export function Onboarding() {
  const { user, completeOnboarding, skipOnboarding } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [companyName, setCompanyName] = useState("");
  const [selectedStage, setSelectedStage] = useState("");

  // Step 2
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [problem, setProblem] = useState("");

  // Step 3
  const [raisingAmount, setRaisingAmount] = useState("");
  const [fundingType, setFundingType] = useState("");
  const [selectedGeographies, setSelectedGeographies] = useState<string[]>([]);

  const toggleSector = (s: string) =>
    setSelectedSectors((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const toggleGeo = (g: string) =>
    setSelectedGeographies((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);

  const canProceed = () => {
    if (step === 1) return companyName.trim() && selectedStage;
    if (step === 2) return selectedSectors.length > 0;
    if (step === 3) return raisingAmount && fundingType && selectedGeographies.length > 0;
    return true;
  };

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    if (step === 3) {
      setLoading(true);
      const profile: StartupProfile = {
        companyName: companyName.trim(),
        stage: selectedStage,
        sectors: selectedSectors,
        problem: problem.trim(),
        raisingAmount,
        fundingType,
        geographies: selectedGeographies,
      };
      await new Promise((r) => setTimeout(r, 600));
      completeOnboarding(profile);
      setLoading(false);
      setStep(4);
    }
  };

  const handleFinish = () => navigate("/", { replace: true });

  const handleSkip = () => {
    skipOnboarding();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-[#111827]">Investor Intelligence</h1>
        </div>

        {/* Progress bar - hide on step 4 */}
        {step < 4 && (
          <div className="mb-8">
            {/* Steps */}
            <div className="flex items-center justify-between mb-3">
              {STEPS.slice(0, 3).map((s, i) => (
                <div key={s.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                        step > s.number
                          ? "bg-[#10B981] text-white"
                          : step === s.number
                          ? "bg-[#2563EB] text-white"
                          : "bg-[#E5E7EB] text-[#9CA3AF]"
                      }`}
                    >
                      {step > s.number ? <Check className="h-4 w-4" /> : s.number}
                    </div>
                    <span className={`text-xs mt-1 font-medium ${step === s.number ? "text-[#2563EB]" : "text-[#9CA3AF]"}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < 2 && (
                    <div className={`flex-1 h-px mx-2 mb-5 transition-all ${step > s.number ? "bg-[#10B981]" : "bg-[#E5E7EB]"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-8 relative">

          {/* Skip button — only steps 1-3 */}
          {step < 4 && (
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 text-xs text-[#9CA3AF] hover:text-[#6B7280] flex items-center gap-1 transition-colors"
            >
              Skip setup <X className="h-3 w-3" />
            </button>
          )}

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div>
              <p className="text-xs font-semibold text-[#2563EB] uppercase tracking-wide mb-1">Step 1 of 3</p>
              <h2 className="text-xl font-semibold text-[#111827] mb-1">Tell us about your startup</h2>
              <p className="text-sm text-[#6B7280] mb-6">This helps us personalise your investor matches.</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-1.5">Startup name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Zeno Finance"
                    autoFocus
                    className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-3">Current stage</label>
                  <div className="flex flex-wrap gap-2">
                    {STAGES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedStage(s)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                          selectedStage === s
                            ? "bg-[#2563EB] text-white border-[#2563EB]"
                            : "bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#2563EB] hover:text-[#2563EB]"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div>
              <p className="text-xs font-semibold text-[#2563EB] uppercase tracking-wide mb-1">Step 2 of 3</p>
              <h2 className="text-xl font-semibold text-[#111827] mb-1">What are you building?</h2>
              <p className="text-sm text-[#6B7280] mb-6">Select all sectors that apply to your startup.</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-3">
                    Sector(s)
                    {selectedSectors.length > 0 && (
                      <span className="ml-2 text-xs text-[#2563EB] font-normal">{selectedSectors.length} selected</span>
                    )}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SECTORS.map((s) => (
                      <button
                        key={s}
                        onClick={() => toggleSector(s)}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                          selectedSectors.includes(s)
                            ? "bg-[#2563EB] text-white border-[#2563EB]"
                            : "bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#2563EB] hover:text-[#2563EB]"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-1.5">
                    What problem are you solving?
                    <span className="text-[#9CA3AF] font-normal ml-1">(optional)</span>
                  </label>
                  <textarea
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    placeholder="e.g. We help SMBs access working capital in under 24 hours..."
                    rows={3}
                    className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && (
            <div>
              <p className="text-xs font-semibold text-[#2563EB] uppercase tracking-wide mb-1">Step 3 of 3</p>
              <h2 className="text-xl font-semibold text-[#111827] mb-1">Fundraise details</h2>
              <p className="text-sm text-[#6B7280] mb-6">We'll match investors whose cheque size fits your raise.</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-3">How much are you raising?</label>
                  <div className="flex flex-wrap gap-2">
                    {AMOUNTS.map((a) => (
                      <button
                        key={a}
                        onClick={() => setRaisingAmount(a)}
                        className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                          raisingAmount === a
                            ? "bg-[#2563EB] text-white border-[#2563EB]"
                            : "bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#2563EB] hover:text-[#2563EB]"
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-3">Funding type</label>
                  <div className="flex gap-3">
                    {["Equity", "Debt", "Both"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setFundingType(t)}
                        className={`flex-1 py-2.5 rounded-lg text-sm border font-medium transition-all ${
                          fundingType === t
                            ? "bg-[#2563EB] text-white border-[#2563EB]"
                            : "bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#2563EB] hover:text-[#2563EB]"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-3">Target geography</label>
                  <div className="flex flex-wrap gap-2">
                    {GEOGRAPHIES.map((g) => (
                      <button
                        key={g}
                        onClick={() => toggleGeo(g)}
                        className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                          selectedGeographies.includes(g)
                            ? "bg-[#2563EB] text-white border-[#2563EB]"
                            : "bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#2563EB] hover:text-[#2563EB]"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 4 – Done ── */}
          {step === 4 && (
            <div className="text-center py-4">
              <div className="h-16 w-16 rounded-full bg-[#D1FAE5] flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-[#10B981]" />
              </div>
              <h2 className="text-xl font-semibold text-[#111827] mb-2">You're all set, {user?.name.split(" ")[0]}!</h2>
              <p className="text-sm text-[#6B7280] mb-2">
                We've personalised your investor matches based on your profile.
              </p>
              <div className="inline-flex items-center gap-2 bg-[#EFF6FF] rounded-lg px-4 py-2 mb-8">
                <span className="text-2xl font-semibold text-[#2563EB]">10</span>
                <span className="text-sm text-[#6B7280]">investors matched to your startup</span>
              </div>

              {/* Profile summary */}
              <div className="bg-[#F9FAFB] rounded-lg p-4 text-left space-y-2 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B7280]">Startup</span>
                  <span className="font-medium text-[#111827]">{companyName || "—"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B7280]">Stage</span>
                  <span className="font-medium text-[#111827]">{selectedStage || "—"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B7280]">Raising</span>
                  <span className="font-medium text-[#111827]">{raisingAmount || "—"}</span>
                </div>
                <div className="flex items-start justify-between text-sm gap-4">
                  <span className="text-[#6B7280] shrink-0">Sectors</span>
                  <span className="font-medium text-[#111827] text-right">{selectedSectors.join(", ") || "—"}</span>
                </div>
              </div>

              <button
                onClick={handleFinish}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#2563EB] text-white text-sm font-medium rounded-lg hover:bg-[#1D4ED8] transition-all"
              >
                View Your Investor Matches
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Footer nav — steps 1-3 */}
          {step < 4 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#E5E7EB]">
              <button
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
                className="px-4 py-2 text-sm text-[#6B7280] hover:text-[#111827] disabled:opacity-0 transition-all"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!canProceed() || loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#2563EB] text-white text-sm font-medium rounded-lg hover:bg-[#1D4ED8] disabled:opacity-50 transition-all"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {step === 3 ? "Finish Setup" : "Continue"}
                {!loading && <ChevronRight className="h-4 w-4" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
