import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useState, useRef } from 'react'
import { checkPassword } from '../../server/auth'
import { exportDb, importDb } from '../../server/db-transfer'

export const Route = createFileRoute('/admin')({
  component: AdminLayout,
})

function AdminLayout() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [dbStatus, setDbStatus] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await checkPassword({ data: password })
    if (result.valid) {
      setAuthed(true)
      setError('')
    } else {
      setError('Falsches Passwort')
    }
  }

  const handleExport = async () => {
    setDbStatus('Exportiere...')
    try {
      const result = await exportDb()
      const bytes = Uint8Array.from(atob(result.data), (c) => c.charCodeAt(0))
      const blob = new Blob([bytes], { type: 'application/x-sqlite3' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sqlite-${new Date().toISOString().slice(0, 10)}.db`
      a.click()
      URL.revokeObjectURL(url)
      setDbStatus(`Export fertig (${(result.size / 1024).toFixed(0)} KB)`)
    } catch (err) {
      setDbStatus('Export fehlgeschlagen')
    }
    setTimeout(() => setDbStatus(''), 3000)
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!confirm(`DB ersetzen mit "${file.name}" (${(file.size / 1024).toFixed(0)} KB)? Alle aktuellen Daten werden überschrieben!`)) {
      e.target.value = ''
      return
    }
    setDbStatus('Importiere...')
    try {
      const buffer = await file.arrayBuffer()
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)))
      const result = await importDb({ data: base64 })
      setDbStatus(`Import fertig (${(result.size / 1024).toFixed(0)} KB) — Seite wird neu geladen...`)
      setTimeout(() => window.location.reload(), 1000)
    } catch (err) {
      setDbStatus('Import fehlgeschlagen')
    }
    e.target.value = ''
  }

  if (!authed) {
    return (
      <main className="mx-auto max-w-md px-4 py-20">
        <div className="rounded border border-[var(--color-border)] bg-white p-6">
          <h1 className="mb-4 text-xl font-bold">Admin-Zugang</h1>
          <form onSubmit={handleLogin}>
            <label className="mb-1 block text-sm font-medium text-[var(--color-text-muted)]">Passwort</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-3 w-full rounded border border-[var(--color-border)] px-3 py-2 text-sm"
              placeholder="Admin-Passwort eingeben"
              autoFocus
            />
            {error && <p className="mb-3 text-sm text-[var(--color-berlin-red)]">{error}</p>}
            <button
              type="submit"
              className="w-full rounded bg-[var(--color-berlin-red)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-berlin-red-dark)] transition-colors"
            >
              Anmelden
            </button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <div>
      <div className="border-b border-[var(--color-border)] bg-white px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="text-sm font-medium text-[var(--color-text-muted)]">Admin</span>
          <div className="flex items-center gap-2">
            {dbStatus && (
              <span className="text-xs text-[var(--color-text-muted)]">{dbStatus}</span>
            )}
            <button
              onClick={handleExport}
              className="rounded border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] hover:bg-gray-50 transition-colors"
            >
              DB Export
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="rounded border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] hover:bg-gray-50 transition-colors"
            >
              DB Import
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".db,.sqlite,.sqlite3"
              onChange={handleImport}
              className="hidden"
            />
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  )
}
