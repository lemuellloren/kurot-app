'use client'
import { useRef, useState } from 'react'
import { useKurotStore } from '@/store'
import { exportCSV, parseImportCSV, type ImportResult, type ExportSection } from '@/lib/csv'
import { Download, Upload, FileText, AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import clsx from 'clsx'

const EXPORT_OPTIONS: { key: ExportSection; label: string; desc: string }[] = [
  { key: 'all',          label: 'Full Backup',     desc: 'Everything — envelopes, goals, debt, recurring, history' },
  { key: 'transactions', label: 'Transactions',    desc: 'All expenses logged per envelope' },
  { key: 'envelopes',    label: 'Envelopes',       desc: 'Envelope names, categories and budgets' },
  { key: 'goals',        label: 'Goals',           desc: 'Savings goals and contributions' },
  { key: 'debt',         label: 'Debt & Receivables', desc: 'Debts owed and receivables' },
  { key: 'recurring',    label: 'Recurring',       desc: 'Recurring income and expense entries' },
]

export default function DataPortability() {
  const store                                   = useKurotStore()
  const fileRef                                 = useRef<HTMLInputElement>(null)
  const [expanded,    setExpanded]              = useState(false)
  const [importMode,  setImportMode]            = useState<'merge' | 'replace'>('merge')
  const [importing,   setImporting]             = useState(false)
  const [importResult, setImportResult]         = useState<ImportResult | null>(null)
  const [showConfirm, setShowConfirm]           = useState(false)
  const [pendingData, setPendingData]           = useState<any>(null)

  // ── Export ───────────────────────────────────────────────────────────────
  const handleExport = (section: ExportSection) => {
    exportCSV(store as any, section)
  }

  // ── Import: file picked ──────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.csv')) {
      setImportResult({ success: false, message: 'Please select a .csv file.', counts: { envelopes: 0, transactions: 0, goals: 0, debts: 0, recurring: 0 }, errors: [] })
      return
    }

    setImporting(true)
    setImportResult(null)

    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      try {
        const { result, data } = parseImportCSV(text, importMode)
        if (result.success) {
          setPendingData(data)
          setImportResult(result)
          if (importMode === 'replace') {
            setShowConfirm(true)
          } else {
            applyImport(data, result)
          }
        } else {
          setImportResult(result)
        }
      } catch (err) {
        setImportResult({
          success: false,
          message: 'Failed to parse CSV file. Make sure it is a valid Kurot backup.',
          counts: { envelopes: 0, transactions: 0, goals: 0, debts: 0, recurring: 0 },
          errors: [String(err)],
        })
      }
      setImporting(false)
      // Reset file input so the same file can be re-selected
      if (fileRef.current) fileRef.current.value = ''
    }
    reader.readAsText(file, 'UTF-8')
  }

  // ── Apply data to store ──────────────────────────────────────────────────
  const applyImport = (data: any, result: ImportResult) => {
    if (importMode === 'replace') {
      // Replace: overwrite all state
      if (data.userName)          store.setUserName(data.userName)
      if (data.income)            store.setIncome(data.income)
      if (data.currency)          store.setCurrency(data.currency)

      // Clear then add envelopes
      ;[...store.envelopes].forEach(e => store.removeEnvelope(e.id))
      data.envelopes?.forEach((e: any) => {
        store.addEnvelope({ name: e.name, cat: e.cat, budget: e.budget })
        // addEnvelope creates a new id; we need to patch txns manually via a direct store update
      })
      // Patch transactions by rebuilding store state directly — use zustand's setState
      useKurotStore.setState(s => ({
        envelopes: data.envelopes ?? s.envelopes,
        goals: data.goals ?? s.goals,
        debts: data.debts ?? s.debts,
        recurringEntries: data.recurringEntries ?? s.recurringEntries,
      }))
    } else {
      // Merge: add new items without removing existing ones
      data.envelopes?.forEach((e: any) => {
        // Only add if envelope name doesn't already exist
        const exists = store.envelopes.some(ex => ex.name.toLowerCase() === e.name.toLowerCase())
        if (!exists) {
          useKurotStore.setState(s => ({ envelopes: [...s.envelopes, e] }))
        }
      })

      data.goals?.forEach((g: any) => {
        const exists = store.goals.some(ex => ex.name.toLowerCase() === g.name.toLowerCase())
        if (!exists) useKurotStore.setState(s => ({ goals: [...s.goals, g] }))
      })

      data.debts?.forEach((d: any) => {
        const exists = store.debts.some(ex => ex.name.toLowerCase() === d.name.toLowerCase() && ex.type === d.type)
        if (!exists) useKurotStore.setState(s => ({ debts: [...s.debts, d] }))
      })

      data.recurringEntries?.forEach((r: any) => {
        const exists = store.recurringEntries.some(ex => ex.name.toLowerCase() === r.name.toLowerCase())
        if (!exists) useKurotStore.setState(s => ({ recurringEntries: [...s.recurringEntries, r] }))
      })
    }

    setImportResult({ ...result, message: `✓ ${result.message}` })
    setShowConfirm(false)
    setPendingData(null)
  }

  return (
    <div className="card overflow-hidden">
      {/* Header toggle */}
      <button
        className="w-full flex items-center justify-between p-4 text-left"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
            <FileText size={16} className="text-green-800" />
          </div>
          <div>
            <p className="text-sm font-bold text-green-900">Export & Import Data</p>
            <p className="text-xs text-green-700/50 mt-0.5">Backup your data as CSV or restore from a file</p>
          </div>
        </div>
        {expanded
          ? <ChevronUp size={16} className="text-green-700/40 flex-shrink-0" />
          : <ChevronDown size={16} className="text-green-700/40 flex-shrink-0" />
        }
      </button>

      {expanded && (
        <div className="border-t border-green-800/10 p-4 space-y-5">

          {/* ── EXPORT ── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Download size={14} className="text-green-700" />
              <p className="text-xs font-bold text-green-900 uppercase tracking-wide">Export</p>
            </div>
            <div className="space-y-2">
              {EXPORT_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => handleExport(opt.key)}
                  className={clsx(
                    'w-full flex items-center justify-between px-3.5 py-3 rounded-2xl border transition-all text-left',
                    opt.key === 'all'
                      ? 'bg-green-800 border-green-800 text-white'
                      : 'bg-green-50 border-green-800/10 text-green-900 hover:border-green-800/25'
                  )}
                >
                  <div>
                    <p className={clsx('text-sm font-semibold', opt.key === 'all' ? 'text-white' : 'text-green-900')}>
                      {opt.label}
                      {opt.key === 'all' && <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(232,180,32,0.25)', color: '#fde68a' }}>Recommended</span>}
                    </p>
                    <p className={clsx('text-xs mt-0.5', opt.key === 'all' ? 'text-white/60' : 'text-green-700/50')}>{opt.desc}</p>
                  </div>
                  <Download size={14} className={opt.key === 'all' ? 'text-white/70 flex-shrink-0' : 'text-green-700/40 flex-shrink-0'} />
                </button>
              ))}
            </div>
          </div>

          {/* ── IMPORT ── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Upload size={14} className="text-green-700" />
              <p className="text-xs font-bold text-green-900 uppercase tracking-wide">Import</p>
            </div>

            {/* Mode selector */}
            <div className="flex gap-2 mb-3">
              {(['merge', 'replace'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setImportMode(m)}
                  className={clsx(
                    'flex-1 py-2 text-xs font-bold rounded-xl border transition-all capitalize',
                    importMode === m
                      ? 'bg-green-800 text-white border-green-800'
                      : 'border-green-800/15 text-green-700/70'
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
            <p className="text-xs text-green-700/50 mb-3 leading-relaxed">
              {importMode === 'merge'
                ? '✅ Merge: adds imported data alongside existing data. Skips duplicates by name.'
                : '⚠️ Replace: overwrites all existing data with the imported file. This cannot be undone.'
              }
            </p>

            {/* File picker */}
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={importing}
              className={clsx(
                'w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed transition-all text-sm font-semibold',
                importing
                  ? 'border-green-800/20 text-green-700/40 cursor-not-allowed'
                  : 'border-green-800/20 text-green-800 hover:border-green-800/40 hover:bg-green-50 active:bg-green-100'
              )}
            >
              <Upload size={16} />
              {importing ? 'Reading file…' : 'Choose CSV file to import'}
            </button>

            {/* Result banner */}
            {importResult && (
              <div className={clsx(
                'mt-3 rounded-2xl p-3.5 flex items-start gap-3',
                importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              )}>
                {importResult.success
                  ? <CheckCircle size={16} className="text-green-700 flex-shrink-0 mt-0.5" />
                  : <XCircle    size={16} className="text-red-500   flex-shrink-0 mt-0.5" />
                }
                <div className="flex-1 min-w-0">
                  <p className={clsx('text-xs font-semibold', importResult.success ? 'text-green-800' : 'text-red-700')}>
                    {importResult.message}
                  </p>
                  {importResult.success && (
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
                      {[
                        ['Envelopes',    importResult.counts.envelopes],
                        ['Transactions', importResult.counts.transactions],
                        ['Goals',        importResult.counts.goals],
                        ['Debts',        importResult.counts.debts],
                        ['Recurring',    importResult.counts.recurring],
                      ].filter(([, n]) => (n as number) > 0).map(([label, n]) => (
                        <span key={label as string} className="text-[11px] text-green-700/70 font-medium">
                          {n} {label}
                        </span>
                      ))}
                    </div>
                  )}
                  {importResult.errors.length > 0 && (
                    <div className="mt-2 space-y-0.5">
                      {importResult.errors.slice(0, 5).map((e, i) => (
                        <p key={i} className="text-[11px] text-red-600">{e}</p>
                      ))}
                      {importResult.errors.length > 5 && (
                        <p className="text-[11px] text-red-500">+{importResult.errors.length - 5} more errors</p>
                      )}
                    </div>
                  )}
                </div>
                <button onClick={() => setImportResult(null)} className="flex-shrink-0">
                  <XCircle size={14} className="text-green-700/30" />
                </button>
              </div>
            )}
          </div>

          {/* Tip */}
          <div className="bg-green-50 rounded-2xl px-3.5 py-3 flex items-start gap-2.5">
            <AlertTriangle size={14} className="text-green-700/50 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-green-700/60 leading-relaxed">
              Export a <strong>Full Backup</strong> before switching devices or clearing your browser. Import the same file on any device to restore your data.
            </p>
          </div>
        </div>
      )}

      {/* Replace confirmation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-[28px] w-full max-w-[430px] p-5">
            <div className="w-9 h-1 bg-green-800/20 rounded-full mx-auto mb-4" />
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={18} className="text-red-500" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-green-900">Replace all data?</p>
                <p className="text-xs text-green-700/50 mt-0.5">This will overwrite everything in your app</p>
              </div>
            </div>
            <p className="text-sm text-green-700/70 mb-1 leading-relaxed">
              You are about to replace all current data with the imported file. This action <strong>cannot be undone</strong>.
            </p>
            {importResult && (
              <p className="text-xs text-green-700/50 mb-4">
                Will import: {importResult.counts.envelopes} envelopes · {importResult.counts.goals} goals · {importResult.counts.debts} debts · {importResult.counts.recurring} recurring
              </p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => { setShowConfirm(false); setPendingData(null); setImportResult(null) }}
                className="flex-1 h-12 text-sm border border-green-800/20 rounded-2xl text-green-700/70 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => pendingData && importResult && applyImport(pendingData, importResult)}
                className="flex-1 h-12 text-sm font-bold bg-red-500 text-white rounded-2xl"
              >
                Yes, replace all
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
