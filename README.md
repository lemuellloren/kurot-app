# Kurot — Smart Envelope Budgeting
### *Set aside a little for every need.*

A full-featured personal finance app built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and **Zustand**. Offline-first with localStorage. Mobile-first UI, ready for Capacitor.

---

## Features

### 💰 Envelope Budgeting
- Create envelopes with budget limits per category
- Log expenses per envelope with descriptions and dates
- Progress bars, remaining amounts, over-budget alerts

### 📊 Spending Breakdown
- Doughnut chart showing spending by envelope
- Budget vs Spent bars per envelope
- Monthly income summary

### 🎯 Goals & Planning
- Create savings goals with targets, dates, and notes
- Track contributions with amounts and notes
- Progress tracking with schedule comparison
- Smart nudges when goals fall behind

### 🔁 Budgets & Recurring
- Set category spending limits with custom alert thresholds
- Create recurring income/expense entries (daily/weekly/monthly/yearly)
- Toggle recurring entries on/off
- Due-date alerts for upcoming recurring items

### 💳 Debt & Receivables
- Track money you owe (debts)
- Track money owed to you (receivables)
- Record payments and collections with notes
- Due date warnings, overdue flags, progress bars

### 🔔 Smart Nudges
- Budget tight alerts (configurable threshold per category)
- Goal behind schedule alerts
- Debt due soon warnings
- Recurring entry due reminders
- All dismissable, auto-generated

### 👋 Personalized Greeting
- Time-aware greeting (Good morning/afternoon/evening)
- First-name personalization via Settings

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| Next.js 14 | Framework (App Router, static export) |
| TypeScript | Type safety throughout |
| Tailwind CSS | Utility-first styling |
| Zustand + persist | State management + localStorage |
| Chart.js + react-chartjs-2 | Doughnut charts |
| date-fns | Date calculations |
| lucide-react | Icons |
| Capacitor (optional) | Native iOS/Android wrapper |

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
│   ├── page.tsx          # Home — Envelopes & Budget
│   ├── breakdown/        # Spending charts
│   ├── goals/            # Goals & planning
│   ├── debt/             # Debt & receivables
│   ├── history/          # Monthly snapshots
│   ├── settings/         # Profile, budgets, recurring, nudges
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles + Tailwind
├── components/
│   └── AppShell.tsx      # Status bar + bottom nav wrapper
└── store/
    └── index.ts          # Zustand store with all state & actions
```

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

## Brand

| Color | Hex | Use |
|-------|-----|-----|
| Forest Green | `#1a5c38` | Primary brand |
| Deep Green | `#0a2918` | Dark elements |
| Leaf Green | `#1f7044` | Success, progress |
| Mint | `#4ade80` | Accents, highlights |
| Gold | `#e8b420` | Coin icon, alerts |

Font pairing: **Playfair Display** (headings) + **Plus Jakarta Sans** (body)

---

## Data

All data is stored in `localStorage` under the key `kurot_v2`. No accounts, no servers, no tracking. Your data stays on your device.

---

*Kurot v1.0 — Inspired by the Filipino tradition of magkurot ng pera 🇵🇭*
