import { createFileRoute } from '@tanstack/react-router'
import { useState, useCallback } from 'react'
import { getBvvParties, updateBvvParty } from '../../server/bvv'
import { getStats, upsertStat } from '../../server/stats'
import { getProjects } from '../../server/projects'
import { PARTY_COLORS, PARTY_TEXT_COLORS, PARTIES } from '../../lib/parties'
import { useMemo } from 'react'

export const Route = createFileRoute('/admin/bvv')({
  loader: async () => {
    const [bvvParties, stats, projects] = await Promise.all([
      getBvvParties(),
      getStats(),
      getProjects(),
    ])
    return { bvvParties, stats, projects }
  },
  component: BvvAdmin,
})

function BvvAdmin() {
  const { bvvParties: initialParties, stats, projects } = Route.useLoaderData()
  const [parties, setParties] = useState(initialParties)
  const [editing, setEditing] = useState<any | null>(null)

  const bezirkData = useMemo(() => {
    return parties.map((bvv) => {
      const bezirkStats = stats.filter((s) => s.bezirk === bvv.bezirk)
      const blockedCount = projects.filter((p) => p.bezirk === bvv.bezirk).length
      const latestStats = bezirkStats.sort((a, b) => b.year - a.year)[0]
      return { ...bvv, stats: latestStats, blockedCount }
    })
  }, [parties, stats, projects])

  const handleSave = async () => {
    if (editing) {
      await updateBvvParty({ data: editing })
      const updated = await getBvvParties()
      setParties(updated)
      setEditing(null)
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <h2 className="mb-4 text-lg font-bold">BVV-Parteien & Bezirksdaten</h2>

      <div className="rounded border border-[var(--color-border)] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
              <th className="px-4 py-2 text-left font-medium text-[var(--color-text-muted)]">Bezirk</th>
              <th className="px-4 py-2 text-left font-medium text-[var(--color-text-muted)]">Führende Partei</th>
              <th className="px-4 py-2 text-left font-medium text-[var(--color-text-muted)]">Koalition</th>
              <th className="px-4 py-2 text-center font-medium text-[var(--color-text-muted)]">Blockiert</th>
              <th className="px-4 py-2 text-center font-medium text-[var(--color-text-muted)]">Genehmigt</th>
              <th className="px-4 py-2 text-right font-medium text-[var(--color-text-muted)]">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {bezirkData.map((b) => (
              <tr key={b.id} className="border-b border-[var(--color-border)] last:border-0">
                <td className="px-4 py-2 font-medium">{b.bezirk}</td>
                <td className="px-4 py-2">
                  {editing?.id === b.id ? (
                    <select
                      value={editing.rulingParty}
                      onChange={(e) => setEditing({ ...editing, rulingParty: e.target.value })}
                      className="rounded border border-[var(--color-border)] px-2 py-1 text-sm"
                    >
                      {PARTIES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  ) : (
                    <span
                      className="inline-block rounded px-2 py-0.5 text-xs font-bold"
                      style={{
                        backgroundColor: PARTY_COLORS[b.rulingParty] || '#999',
                        color: PARTY_TEXT_COLORS[b.rulingParty] || '#fff',
                      }}
                    >
                      {b.rulingParty}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-[var(--color-text-muted)]">
                  {editing?.id === b.id ? (
                    <input
                      value={editing.coalitionParties || ''}
                      onChange={(e) => setEditing({ ...editing, coalitionParties: e.target.value })}
                      className="w-full rounded border border-[var(--color-border)] px-2 py-1 text-sm"
                    />
                  ) : (
                    b.coalitionParties
                  )}
                </td>
                <td className="px-4 py-2 text-center">
                  <span className={`font-bold ${b.blockedCount > 0 ? 'text-[var(--color-berlin-red)]' : 'text-green-600'}`}>
                    {b.blockedCount}
                  </span>
                </td>
                <td className="px-4 py-2 text-center">
                  {b.stats ? b.stats.approvedCount.toLocaleString('de-DE') : '—'}
                </td>
                <td className="px-4 py-2 text-right">
                  {editing?.id === b.id ? (
                    <>
                      <button onClick={handleSave} className="mr-2 text-xs text-green-600 hover:underline">Speichern</button>
                      <button onClick={() => setEditing(null)} className="text-xs text-[var(--color-text-muted)] hover:underline">Abbrechen</button>
                    </>
                  ) : (
                    <button onClick={() => setEditing({ ...b })} className="text-xs text-blue-600 hover:underline">Bearbeiten</button>
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
