import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Category =
  | 'Housing'
  | 'Food'
  | 'Transport'
  | 'Health'
  | 'Savings'
  | 'Entertainment'
  | 'Utilities'
  | 'Other';

export interface Transaction {
  id: string;
  name: string;
  amt: number;
  date: string;
  recurring?: boolean;
}

export interface Envelope {
  id: string;
  name: string;
  cat: Category;
  budget: number;
  txns: Transaction[];
}

export interface RecurringEntry {
  id: string;
  name: string;
  amount: number;
  type: 'income' | 'expense';
  category: Category;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextDue: string;
  envelopeId?: string;
  active: boolean;
}

export interface CategoryBudget {
  category: Category;
  limit: number;
  alertAt: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  targetDate: string;
  notes: string;
  color: string;
  contributions: { id: string; amount: number; date: string; note: string }[];
}

export interface Debt {
  id: string;
  type: 'owe' | 'owed';
  name: string;
  description: string;
  totalAmount: number;
  remainingAmount: number;
  dueDate: string;
  notes: string;
  payments: { id: string; amount: number; date: string; note: string }[];
  status: 'active' | 'settled';
}

export interface MonthSnapshot {
  month: string;
  income: number;
  snapshots: { name: string; cat: Category; budget: number; spent: number }[];
}

export interface Nudge {
  id: string;
  type:
    | 'budget_tight'
    | 'due_soon'
    | 'goal_behind'
    | 'debt_due'
    | 'recurring_due';
  message: string;
  severity: 'info' | 'warning' | 'danger';
  date: string;
  read: boolean;
}

export interface KurotState {
  userName: string;
  income: number;
  currency: string;
  theme: 'light' | 'dark' | 'system';
  envelopes: Envelope[];
  categoryBudgets: CategoryBudget[];
  recurringEntries: RecurringEntry[];
  goals: Goal[];
  debts: Debt[];
  history: MonthSnapshot[];
  nudges: Nudge[];
  expandedEnvelopeId: string | null;
  nextId: number;

  setUserName: (name: string) => void;
  setIncome: (n: number) => void;
  setCurrency: (c: string) => void;
  setTheme: (t: 'light' | 'dark' | 'system') => void;

  addEnvelope: (e: Omit<Envelope, 'id' | 'txns'>) => void;
  removeEnvelope: (id: string) => void;
  setExpandedEnvelope: (id: string | null) => void;
  addTransaction: (envelopeId: string, txn: Omit<Transaction, 'id'>) => void;
  removeTransaction: (envelopeId: string, txnId: string) => void;

  setCategoryBudget: (cat: Category, limit: number, alertAt: number) => void;
  removeCategoryBudget: (cat: Category) => void;

  addRecurring: (r: Omit<RecurringEntry, 'id'>) => void;
  updateRecurring: (id: string, r: Partial<RecurringEntry>) => void;
  removeRecurring: (id: string) => void;
  toggleRecurring: (id: string) => void;

  addGoal: (g: Omit<Goal, 'id' | 'contributions' | 'currentAmount'>) => void;
  contributeToGoal: (goalId: string, amount: number, note: string) => void;
  removeGoal: (id: string) => void;

  addDebt: (
    d: Omit<Debt, 'id' | 'payments' | 'remainingAmount' | 'status'>,
  ) => void;
  payDebt: (debtId: string, amount: number, note: string) => void;
  removeDebt: (id: string) => void;

  saveSnapshot: () => void;
  generateNudges: () => void;
  markNudgeRead: (id: string) => void;
  clearReadNudges: () => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);

const today = () => new Date().toISOString().split('T')[0];

const DEFAULT_ENVELOPES: Envelope[] = [
  {
    id: 'e1',
    name: 'Rent',
    cat: 'Housing',
    budget: 15000,
    txns: [{ id: 't1', name: 'May rent', amt: 15000, date: today() }],
  },
  {
    id: 'e2',
    name: 'Groceries',
    cat: 'Food',
    budget: 6000,
    txns: [
      { id: 't2', name: 'SM Supermarket', amt: 1850, date: today() },
      { id: 't3', name: 'Market', amt: 920, date: today() },
    ],
  },
  {
    id: 'e3',
    name: 'Transport',
    cat: 'Transport',
    budget: 3500,
    txns: [
      { id: 't4', name: 'Gas', amt: 1200, date: today() },
      { id: 't5', name: 'Grab', amt: 450, date: today() },
    ],
  },
  { id: 'e4', name: 'Savings', cat: 'Savings', budget: 8000, txns: [] },
  {
    id: 'e5',
    name: 'Entertainment',
    cat: 'Entertainment',
    budget: 2500,
    txns: [
      { id: 't6', name: 'Netflix', amt: 549, date: today() },
      { id: 't7', name: 'Dinner out', amt: 1200, date: today() },
    ],
  },
];

export const useKurotStore = create<KurotState>()(
  persist(
    (set, get) => ({
      userName: '',
      income: 45000,
      currency: '₱',
      theme: 'system' as const,
      envelopes: DEFAULT_ENVELOPES,
      categoryBudgets: [
        { category: 'Food', limit: 8000, alertAt: 80 },
        { category: 'Entertainment', limit: 3000, alertAt: 75 },
      ],
      recurringEntries: [
        {
          id: 'r1',
          name: 'Monthly Salary',
          amount: 45000,
          type: 'income',
          category: 'Other',
          frequency: 'monthly',
          nextDue: today(),
          active: true,
        },
        {
          id: 'r2',
          name: 'Netflix',
          amount: 549,
          type: 'expense',
          category: 'Entertainment',
          frequency: 'monthly',
          nextDue: today(),
          envelopeId: 'e5',
          active: true,
        },
      ],
      goals: [
        {
          id: 'g1',
          name: 'Emergency Fund',
          targetAmount: 100000,
          currentAmount: 32000,
          startDate: '2026-01-01',
          targetDate: '2026-12-31',
          notes: '3 months of expenses',
          color: '#1a6127',
          contributions: [
            {
              id: 'gc1',
              amount: 32000,
              date: '2026-01-15',
              note: 'Initial deposit',
            },
          ],
        },
        {
          id: 'g2',
          name: 'Vacation Fund',
          targetAmount: 50000,
          currentAmount: 12500,
          startDate: '2026-01-01',
          targetDate: '2026-08-01',
          notes: 'Boracay trip',
          color: '#185FA5',
          contributions: [
            {
              id: 'gc2',
              amount: 12500,
              date: '2026-02-01',
              note: 'Monthly kurot',
            },
          ],
        },
      ],
      debts: [
        {
          id: 'd1',
          type: 'owe',
          name: 'BDO Personal Loan',
          description: 'Home improvement loan',
          totalAmount: 120000,
          remainingAmount: 85000,
          dueDate: '2027-06-01',
          notes: 'Monthly payment ₱ 5,000',
          payments: [
            {
              id: 'dp1',
              amount: 35000,
              date: '2026-01-01',
              note: 'Payments Jan–Jul',
            },
          ],
          status: 'active',
        },
        {
          id: 'd2',
          type: 'owed',
          name: 'Paolo Santos',
          description: 'Borrowed money for laptop',
          totalAmount: 15000,
          remainingAmount: 8000,
          dueDate: '2026-07-01',
          notes: 'Paying monthly',
          payments: [
            {
              id: 'dp2',
              amount: 7000,
              date: '2026-02-01',
              note: 'First payment',
            },
          ],
          status: 'active',
        },
      ],
      history: [
        {
          month: 'February 2026',
          income: 45000,
          snapshots: [
            { name: 'Rent', cat: 'Housing', budget: 15000, spent: 15000 },
            { name: 'Groceries', cat: 'Food', budget: 6000, spent: 5200 },
            { name: 'Transport', cat: 'Transport', budget: 3500, spent: 2800 },
            { name: 'Savings', cat: 'Savings', budget: 8000, spent: 8000 },
            {
              name: 'Entertainment',
              cat: 'Entertainment',
              budget: 2500,
              spent: 1800,
            },
          ],
        },
        {
          month: 'January 2026',
          income: 45000,
          snapshots: [
            { name: 'Rent', cat: 'Housing', budget: 15000, spent: 15000 },
            { name: 'Groceries', cat: 'Food', budget: 6000, spent: 4900 },
            { name: 'Transport', cat: 'Transport', budget: 3500, spent: 3100 },
            { name: 'Savings', cat: 'Savings', budget: 8000, spent: 8000 },
            {
              name: 'Entertainment',
              cat: 'Entertainment',
              budget: 2500,
              spent: 2100,
            },
          ],
        },
      ],
      nudges: [],
      expandedEnvelopeId: null,
      nextId: 100,

      setUserName: (name) => set({ userName: name }),
      setIncome: (income) => set({ income }),
      setCurrency: (currency) => set({ currency }),
      setTheme: (theme) => set({ theme }),

      addEnvelope: (e) =>
        set((s) => ({
          envelopes: [...s.envelopes, { ...e, id: uid(), txns: [] }],
        })),
      removeEnvelope: (id) =>
        set((s) => ({ envelopes: s.envelopes.filter((e) => e.id !== id) })),
      setExpandedEnvelope: (id) => set({ expandedEnvelopeId: id }),
      addTransaction: (envelopeId, txn) =>
        set((s) => ({
          envelopes: s.envelopes.map((e) =>
            e.id === envelopeId
              ? { ...e, txns: [...e.txns, { ...txn, id: uid() }] }
              : e,
          ),
        })),
      removeTransaction: (envelopeId, txnId) =>
        set((s) => ({
          envelopes: s.envelopes.map((e) =>
            e.id === envelopeId
              ? { ...e, txns: e.txns.filter((t) => t.id !== txnId) }
              : e,
          ),
        })),

      setCategoryBudget: (category, limit, alertAt) =>
        set((s) => {
          const existing = s.categoryBudgets.find(
            (b) => b.category === category,
          );
          if (existing)
            return {
              categoryBudgets: s.categoryBudgets.map((b) =>
                b.category === category ? { category, limit, alertAt } : b,
              ),
            };
          return {
            categoryBudgets: [
              ...s.categoryBudgets,
              { category, limit, alertAt },
            ],
          };
        }),
      removeCategoryBudget: (cat) =>
        set((s) => ({
          categoryBudgets: s.categoryBudgets.filter((b) => b.category !== cat),
        })),

      addRecurring: (r) =>
        set((s) => ({
          recurringEntries: [...s.recurringEntries, { ...r, id: uid() }],
        })),
      updateRecurring: (id, r) =>
        set((s) => ({
          recurringEntries: s.recurringEntries.map((e) =>
            e.id === id ? { ...e, ...r } : e,
          ),
        })),
      removeRecurring: (id) =>
        set((s) => ({
          recurringEntries: s.recurringEntries.filter((e) => e.id !== id),
        })),
      toggleRecurring: (id) =>
        set((s) => ({
          recurringEntries: s.recurringEntries.map((e) =>
            e.id === id ? { ...e, active: !e.active } : e,
          ),
        })),

      addGoal: (g) =>
        set((s) => ({
          goals: [
            ...s.goals,
            { ...g, id: uid(), currentAmount: 0, contributions: [] },
          ],
        })),
      contributeToGoal: (goalId, amount, note) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === goalId
              ? {
                  ...g,
                  currentAmount: g.currentAmount + amount,
                  contributions: [
                    ...g.contributions,
                    { id: uid(), amount, date: today(), note },
                  ],
                }
              : g,
          ),
        })),
      removeGoal: (id) =>
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      addDebt: (d) =>
        set((s) => ({
          debts: [
            ...s.debts,
            {
              ...d,
              id: uid(),
              payments: [],
              remainingAmount: d.totalAmount,
              status: 'active',
            },
          ],
        })),
      payDebt: (debtId, amount, note) =>
        set((s) => ({
          debts: s.debts.map((d) => {
            if (d.id !== debtId) return d;
            const remaining = Math.max(0, d.remainingAmount - amount);
            return {
              ...d,
              remainingAmount: remaining,
              status: remaining === 0 ? 'settled' : 'active',
              payments: [
                ...d.payments,
                { id: uid(), amount, date: today(), note },
              ],
            };
          }),
        })),
      removeDebt: (id) =>
        set((s) => ({ debts: s.debts.filter((d) => d.id !== id) })),

      saveSnapshot: () => {
        const s = get();
        const now = new Date();
        const months = [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ];
        const month = `${months[now.getMonth()]} ${now.getFullYear()}`;
        const snapshot: MonthSnapshot = {
          month,
          income: s.income,
          snapshots: s.envelopes.map((e) => ({
            name: e.name,
            cat: e.cat,
            budget: e.budget,
            spent: e.txns.reduce((a, t) => a + t.amt, 0),
          })),
        };
        set({
          history: [snapshot, ...s.history],
          envelopes: s.envelopes.map((e) => ({ ...e, txns: [] })),
        });
      },

      generateNudges: () => {
        const s = get();
        const newNudges: Nudge[] = [];
        const now = new Date();
        const todayStr = today();

        s.envelopes.forEach((env) => {
          const spent = env.txns.reduce((a, t) => a + t.amt, 0);
          const pct = (spent / env.budget) * 100;
          const catBudget = s.categoryBudgets.find(
            (b) => b.category === env.cat,
          );
          const alertAt = catBudget?.alertAt ?? 80;
          if (pct >= alertAt && pct < 100) {
            newNudges.push({
              id: uid(),
              type: 'budget_tight',
              message: `${env.name} is at ${Math.round(pct)}% of budget. ${s.currency} ${Math.round(env.budget - spent).toLocaleString()} remaining.`,
              severity: 'warning',
              date: todayStr,
              read: false,
            });
          }
          if (pct >= 100) {
            newNudges.push({
              id: uid(),
              type: 'budget_tight',
              message: `${env.name} is over budget by ${s.currency} ${Math.round(spent - env.budget).toLocaleString()}!`,
              severity: 'danger',
              date: todayStr,
              read: false,
            });
          }
        });

        s.debts
          .filter((d) => d.status === 'active')
          .forEach((d) => {
            const due = new Date(d.dueDate);
            const daysLeft = Math.ceil(
              (due.getTime() - now.getTime()) / 86400000,
            );
            if (daysLeft <= 30 && daysLeft >= 0) {
              newNudges.push({
                id: uid(),
                type: 'debt_due',
                message: `${d.name} payment due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}. ${s.currency} ${d.remainingAmount.toLocaleString()} remaining.`,
                severity: daysLeft <= 7 ? 'danger' : 'warning',
                date: todayStr,
                read: false,
              });
            }
          });

        s.goals.forEach((g) => {
          const pct = (g.currentAmount / g.targetAmount) * 100;
          const due = new Date(g.targetDate);
          const daysLeft = Math.ceil(
            (due.getTime() - now.getTime()) / 86400000,
          );
          const totalDays = Math.ceil(
            (due.getTime() - new Date(g.startDate).getTime()) / 86400000,
          );
          const expectedPct = ((totalDays - daysLeft) / totalDays) * 100;
          if (pct < expectedPct - 10 && daysLeft > 0) {
            newNudges.push({
              id: uid(),
              type: 'goal_behind',
              message: `"${g.name}" is behind schedule. You're at ${Math.round(pct)}% but should be at ${Math.round(expectedPct)}%.`,
              severity: 'info',
              date: todayStr,
              read: false,
            });
          }
        });

        s.recurringEntries
          .filter((r) => r.active)
          .forEach((r) => {
            const due = new Date(r.nextDue);
            const daysLeft = Math.ceil(
              (due.getTime() - now.getTime()) / 86400000,
            );
            if (daysLeft <= 3 && daysLeft >= 0) {
              newNudges.push({
                id: uid(),
                type: 'recurring_due',
                message: `Recurring ${r.type === 'income' ? 'income' : 'expense'} "${r.name}" is due ${daysLeft === 0 ? 'today' : `in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`}.`,
                severity: 'info',
                date: todayStr,
                read: false,
              });
            }
          });

        set({
          nudges: [...newNudges, ...s.nudges.filter((n) => !n.read)].slice(
            0,
            20,
          ),
        });
      },

      markNudgeRead: (id) =>
        set((s) => ({
          nudges: s.nudges.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),
      clearReadNudges: () =>
        set((s) => ({ nudges: s.nudges.filter((n) => !n.read) })),
    }),
    { name: 'kurot_v2' },
  ),
);

export const CAT_COLORS: Record<string, string> = {
  Housing: '#185FA5',
  Food: '#1a6127',
  Transport: '#854F0B',
  Health: '#993556',
  Savings: '#1d9c33',
  Entertainment: '#993C1D',
  Utilities: '#534AB7',
  Other: '#5F5E5A',
};

export const CAT_ICONS: Record<string, string> = {
  Housing: '🏠',
  Food: '🛒',
  Transport: '🚗',
  Health: '💊',
  Savings: '🏦',
  Entertainment: '🎬',
  Utilities: '⚡',
  Other: '📦',
};

export const CATEGORIES: Category[] = [
  'Housing',
  'Food',
  'Transport',
  'Health',
  'Savings',
  'Entertainment',
  'Utilities',
  'Other',
];

export const fp = (n: number, currency = '₱') =>
  `${currency} ${Math.round(n).toLocaleString()}`;
