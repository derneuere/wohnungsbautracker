import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { getAllProjects, createProject, updateProject, deleteProject } from '../../server/projects'
import { BEZIRKE, STATUS_OPTIONS } from '../../lib/parties'
import { fmt, splitParties } from '../../lib/design-data'
import { BLUE, CYAN, STATUS_CHIP, YELLOW, display } from '../../lib/campaign'

export const Route = createFileRoute('/admin/')({
  component: ProjectsAdmin,
})

const inputCls =
  'w-full border-2 border-black/10 bg-white px-3 py-2 text-sm font-medium focus:border-[#1CB5E5] focus:outline-none'
const labelCls = 'mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.15em] text-black/50'

function ProjectsAdmin() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<any | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('')

  const loadProjects = useCallback(async () => {
    setLoading(true)
    const data = await getAllProjects()
    setProjects(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const filtered = useMemo(() => {
    if (!filter) return projects
    const f = filter.toLowerCase()
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(f) ||
        p.bezirk.toLowerCase().includes(f) ||
        splitParties(p).join(',').toLowerCase().includes(f) ||
        p.status.includes(f),
    )
  }, [projects, filter])

  const emptyProject = {
    title: '',
    description: '',
    lat: 52.52,
    lng: 13.405,
    bezirk: BEZIRKE[0],
    status: 'blockiert',
    date: '',
    unitCount: null,
    unitCountEstimate: null,
    blockers: '',
    sourceUrl: '',
    pressUrls: '',
    imageUrl: '',
    hidden: false,
  }

  const handleSave = async (data: any) => {
    if (data.id) {
      await updateProject({ data })
    } else {
      await createProject({ data })
    }
    setShowForm(false)
    setEditing(null)
    loadProjects()
  }

  const handleDelete = async (id: number) => {
    if (confirm('Projekt wirklich löschen?')) {
      await deleteProject({ data: id })
      loadProjects()
    }
  }

  if (loading) {
    return (
      <Wrapper>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-black/30">Laden…</p>
      </Wrapper>
    )
  }

  if (showForm || editing) {
    return (
      <Wrapper>
        <ProjectForm
          initial={editing || emptyProject}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null) }}
        />
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="h-1.5 w-24" style={{ backgroundColor: CYAN }} />
          <h1 className="mt-3" style={{ ...display, color: BLUE, fontSize: '1.7rem' }}>
            {fmt(projects.length)} Projekte.
          </h1>
          {projects.some((p) => p.hidden) && (
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-black/40">
              {fmt(projects.filter((p) => p.hidden).length)} davon ausgeblendet — öffentlich sichtbar sind{' '}
              {fmt(projects.filter((p) => !p.hidden).length)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Suchen: Titel, Bezirk, Partei, Status…"
            className="w-72 border-2 border-black/10 bg-white px-3 py-2 text-sm font-medium focus:border-[#1CB5E5] focus:outline-none"
          />
          <button
            onClick={() => setShowForm(true)}
            className="rounded-full px-5 py-2 text-[12px] font-extrabold uppercase tracking-[0.1em] transition-transform hover:scale-105"
            style={{ backgroundColor: YELLOW, color: BLUE }}
          >
            + Neues Projekt
          </button>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto border-2 bg-white" style={{ borderColor: BLUE }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: BLUE }}>
              <th className="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Titel</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Bezirk</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Parteien</th>
              <th className="px-4 py-2.5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-white/80">WE</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Status</th>
              <th className="px-4 py-2.5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const chip = STATUS_CHIP[p.status] || STATUS_CHIP.abgelehnt
              return (
                <tr
                  key={p.id}
                  className="border-b border-black/5 last:border-0 hover:bg-[#F2FAFD]"
                  style={p.hidden ? { backgroundColor: '#FAFAFA', color: '#9AA0B0' } : undefined}
                >
                  <td className="max-w-md px-4 py-2.5 font-bold">
                    {p.hidden && (
                      <span
                        className="mr-2 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.1em]"
                        style={{ backgroundColor: '#E4E6EE', color: '#5A6076' }}
                        title="Keine politische oder verwaltungsseitige Ursache belegbar — nicht öffentlich sichtbar"
                      >
                        ausgeblendet
                      </span>
                    )}
                    {p.title}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 font-medium text-black/60">{p.bezirk}</td>
                  <td className="px-4 py-2.5 font-medium text-black/60">{splitParties(p).join(', ') || '—'}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-right font-bold tabular-nums">
                    {p.unitCount ? fmt(p.unitCount) : p.unitCountEstimate ? (
                      <span style={{ color: CYAN }}>~{fmt(p.unitCountEstimate)}</span>
                    ) : (
                      <span className="text-black/30">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <span
                      className="px-2 py-0.5 text-[10px] font-black tracking-[0.12em]"
                      style={{ backgroundColor: chip.bg, color: chip.fg, ...(p.status === 'abgelehnt' ? { border: `1.5px solid ${BLUE}` } : {}) }}
                    >
                      {chip.label}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-right">
                    <button
                      onClick={() => handleSave({ ...sanitize(p), hidden: !p.hidden })}
                      className="mr-3 text-xs font-extrabold uppercase tracking-wide hover:underline"
                      style={{ color: p.hidden ? BLUE : '#5A6076' }}
                      title={p.hidden ? 'Wieder öffentlich anzeigen' : 'Aus der öffentlichen Ansicht nehmen'}
                    >
                      {p.hidden ? 'Einblenden' : 'Ausblenden'}
                    </button>
                    <button
                      onClick={() => setEditing(p)}
                      className="mr-3 text-xs font-extrabold uppercase tracking-wide hover:underline"
                      style={{ color: BLUE }}
                    >
                      Bearbeiten
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-xs font-extrabold uppercase tracking-wide text-black/40 hover:text-red-700 hover:underline"
                    >
                      Löschen
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="px-4 py-10 text-center text-sm font-bold text-black/30">Nichts gefunden.</p>
        )}
      </div>
    </Wrapper>
  )
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
}

/** Hält nur die Felder, die die Server-Funktionen kennen — verhindert, dass
 *  Timestamps oder abgeleitete Felder aus dem Loader zurückgeschrieben werden. */
function sanitize(form: any) {
  const num = (v: any) => (v === '' || v === null || v === undefined || Number.isNaN(Number(v)) ? null : Number(v))
  return {
    ...(form.id ? { id: form.id } : {}),
    title: form.title,
    description: form.description || '',
    lat: Number(form.lat) || 52.52,
    lng: Number(form.lng) || 13.405,
    bezirk: form.bezirk,
    status: form.status,
    date: form.date || '',
    unitCount: num(form.unitCount),
    unitCountEstimate: num(form.unitCountEstimate),
    blockers: form.blockers || '',
    sourceUrl: form.sourceUrl || '',
    pressUrls: form.pressUrls || '',
    imageUrl: form.imageUrl || '',
    hidden: Boolean(form.hidden),
  }
}

function jsonOk(value: string): boolean {
  if (!value) return true
  try {
    return Array.isArray(JSON.parse(value))
  } catch {
    return false
  }
}

function ProjectForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: any
  onSave: (data: any) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState(initial)
  const set = (key: string, value: any) => setForm((f: any) => ({ ...f, [key]: value }))

  const blockersValid = jsonOk(form.blockers || '')
  const pressValid = jsonOk(form.pressUrls || '')

  return (
    <div className="border-2 bg-white p-6 sm:p-8" style={{ borderColor: BLUE }}>
      <div className="h-1.5 w-24" style={{ backgroundColor: CYAN }} />
      <h2 className="mt-3" style={{ ...display, color: BLUE, fontSize: '1.4rem' }}>
        {form.id ? 'Projekt bearbeiten.' : 'Neues Projekt.'}
      </h2>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelCls}>Titel</label>
          <input value={form.title} onChange={(e) => set('title', e.target.value)} className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Beschreibung</label>
          <textarea
            value={form.description || ''}
            onChange={(e) => set('description', e.target.value)}
            rows={3}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Status</label>
          <div className="flex gap-2">
            {STATUS_OPTIONS.map((s) => {
              const chip = STATUS_CHIP[s]
              const active = form.status === s
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => set('status', s)}
                  className={`px-3 py-1.5 text-[11px] font-black tracking-[0.1em] transition-opacity ${active ? '' : 'opacity-30 hover:opacity-60'}`}
                  style={{ backgroundColor: chip.bg, color: chip.fg, ...(s === 'abgelehnt' ? { border: `1.5px solid ${BLUE}` } : {}) }}
                >
                  {chip.label}
                </button>
              )
            })}
          </div>
        </div>
        <div>
          <label className={labelCls}>Bezirk</label>
          <select value={form.bezirk} onChange={(e) => set('bezirk', e.target.value)} className={inputCls}>
            {BEZIRKE.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div>
          <label className={labelCls}>Wohneinheiten (belegt)</label>
          <input
            type="number"
            value={form.unitCount ?? ''}
            onChange={(e) => set('unitCount', e.target.value === '' ? null : parseInt(e.target.value))}
            className={inputCls}
            placeholder="leer = unbekannt"
          />
        </div>
        <div>
          <label className={labelCls}>Wohneinheiten (Schätzung)</label>
          <input
            type="number"
            value={form.unitCountEstimate ?? ''}
            onChange={(e) => set('unitCountEstimate', e.target.value === '' ? null : parseInt(e.target.value))}
            className={inputCls}
            placeholder="nur falls keine belegte Zahl"
          />
          <p className="mt-1 text-[11px] font-medium text-black/40">
            Zählt nur, wenn keine belegte Zahl existiert. Quellen-Metadaten pflegt die Recherche.
          </p>
        </div>

        <div>
          <label className={labelCls}>Breitengrad (Lat)</label>
          <input type="number" step="0.0001" value={form.lat} onChange={(e) => set('lat', parseFloat(e.target.value))} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Längengrad (Lng)</label>
          <input type="number" step="0.0001" value={form.lng} onChange={(e) => set('lng', parseFloat(e.target.value))} className={inputCls} />
        </div>

        <div className="sm:col-span-2">
          <label className={labelCls}>Sichtbarkeit</label>
          <label className="flex cursor-pointer items-center gap-2.5 border-2 border-black/10 bg-white px-3 py-2">
            <input
              type="checkbox"
              checked={Boolean(form.hidden)}
              onChange={(e) => set('hidden', e.target.checked)}
              className="h-4 w-4 accent-[#0B2B6B]"
            />
            <span className="text-sm font-bold">Aus der öffentlichen Ansicht nehmen</span>
          </label>
          <p className="mt-1 text-[11px] font-medium text-black/40">
            Für Vorhaben ohne belegbare politische oder verwaltungsseitige Ursache. Die Daten
            bleiben erhalten, fallen aber aus Karte, Listen und allen Summen heraus.
          </p>
        </div>

        <div>
          <label className={labelCls}>Datum des Vorgangs</label>
          <input value={form.date || ''} onChange={(e) => set('date', e.target.value)} className={inputCls} placeholder="TT.MM.JJJJ" />
        </div>
        <div>
          <label className={labelCls}>Drucksache / Quell-URL</label>
          <input value={form.sourceUrl || ''} onChange={(e) => set('sourceUrl', e.target.value)} className={inputCls} placeholder="https://…" />
        </div>

        <div className="sm:col-span-2">
          <label className={labelCls}>
            Hemmnisse (JSON){' '}
            {!blockersValid && <span className="text-red-600">— kein gültiges JSON-Array!</span>}
          </label>
          <textarea
            value={form.blockers || ''}
            onChange={(e) => set('blockers', e.target.value)}
            rows={2}
            className={`${inputCls} font-mono text-xs ${blockersValid ? '' : 'border-red-500'}`}
            placeholder='[{"name":"BI Beispielkiez","type":"bürgerinitiative"},{"name":"Bezirksamt X","type":"behörde","partei":"CDU"}] — Typen: partei, bürgerinitiative, behörde, gericht, umwelt, investor. Die Partei-Bilanz zählt partei-Blocker plus partei-Tags.'
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>
            Presse-Links (JSON){' '}
            {!pressValid && <span className="text-red-600">— kein gültiges JSON-Array!</span>}
          </label>
          <textarea
            value={form.pressUrls || ''}
            onChange={(e) => set('pressUrls', e.target.value)}
            rows={2}
            className={`${inputCls} font-mono text-xs ${pressValid ? '' : 'border-red-500'}`}
            placeholder='[{"title":"Tagesspiegel: …","url":"https://…"}]'
          />
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <button
          onClick={() => onSave(sanitize(form))}
          disabled={!form.title || !blockersValid || !pressValid}
          className="rounded-full px-6 py-2.5 text-[12px] font-extrabold uppercase tracking-[0.12em] transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ backgroundColor: YELLOW, color: BLUE }}
        >
          Speichern
        </button>
        <button
          onClick={onCancel}
          className="rounded-full border-2 px-6 py-2.5 text-[12px] font-extrabold uppercase tracking-[0.12em] transition-colors hover:bg-black/5"
          style={{ borderColor: BLUE, color: BLUE }}
        >
          Abbrechen
        </button>
      </div>
    </div>
  )
}
