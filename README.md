
# Investor Intelligence

A curated investor discovery and CRM tool for early-stage founders. Browse 30 Indian startup investors, track outreach, compare options side-by-side, and get personalised match scores based on your startup profile.

---

## Getting Started

```bash
npm install       # install dependencies
npm run dev       # start dev server → http://localhost:5173
npm run build     # production build
```

---

## Pages & Sections

### 🏠 All Investors (`/`)
The main dashboard. Displays all 30 investors in a sortable, filterable table.

| Feature | Description |
|---|---|
| **Match Score** | Color-coded badge (green ≥ 80, blue ≥ 60, gray < 60) calculated live from your startup profile |
| **Best Match Banner** | Top 3 investors highlighted by score — appears once you complete your profile in Settings |
| **Search + Autocomplete** | Searches by name, institution, or sector. Press `/` to focus the search box |
| **Filters** | Filter by Sector, Stage, Geography, and Funding Type. Advanced panel adds a min Match % slider |
| **Sort** | Click column headers to sort by Match Score or Cheque Size |
| **CRM Status** | Inline dropdown — Active / Contacted / In Talks / Passed — persisted across the session |
| **Compare** | Check up to 3 investors → floating bar appears → opens side-by-side comparison modal |
| **Actions** | Copy email, open website, bookmark/save per investor |
| **Export CSV** | Downloads filtered list as a `.csv` file |
| **Pagination** | 10 investors per page with smart ellipsis pagination |

---

### 🆕 New This Week (`/new-this-week`)
Shows only investors flagged `isNew: true` — typically the latest additions to the database.

| Feature | Description |
|---|---|
| **Filtered view** | Same search + sector/stage filters as All Investors |
| **CRM Status** | Same inline status picker |
| **Click to open drawer** | Clicking any row opens the global investor detail drawer |

---

### 📊 Analytics (`/analytics`)
Aggregated insights across the investor database and your outreach activity.

| Chart | Description |
|---|---|
| **Match Score Distribution** | Histogram of all 30 investors bucketed into score ranges (0–40, 41–60, 61–80, 81–100) — colored by quality |
| **CRM Pipeline Funnel** | Bar chart of how many investors are in each CRM status. Shows an empty-state prompt when no outreach has started |
| **Top Sectors** | Frequency of sectors across all investors |
| **Cheque Size Distribution** | Spread of cheque sizes in the database |
| **Stage Coverage** | Which funding stages are most represented |
| **Top Institutions** | Institutions with the most investors listed |

---

### 🔖 Saved (`/saved`)
Your bookmarked investors. Bookmarks are toggled from the Actions column in any table.

---

### ⚙️ Settings (`/settings`)
Edit your startup profile. Controls match scoring across the entire app.

| Section | Description |
|---|---|
| **Account** | Displays your name, email, and Founder badge |
| **Profile Completeness** | Progress bar (red → amber → blue → green) tracking how much of your profile is filled |
| **Live Match Preview** | Real-time count of excellent (80%+) and good (60–79%) matches — updates as you edit |
| **Company Name** | Your startup's name — used in email templates |
| **Stage** | Current funding stage (Idea, Pre-Seed, Seed, Series A, Series B+) |
| **Sectors** | What your startup operates in — drives 40% of match score |
| **Problem Statement** | Optional, used to personalise the email template in the investor drawer |
| **Raising Amount** | Target raise size |
| **Funding Type** | Equity, Debt, or Both |
| **Target Geographies** | Where you want to raise — drives 20% of match score |

---

## Investor Detail Drawer

Clicking any investor row anywhere in the app opens a slide-in drawer with three tabs:

| Tab | Content |
|---|---|
| **Overview** | Cheque size, funding type, equity range, investor type, sectors, stage, geography, website, LinkedIn, activity timeline |
| **Outreach** | Add timestamped notes per investor. Delete on hover. Cmd + Enter to submit |
| **Email Template** | Auto-generated intro email pre-filled with your profile and the investor's details. Copy to clipboard or open in Mail app |

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Cmd / Ctrl + K` | Open command palette — search pages and investors |
| `/` | Focus the search box on All Investors |
| `Cmd + Enter` | Submit outreach note (inside drawer) |
| `Esc` | Close any open drawer or modal |

---

## Match Score Algorithm

Scores are computed live whenever your Settings profile changes:

| Signal | Weight |
|---|---|
| Sector overlap | 40 pts |
| Stage proximity | 30 pts |
| Geography match | 20 pts |
| Funding type match | 10 pts |

Falls back to the investor's static score when no profile is set.

---

## Project Structure

```
src/
  app/
    pages/
      AllInvestors.tsx      ← main investor table
      NewThisWeek.tsx       ← new investors filtered view
      Analytics.tsx         ← charts and insights
      Root.tsx              ← layout, sidebar, global drawer/palette
      Settings.tsx          ← startup profile editor
    components/
      InvestorDetailDrawer.tsx   ← 3-tab investor drawer (global)
      CompareDrawer.tsx          ← side-by-side comparison modal
      CommandPalette.tsx         ← Cmd+K search palette
    context/
      InvestorContext.tsx    ← investors, CRM, saved, outreach notes, selectedInvestorId
      AuthContext.tsx        ← user, profile, updateProfile
    data/
      investors.ts           ← 30 investor records + SECTORS/STAGES/GEOGRAPHIES constants
    utils/
      matchScore.ts          ← computeMatchScore(investor, profile) → 0–100
```

---

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** — dev server and bundler
- **React Router v7** — client-side routing
- **TailwindCSS** — utility-first styling
- **Recharts** — charts in Analytics
- **Sonner** — toast notifications
- **Lucide React** — icons
