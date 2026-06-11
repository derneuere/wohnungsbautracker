import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import { getStats, upsertStat } from '../../server/stats'
import { fmt } from '../../lib/design-data'
import { BLUE, CYAN, display } from '../../lib/campaign'

export const Route = createFileRoute('/admin/stats')({
  component: StatsAdmin,
})

const cellInput =
  'w-24 border-2 border-black/10 bg-white px-2 py-1 text-sm font-medium focus:border-[#1CB5E5] focus:outline-none'

function StatsAdmin() {
  const [stats, setStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<any | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await getStats()
    setStats(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleSave = async () => {
    if (editing) {
      await upsertStat({ data: editing })
      setEditing(null)
      load()
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-black/30">Laden…</p>
      </main>
    )
  }

  const sorted = [...stats].sort((a, b) => b.year - a.year || a.bezirk.localeCompare(b.bezirk))

  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <div className="h-1.5 w-24" style={{ backgroundColor: CYAN }} />
      <h1 className="mt-3" style={{ ...display, color: BLUE, fontSize: '1.7rem' }}>
        Bau-Statistiken.
      </h1>
      <p className="mt-2 max-w-xl text-sm font-medium text-black/50">
        Genehmigte und fertiggestellte Wohnungen je Bezirk und Jahr — Quelle: Amt für
        Statistik Berlin-Brandenburg.
      </p>

      <div className="mt-5 overflow-x-auto border-2 bg-white" style={{ borderColor: BLUE }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: BLUE }}>
              <th className="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Bezirk</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Jahr</th>
              <th className="px-4 py-2.5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Genehmigt</th>
              <th className="px-4 py-2.5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Fertiggestellt</th>
              <th className="px-4 py-2.5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s) => (
              <tr key={s.id} className="border-b border-black/5 last:border-0 hover:bg-[#F2FAFD]">
                <td className="px-4 py-2.5 font-bold">{s.bezirk}</td>
                <td className="px-4 py-2.5 tabular-nums font-medium">
                  {editing?.id === s.id ? (
                    <input type="number" value={editing.year} onChange={(e) => setEditing({ ...editing, year: parseInt(e.target.value) })} className={cellInput} />
                  ) : s.year}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums font-medium">
                  {editing?.id === s.id ? (
                    <input type="number" value={editing.approvedCount} onChange={(e) => setEditing({ ...editing, approvedCount: parseInt(e.target.value) })} className={cellInput} />
                  ) : fmt(s.approvedCount)}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums font-medium">
                  {editing?.id === s.id ? (
                    <input type="number" value={editing.completedCount} onChange={(e) => setEditing({ ...editing, completedCount: parseInt(e.target.value) })} className={cellInput} />
                  ) : fmt(s.completedCount)}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-right">
                  {editing?.id === s.id ? (
                    <>
                      <button onClick={handleSave} className="mr-3 text-xs font-extrabold uppercase tracking-wide hover:underline" style={{ color: CYAN }}>
                        Speichern
                      </button>
                      <button onClick={() => setEditing(null)} className="text-xs font-extrabold uppercase tracking-wide text-black/40 hover:underline">
                        Abbrechen
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setEditing({ ...s })} className="text-xs font-extrabold uppercase tracking-wide hover:underline" style={{ color: BLUE }}>
                      Bearbeiten
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
