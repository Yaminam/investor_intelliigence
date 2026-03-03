import type { Investor } from "../data/investors";
import type { StartupProfile } from "../context/AuthContext";

const STAGE_ORDER = ["Idea", "Pre-Seed", "Seed", "Series A", "Series B", "Series B+", "Series C"];

export function computeMatchScore(investor: Investor, profile: StartupProfile | null): number {
  if (!profile) return investor.match;

  let score = 0;

  // --- Sector overlap (40 pts max) ---
  const sectorOverlap = investor.sectors.filter((s) => profile.sectors.includes(s)).length;
  const maxSectors = Math.max(investor.sectors.length, profile.sectors.length, 1);
  score += (sectorOverlap / maxSectors) * 40;

  // --- Stage proximity (30 pts max) ---
  const profileIdx = STAGE_ORDER.indexOf(profile.stage);
  const investorIndices = investor.stage
    .map((s) => STAGE_ORDER.indexOf(s))
    .filter((i) => i >= 0);
  if (investorIndices.length > 0 && profileIdx >= 0) {
    const minDist = Math.min(...investorIndices.map((i) => Math.abs(i - profileIdx)));
    if (minDist === 0) score += 30;
    else if (minDist === 1) score += 18;
    else if (minDist === 2) score += 7;
  } else {
    score += 10; // neutral when stage unknown
  }

  // --- Geography match (20 pts max) ---
  const hasGlobal =
    investor.geography.includes("Global") || profile.geographies.includes("Global");
  if (hasGlobal) {
    score += 20;
  } else {
    const geoOverlap = investor.geography.filter((g) =>
      profile.geographies.includes(g)
    ).length;
    score += geoOverlap > 0 ? 20 : 0;
  }

  // --- Funding type (10 pts max) ---
  if (
    profile.fundingType === "Both" ||
    investor.fundingType === "Both" ||
    investor.fundingType === profile.fundingType
  ) {
    score += 10;
  }

  return Math.round(Math.min(Math.max(score, 5), 100));
}
