import { createContext, useContext, useState, ReactNode } from "react";
import { allInvestors, Investor, CRMStatus } from "../data/investors";

export type OutreachNote = {
  id: string;
  text: string;
  date: string;
};

type InvestorContextType = {
  investors: Investor[];
  savedIds: Set<number>;
  crmStatuses: Record<number, CRMStatus>;
  outreachNotes: Record<number, OutreachNote[]>;
  selectedInvestorId: number | null;
  toggleSave: (id: number) => void;
  updateCRMStatus: (id: number, status: CRMStatus) => void;
  addOutreachNote: (investorId: number, text: string) => void;
  deleteOutreachNote: (investorId: number, noteId: string) => void;
  setSelectedInvestorId: (id: number | null) => void;
};

const InvestorContext = createContext<InvestorContextType | null>(null);

export function InvestorProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [crmStatuses, setCrmStatuses] = useState<Record<number, CRMStatus>>({});
  const [outreachNotes, setOutreachNotes] = useState<Record<number, OutreachNote[]>>({});
  const [selectedInvestorId, setSelectedInvestorId] = useState<number | null>(null);

  const toggleSave = (id: number) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const updateCRMStatus = (id: number, status: CRMStatus) => {
    setCrmStatuses((prev) => ({ ...prev, [id]: status }));
  };

  const addOutreachNote = (investorId: number, text: string) => {
    const note: OutreachNote = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      text,
      date: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };
    setOutreachNotes((prev) => ({
      ...prev,
      [investorId]: [note, ...(prev[investorId] ?? [])],
    }));
  };

  const deleteOutreachNote = (investorId: number, noteId: string) => {
    setOutreachNotes((prev) => ({
      ...prev,
      [investorId]: (prev[investorId] ?? []).filter((n) => n.id !== noteId),
    }));
  };

  return (
    <InvestorContext.Provider
      value={{
        investors: allInvestors,
        savedIds,
        crmStatuses,
        outreachNotes,
        selectedInvestorId,
        toggleSave,
        updateCRMStatus,
        addOutreachNote,
        deleteOutreachNote,
        setSelectedInvestorId,
      }}
    >
      {children}
    </InvestorContext.Provider>
  );
}

export function useInvestors() {
  const ctx = useContext(InvestorContext);
  if (!ctx) throw new Error("useInvestors must be used within InvestorProvider");
  return ctx;
}
