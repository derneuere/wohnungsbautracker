import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { getBvvParties, updateBvvParty } from '../../server/bvv'
import { getStats } from '../../server/stats'
import { getProjects } from '../../server/projects'
import { PARTY_COLORS, PARTY_TEXT_COLORS, PARTIES } from '../../lib/parties'
import { fmt } from '../../lib/design-data'
import { BLUE, CYAN, display } from '../../lib/campaign'

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
      const latestStats = [...bezirkStats].sort((a, b) => b.year - a.year)[0]
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
    <main className="mx-auto max-w-6xl px-5 py-8">
      <div className="h-1.5 w-24" style={{ backgroundColor: CYAN }} />
      <h1 className="mt-3" style={{ ...display, color: BLUE, fontSize: '1.7rem' }}>
        BVV-Parteien & Bezirke.
      </h1>
      <p className="mt-2 max-w-xl text-sm font-medium text-black/50">
        Wer regiert in welcher Bezirksverordnetenversammlung — und wie viele Vorgänge der
        Tracker dort führt.
      </p>

      <div className="mt-5 overflow-x-auto border-2 bg-white" style={{ borderColor: BLUE }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: BLUE }}>
              <th className="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Bezirk</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Führende Partei</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Koalition</th>
              <th className="px-4 py-2.5 text-center text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Vorgänge</th>
              <th className="px-4 py-2.5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Genehmigt (akt. Jahr)</th>
              <th className="px-4 py-2.5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {bezirkData.map((b) => (
              <tr key={b.id} className="border-b border-black/5 last:border-0 hover:bg-[#F2FAFD]">
                <td className="px-4 py-2.5 font-bold">{b.bezirk}</td>
                <td className="px-4 py-2.5">
                  {editing?.id === b.id ? (
                    <select
                      value={editing.rulingParty}
                      onChange={(e) => setEditing({ ...editing, rulingParty: e.target.value })}
                      className="border-2 border-black/10 bg-white px-2 py-1 text-sm font-medium focus:border-[#1CB5E5] focus:outline-none"
                    >
                      {PARTIES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  ) : (
                    <span
                      className="inline-block px-2 py-0.5 text-xs font-black"
                      style={{
                        backgroundColor: PARTY_COLORS[b.rulingParty] || '#999',
                        color: PARTY_TEXT_COLORS[b.rulingParty] || '#fff',
                      }}
                    >
                      {b.rulingParty}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5 font-medium text-black/60">
                  {editing?.id === b.id ? (
                    <input
                      value={editing.coalitionParties || ''}
                      onChange={(e) => setEditing({ ...editing, coalitionParties: e.target.value })}
                      className="w-full border-2 border-black/10 bg-white px-2 py-1 text-sm font-medium focus:border-[#1CB5E5] focus:outline-none"
                    />
                  ) : (
                    b.coalitionParties
                  )}
                </td>
                <td className="px-4 py-2.5 text-center">
                  <span className="font-black tabular-nums" style={{ color: b.blockedCount > 0 ? BLUE : 'rgba(0,0,0,0.3)' }}>
                    {b.blockedCount}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums font-medium">
                  {b.stats ? fmt(b.stats.approvedCount) : '—'}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-right">
                  {editing?.id === b.id ? (
                    <>
                      <button onClick={handleSave} className="mr-3 text-xs font-extrabold uppercase tracking-wide hover:underline" style={{ color: CYAN }}>
                        Speichern
                      </button>
                      <button onClick={() => setEditing(null)} className="text-xs font-extrabold uppercase tracking-wide text-black/40 hover:underline">
                        Abbrechen
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setEditing({ ...b })} className="text-xs font-extrabold uppercase tracking-wide hover:underline" style={{ color: BLUE }}>
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
