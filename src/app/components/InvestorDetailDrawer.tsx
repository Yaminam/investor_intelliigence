import { useState } from "react";
import { X, Copy, ExternalLink, Linkedin, Bookmark, BookmarkCheck, Plus, Trash2, Mail } from "lucide-react";
import { toast } from "sonner";
import { Investor } from "../data/investors";
import { useInvestors } from "../context/InvestorContext";
import { useAuth } from "../context/AuthContext";

type Props = {
  investor: Investor | null;
  onClose: () => void;
};

type Tab = "overview" | "outreach" | "email";

export function InvestorDetailDrawer({ investor, onClose }: Props) {
  const { savedIds, toggleSave, outreachNotes, addOutreachNote, deleteOutreachNote } = useInvestors();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [noteText, setNoteText] = useState("");

  if (!investor) return null;

  const isSaved = savedIds.has(investor.id);
  const notes = outreachNotes[investor.id] ?? [];

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(investor.email);
    toast.success("Email copied!", { description: investor.email });
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    addOutreachNote(investor.id, noteText.trim());
    setNoteText("");
    toast.success("Note added");
  };

  const profile = user?.profile;
  const firstName = investor.name.split(" ")[0];
  const companyName = profile?.companyName || user?.name || "My Startup";
  const sector = (profile?.sectors ?? investor.sectors).slice(0, 2).join(" & ");
  const problem = profile?.problem || `solutions in the ${investor.sectors[0] ?? "tech"} space`;
  const raise = profile?.raisingAmount || "our current round";
  const userFullName = user?.name || "Founder";

  const emailTemplate = `Subject: Introduction â€“ ${companyName} x ${firstName} (${investor.institution})

Hi ${firstName},

I came across ${investor.institution} while researching investors focused on ${sector}, and I'd love to share what we're building at ${companyName}.

We're building ${problem} â€” a ${profile?.stage ?? "early-stage"} startup raising ${raise} (${profile?.fundingType ?? "Equity"}). We're growing strong and believe ${investor.institution}'s track record in ${investor.sectors[0] ?? "tech"} makes you an ideal partner.

Would love to share our deck or jump on a 15-min call at your convenience.

Best regards,
${userFullName}`;

  const activityTimeline = [
    { date: "Feb 15, 2026", event: "Co-led TechCorp Series A ($8M round)", type: "investment" },
    { date: "Jan 8, 2026", event: "Portfolio company NovaPay raised Series B", type: "exit" },
    { date: "Dec 20, 2025", event: `New fund â€“ ${investor.institution} Fund IV announced`, type: "news" },
  ];

  const TABS: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "outreach", label: `Outreach${notes.length > 0 ? ` (${notes.length})` : ""}` },
    { id: "email", label: "Email Template" },
  ];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/20 z-40 transition-opacity" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-[440px] bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#E5E7EB] flex-shrink-0">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-[#111827] mb-1">{investor.name}</h2>
              <p className="text-[#6B7280]">{investor.institution}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  toggleSave(investor.id);
                  toast.success(isSaved ? "Removed from saved" : "Saved to watchlist", { description: investor.name });
                }}
                className={`p-2 rounded-lg border border-[#E5E7EB] transition-all ${isSaved ? "text-[#2563EB] bg-[#EFF6FF]" : "text-[#6B7280] hover:bg-[#F3F4F6]"}`}
                title={isSaved ? "Remove from saved" : "Save investor"}
              >
                {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              </button>
              <button onClick={onClose} className="text-[#6B7280] hover:text-[#111827] transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#2563EB]">
            <span className="text-sm font-semibold text-[#2563EB]">{investor.match}% Match</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#E5E7EB] flex-shrink-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                tab === t.id ? "border-[#2563EB] text-[#2563EB]" : "border-transparent text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* â”€â”€ OVERVIEW â”€â”€ */}
          {tab === "overview" && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Cheque Size</p>
                  <p className="text-sm font-medium text-[#111827]">{investor.chequeSize}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Email</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-[#111827] truncate flex-1">{investor.email}</p>
                    <button onClick={handleCopyEmail} className="text-[#6B7280] hover:text-[#2563EB] transition-colors" title="Copy email">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Funding Type</p>
                  <p className="text-sm font-medium text-[#111827]">{investor.fundingType}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Website</p>
                  <a href={investor.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[#2563EB] hover:underline inline-flex items-center gap-1">
                    Visit <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Typical Equity</p>
                  <p className="text-sm font-medium text-[#111827]">{investor.typicalEquity}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">LinkedIn</p>
                  <a href={`https://${investor.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[#2563EB] hover:underline inline-flex items-center gap-1">
                    View <Linkedin className="h-3 w-3" />
                  </a>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-[#6B7280] mb-1">Investor Type</p>
                  <p className="text-sm font-medium text-[#111827]">{investor.investorType}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-[#111827] mb-3">Sectors</p>
                <div className="flex flex-wrap gap-2">
                  {investor.sectors.map((s) => (
                    <span key={s} className="inline-flex px-3 py-1.5 rounded-lg text-sm bg-[#F3F4F6] text-[#111827]">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111827] mb-3">Stage</p>
                <div className="flex flex-wrap gap-2">
                  {investor.stage.map((s) => (
                    <span key={s} className="inline-flex px-3 py-1.5 rounded-lg text-sm bg-[#EFF6FF] text-[#2563EB]">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111827] mb-3">Geography</p>
                <div className="flex flex-wrap gap-2">
                  {investor.geography.map((g) => (
                    <span key={g} className="inline-flex px-3 py-1.5 rounded-lg text-sm bg-[#F3F4F6] text-[#111827]">{g}</span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-[#111827] mb-4">Activity Timeline</p>
                <div className="space-y-4">
                  {activityTimeline.map((activity, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-2 w-2 rounded-full bg-[#2563EB] mt-1" />
                        {index < activityTimeline.length - 1 && <div className="w-px flex-1 bg-[#E5E7EB] mt-1" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-xs text-[#6B7280] mb-1">{activity.date}</p>
                        <p className="text-sm text-[#111827]">{activity.event}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* â”€â”€ OUTREACH â”€â”€ */}
          {tab === "outreach" && (
            <div className="p-6 space-y-5">
              <p className="text-sm text-[#6B7280]">Track your interactions with {investor.name}. Notes are saved locally.</p>
              <div className="space-y-2">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={3}
                  placeholder={`e.g. "Sent intro email on Mar 3. Waiting for reply."`}
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB] resize-none"
                  onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAddNote(); }}
                />
                <button
                  onClick={handleAddNote}
                  disabled={!noteText.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white text-sm font-medium rounded-lg hover:bg-[#1D4ED8] disabled:opacity-40 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Note
                </button>
              </div>
              {notes.length === 0 ? (
                <div className="text-center py-10 text-[#9CA3AF] text-sm">No notes yet. Add your first interaction above.</div>
              ) : (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div key={note.id} className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-4 group">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-[#111827] flex-1 whitespace-pre-wrap">{note.text}</p>
                        <button
                          onClick={() => deleteOutreachNote(investor.id, note.id)}
                          className="text-[#E5E7EB] group-hover:text-[#EF4444] transition-colors flex-shrink-0"
                          title="Delete note"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs text-[#9CA3AF] mt-2">{note.date}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* â”€â”€ EMAIL TEMPLATE â”€â”€ */}
          {tab === "email" && (
            <div className="p-6 space-y-4">
              <p className="text-sm text-[#6B7280]">Personalised intro email â€” ready to copy and send.</p>
              <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-4">
                <pre className="text-sm text-[#111827] whitespace-pre-wrap font-sans leading-relaxed">{emailTemplate}</pre>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(emailTemplate);
                    toast.success("Email copied!", { description: "Paste into Gmail or your email client." });
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white text-sm font-medium rounded-lg hover:bg-[#1D4ED8] transition-colors"
                >
                  <Copy className="h-4 w-4" />
                  Copy Email
                </button>
                <a
                  href={`mailto:${investor.email}?subject=${encodeURIComponent(`Introduction â€“ ${companyName} x ${firstName}`)}&body=${encodeURIComponent(emailTemplate)}`}
                  className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] text-[#111827] text-sm font-medium rounded-lg hover:bg-[#F3F4F6] transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  Open in Mail App
                </a>
              </div>
              {!profile && (
                <div className="bg-[#FEF3C7] border border-[#FCD34D] rounded-lg p-3 text-sm text-[#92400E]">
                  ðŸ’¡ Complete your profile in <strong>Settings</strong> to personalise this template with your company details.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#E5E7EB] bg-[#F9FAFB] flex-shrink-0">
          <p className="text-xs text-[#6B7280] mb-1">Source</p>
          <p className="text-xs text-[#111827] mb-2">Crunchbase, LinkedIn</p>
          <p className="text-xs text-[#6B7280]">Date added: Feb 28, 2026</p>
        </div>
      </div>
    </>
  );
}
