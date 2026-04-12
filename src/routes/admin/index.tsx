import { createFileRoute } from '@tanstack/react-router'
import { useState, useCallback } from 'react'
import { getProjects, createProject, updateProject, deleteProject } from '../../server/projects'
import { BEZIRKE, PARTIES, STATUS_OPTIONS } from '../../lib/parties'

export const Route = createFileRoute('/admin/')({
  component: ProjectsAdmin,
})

function ProjectsAdmin() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<any | null>(null)
  const [showForm, setShowForm] = useState(false)

  const loadProjects = useCallback(async () => {
    setLoading(true)
    const data = await getProjects()
    setProjects(data)
    setLoading(false)
  }, [])

  useState(() => { loadProjects() })

  const emptyProject = {
    title: '',
    description: '',
    lat: 52.52,
    lng: 13.405,
    party: 'CDU',
    bezirk: BEZIRKE[0],
    status: 'blockiert',
    date: '',
    sourceUrl: '',
    imageUrl: '',
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

  if (loading) return <Wrapper><p className="text-sm text-[var(--color-text-muted)]">Laden...</p></Wrapper>

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
      <div className="rounded border border-[var(--color-border)] bg-white">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] p-4">
          <span className="text-sm font-medium">{projects.length} Projekte</span>
          <button
            onClick={() => setShowForm(true)}
            className="rounded bg-[var(--color-berlin-red)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--color-berlin-red-dark)] transition-colors"
          >
            + Neues Projekt
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
              <th className="px-4 py-2 text-left font-medium text-[var(--color-text-muted)]">Titel</th>
              <th className="px-4 py-2 text-left font-medium text-[var(--color-text-muted)]">Bezirk</th>
              <th className="px-4 py-2 text-left font-medium text-[var(--color-text-muted)]">Partei</th>
              <th className="px-4 py-2 text-left font-medium text-[var(--color-text-muted)]">Status</th>
              <th className="px-4 py-2 text-right font-medium text-[var(--color-text-muted)]">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="border-b border-[var(--color-border)] last:border-0">
                <td className="px-4 py-2 font-medium">{p.title}</td>
                <td className="px-4 py-2 text-[var(--color-text-muted)]">{p.bezirk}</td>
                <td className="px-4 py-2">{p.party}</td>
                <td className="px-4 py-2">
                  <span className={`rounded px-1.5 py-0.5 text-xs font-medium status-${p.status}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => setEditing(p)}
                    className="mr-2 text-xs text-blue-600 hover:underline"
                  >
                    Bearbeiten
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-xs text-[var(--color-berlin-red)] hover:underline"
                  >
                    Löschen
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Wrapper>
  )
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
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

  return (
    <div className="rounded border border-[var(--color-border)] bg-white p-6">
      <h2 className="mb-4 text-base font-bold">{form.id ? 'Projekt bearbeiten' : 'Neues Projekt'}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">Titel</label>
          <input
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            className="w-full rounded border border-[var(--color-border)] px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">Beschreibung</label>
          <textarea
            value={form.description || ''}
            onChange={(e) => set('description', e.target.value)}
            rows={3}
            className="w-full rounded border border-[var(--color-border)] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">Breitengrad (Lat)</label>
          <input
            type="number"
            step="0.0001"
            value={form.lat}
            onChange={(e) => set('lat', parseFloat(e.target.value))}
            className="w-full rounded border border-[var(--color-border)] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">Längengrad (Lng)</label>
          <input
            type="number"
            step="0.0001"
            value={form.lng}
            onChange={(e) => set('lng', parseFloat(e.target.value))}
            className="w-full rounded border border-[var(--color-border)] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">Bezirk</label>
          <select
            value={form.bezirk}
            onChange={(e) => set('bezirk', e.target.value)}
            className="w-full rounded border border-[var(--color-border)] px-3 py-2 text-sm"
          >
            {BEZIRKE.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">Partei</label>
          <select
            value={form.party}
            onChange={(e) => set('party', e.target.value)}
            className="w-full rounded border border-[var(--color-border)] px-3 py-2 text-sm"
          >
            {PARTIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">Status</label>
          <select
            value={form.status}
            onChange={(e) => set('status', e.target.value)}
            className="w-full rounded border border-[var(--color-border)] px-3 py-2 text-sm"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">Datum</label>
          <input
            value={form.date || ''}
            onChange={(e) => set('date', e.target.value)}
            className="w-full rounded border border-[var(--color-border)] px-3 py-2 text-sm"
            placeholder="TT.MM.JJJJ"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">Quell-URL</label>
          <input
            value={form.sourceUrl || ''}
            onChange={(e) => set('sourceUrl', e.target.value)}
            className="w-full rounded border border-[var(--color-border)] px-3 py-2 text-sm"
            placeholder="https://..."
          />
        </div>
      </div>
      <div className="mt-6 flex gap-2">
        <button
          onClick={() => onSave(form)}
          className="rounded bg-[var(--color-berlin-red)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-berlin-red-dark)] transition-colors"
        >
          Speichern
        </button>
        <button
          onClick={onCancel}
          className="rounded border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:bg-gray-50 transition-colors"
        >
          Abbrechen
        </button>
      </div>
    </div>
  )
}
