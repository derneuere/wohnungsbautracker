import { createFileRoute } from '@tanstack/react-router'
import { useState, useCallback } from 'react'
import { getStats, upsertStat } from '../../server/stats'

export const Route = createFileRoute('/admin/stats')({
  component: StatsAdmin,
})

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

  useState(() => { load() })

  const handleSave = async () => {
    if (editing) {
      await upsertStat({ data: editing })
      setEditing(null)
      load()
    }
  }

  if (loading) return <main className="mx-auto max-w-6xl px-4 py-6"><p className="text-sm text-[var(--color-text-muted)]">Laden...</p></main>

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <h2 className="mb-4 text-lg font-bold">Bau-Statistiken</h2>

      <div className="rounded border border-[var(--color-border)] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
              <th className="px-4 py-2 text-left font-medium text-[var(--color-text-muted)]">Bezirk</th>
              <th className="px-4 py-2 text-left font-medium text-[var(--color-text-muted)]">Jahr</th>
              <th className="px-4 py-2 text-left font-medium text-[var(--color-text-muted)]">Genehmigungen</th>
              <th className="px-4 py-2 text-left font-medium text-[var(--color-text-muted)]">Fertigstellungen</th>
              <th className="px-4 py-2 text-right font-medium text-[var(--color-text-muted)]">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s) => (
              <tr key={s.id} className="border-b border-[var(--color-border)] last:border-0">
                <td className="px-4 py-2 font-medium">{s.bezirk}</td>
                <td className="px-4 py-2">
                  {editing?.id === s.id ? (
                    <input type="number" value={editing.year} onChange={(e) => setEditing({ ...editing, year: parseInt(e.target.value) })} className="w-20 rounded border border-[var(--color-border)] px-2 py-1 text-sm" />
                  ) : s.year}
                </td>
                <td className="px-4 py-2">
                  {editing?.id === s.id ? (
                    <input type="number" value={editing.approvedCount} onChange={(e) => setEditing({ ...editing, approvedCount: parseInt(e.target.value) })} className="w-24 rounded border border-[var(--color-border)] px-2 py-1 text-sm" />
                  ) : s.approvedCount.toLocaleString('de-DE')}
                </td>
                <td className="px-4 py-2">
                  {editing?.id === s.id ? (
                    <input type="number" value={editing.completedCount} onChange={(e) => setEditing({ ...editing, completedCount: parseInt(e.target.value) })} className="w-24 rounded border border-[var(--color-border)] px-2 py-1 text-sm" />
                  ) : s.completedCount.toLocaleString('de-DE')}
                </td>
                <td className="px-4 py-2 text-right">
                  {editing?.id === s.id ? (
                    <>
                      <button onClick={handleSave} className="mr-2 text-xs text-green-600 hover:underline">Speichern</button>
                      <button onClick={() => setEditing(null)} className="text-xs text-[var(--color-text-muted)] hover:underline">Abbrechen</button>
                    </>
                  ) : (
                    <button onClick={() => setEditing({ ...s })} className="text-xs text-blue-600 hover:underline">Bearbeiten</button>
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
