# Kurot — Smart Envelope Budgeting

### _Set aside a little for every need._

A full-featured personal finance app built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, and **Zustand**. Offline-first with localStorage. Mobile-first UI with responsive desktop layout, dark mode, and Capacitor-ready for iOS/Android.

---

## Features

### 💰 Envelope Budgeting

- Create envelopes with budget limits per category
- Log expenses per envelope with descriptions and dates
- Progress bars, remaining amounts, and over-budget alerts

### 📊 Spending Breakdown

- Doughnut chart showing spending by envelope
- Budget vs Spent bars per envelope
- Monthly income and savings rate summary

### 🎯 Goals & Planning

- Create savings goals with targets, dates, and notes
- Track contributions with amounts and notes
- Animated progress rings with schedule comparison
- Smart nudges when goals fall behind

### 🔁 Budgets & Recurring

- Set category spending limits with custom alert thresholds
- Create recurring income/expense entries (daily/weekly/monthly/yearly)
- Toggle recurring entries on/off
- Due-date alerts for upcoming recurring items

### 💳 Debt & Receivables

- Track money you owe (debts) and money owed to you (receivables)
- Record payments and collections with notes and dates
- Due date warnings, overdue flags, animated progress rings

### 🔔 Smart Nudges

- Budget tight alerts (configurable threshold per category)
- Goal behind schedule alerts
- Debt due soon warnings
- Recurring entry due reminders
- All dismissable and auto-generated

### 👋 Personalized Greeting

- Time-aware greeting (Good morning / afternoon / evening)
- First-name personalization via Settings

### 📤 Export & Import (CSV)

- **Export** any section or a full backup as a `.csv` file
  - Full Backup — everything in one file (recommended)
  - Transactions, Envelopes, Goals, Debt & Receivables, Recurring — individually
- **Import** from any Kurot backup CSV
  - **Merge mode** — adds imported data alongside existing data, skips duplicates
  - **Replace mode** — overwrites all data with the imported file (with confirmation)
- UTF-8 with BOM for Excel compatibility
- Works as a full device-to-device migration tool

---

## Tech Stack

| Tool                       | Purpose                               |
| -------------------------- | ------------------------------------- |
| Next.js 14                 | Framework (App Router, static export) |
| TypeScript                 | Type safety throughout                |
| Tailwind CSS               | Utility-first styling                 |
| Zustand + persist          | State management + localStorage       |
| Chart.js + react-chartjs-2 | Doughnut charts                       |
| date-fns                   | Date calculations                     |
| lucide-react               | Icons                                 |
| Capacitor (optional)       | Native iOS/Android wrapper            |

---

## Getting Started

### Prerequisites

- Node.js 18+

### Install & Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

### Build for Production

```bash
npm run build
# Output in /out folder — ready for static hosting or Capacitor
```

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx            # Home — Envelopes & Budget
│   ├── breakdown/          # Spending charts
│   ├── goals/              # Goals & planning
│   ├── debt/               # Debt & receivables
│   ├── history/            # Monthly snapshots
│   ├── settings/           # Profile, budgets, recurring, nudges, data portability
│   ├── layout.tsx          # Root layout
│   ├── not-found.tsx       # 404 page
│   └── globals.css         # Global styles + Tailwind
├── components/
│   ├── AppShell.tsx        # Status bar + bottom nav wrapper
│   ├── DataPortability.tsx # Export & Import CSV UI
│   ├── HeroCard.tsx        # Shared dark green hero header
│   ├── Modal.tsx           # Reusable bottom-sheet modal
│   └── ProgressRing.tsx    # Animated SVG progress ring
├── hooks/
│   └── index.ts            # useLocalStorage, useDebounce, useGreeting, useClock
├── lib/
│   ├── csv.ts              # CSV export/import logic (zero dependencies)
│   └── utils.ts            # formatCurrency, pctOf, daysUntil, formatDate, getGreeting
└── store/
    └── index.ts            # Zustand store — all state, actions, and nudge generation
```

---

## Data Backup & Migration

All data lives in `localStorage` under the key `kurot_v2`. To move data between devices or keep a backup:

1. Go to **Settings → Export & Import Data**
2. Tap **Full Backup** to download `kurot-backup-YYYY-MM-DD.csv`
3. On the new device, tap **Choose CSV file to import** and select the backup
4. Choose **Merge** to add data alongside existing entries, or **Replace** to overwrite everything

The CSV format uses `## SECTION_NAME` headers so it's human-readable and editable in Excel or Google Sheets.

---

## Mobile App (Capacitor)

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npm run build
npx cap init "Kurot" "com.kurot.budget" --web-dir out
npx cap add android   # then: npx cap open android
npx cap add ios       # then: npx cap open ios (Mac only)
```

---

## Known Issues & Fixes

### Hydration mismatch

Next.js SSR renders pages on the server before the browser loads. Any code that reads `new Date()` or browser APIs (`localStorage`, `FileReader`, `URL`) directly during render will cause a hydration mismatch. Fixed by:

- `DataPortability` — loaded with `dynamic(..., { ssr: false })` since it uses `FileReader` and `URL.createObjectURL`
- Clock display in `AppShell` — initialized as `''` and set in `useEffect`, with `suppressHydrationWarning`
- Greeting and month in home page — set in `useEffect` after mount, with `suppressHydrationWarning`

---

## Brand

### Primary Colors

| Token       | Hex       | Use                                          |
| ----------- | --------- | -------------------------------------------- |
| Teal        | `#259583` | Primary brand, buttons, active states, nav   |
| Bright Teal | `#40FFE1` | Coin icon, accents, nudge badges, highlights |
| Light Teal  | `#C0FFF5` | Backgrounds, hover states, success states    |

### Secondary Colors

| Token     | Hex       | Use                                    |
| --------- | --------- | -------------------------------------- |
| Dark      | `#011412` | Sidebar, hero cards, headings on light |
| Muted     | `#415353` | Secondary text, muted labels           |
| Gray      | `#8EA2A2` | Placeholder text, hints                |
| Off-White | `#F1F3F3` | Page backgrounds, input fields         |
| White     | `#FFFFFF` | Card surfaces                          |

### Dark Mode

| Token      | Hex       | Use                         |
| ---------- | --------- | --------------------------- |
| Background | `#011412` | Page body, sidebar          |
| Surface    | `#0d1f1d` | Cards, modals, dropdowns    |
| Muted      | `#415353` | Secondary text in dark mode |

Font pairing: **Playfair Display** (headings) + **Plus Jakarta Sans** (body)

---

## About the Name

> **Kurot** is inspired by the traditional Filipino budgeting habit of _magkurot ng pera_ — the practice of pinching off small portions of money and setting them aside for specific needs. The app brings this cultural wisdom into the digital age through a smart envelope budgeting system, helping users everywhere allocate, track, and manage their money more intentionally.

_"Set aside a little for every need."_

---

_Kurot v1.2 — Inspired by the Filipino tradition of magkurot ng pera 🇵🇭_
