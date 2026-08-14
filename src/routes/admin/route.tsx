import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'
import { checkPassword, isAdmin } from '../../server/auth'
import { exportDb, importDb } from '../../server/db-transfer'
import { ARCHIVO_FONT_LINKS, BLUE, CYAN, DEEP, YELLOW, body, display } from '../../lib/campaign'

export const Route = createFileRoute('/admin')({
  head: () => ({
    meta: [{ title: 'Admin — Wohnungsbau-Tracker Berlin' }],
    links: ARCHIVO_FONT_LINKS,
  }),
  component: AdminLayout,
})

function AdminLayout() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [dbStatus, setDbStatus] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Die Anmeldung liegt jetzt in einem versiegelten Cookie, nicht mehr allein
  // in diesem State — nach einem Reload also nachfragen statt aussperren.
  useEffect(() => {
    isAdmin()
      .then((r) => setAuthed(r.admin))
      .catch(() => {})
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await checkPassword({ data: password })
    if (result.valid) {
      setAuthed(true)
      setError('')
    } else if (result.gesperrt) {
      const minuten = Math.ceil(result.wartezeit / 60)
      setError(`Zu viele Fehlversuche. Wieder möglich in ${minuten} Minute${minuten === 1 ? '' : 'n'}.`)
    } else {
      setError('Falsches Passwort')
    }
  }

  const handleExport = async () => {
    setDbStatus('Exportiere…')
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
    setDbStatus('Importiere…')
    try {
      const buffer = await file.arrayBuffer()
      // Chunkweise kodieren: String.fromCharCode(...bytes) sprengt bei großen
      // Dateien (>~100 KB) das Argument-Limit der Engine (RangeError).
      const bytes = new Uint8Array(buffer)
      const CHUNK = 0x8000
      let binary = ''
      for (let i = 0; i < bytes.length; i += CHUNK) {
        binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
      }
      const base64 = btoa(binary)
      const result = await importDb({ data: base64 })
      setDbStatus(`Import fertig (${(result.size / 1024).toFixed(0)} KB) — Seite wird neu geladen…`)
      setTimeout(() => window.location.reload(), 1000)
    } catch (err) {
      setDbStatus(`Import fehlgeschlagen: ${err instanceof Error ? err.message : String(err)}`)
    }
    e.target.value = ''
  }

  if (!authed) {
    return (
      <main
        className="flex min-h-screen flex-col items-center justify-center px-6"
        style={{ ...body, background: `linear-gradient(180deg, ${DEEP} 0%, ${BLUE} 70%, #07336B 100%)` }}
      >
        <div className="w-full max-w-sm">
          <div className="h-2 w-32" style={{ backgroundColor: CYAN }} />
          <h1 className="mt-5" style={{ ...display, color: YELLOW, fontSize: '2rem', lineHeight: 1.05 }}>
            Hier arbeiten die, die hinsehen.
          </h1>
          <p className="mt-3 text-sm font-semibold text-white/60">
            Admin-Zugang zum Wohnungsbau-Tracker.
          </p>
          <form onSubmit={handleLogin} className="mt-8">
            <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/50">
              Passwort
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white placeholder-white/30 focus:border-[#1CB5E5] focus:outline-none"
              placeholder="••••••••"
              autoFocus
            />
            {error && (
              <p className="mt-3 px-2 py-1 text-sm font-bold" style={{ backgroundColor: YELLOW, color: BLUE, display: 'inline-block' }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              className="mt-5 w-full rounded-full px-4 py-3 text-sm font-extrabold uppercase tracking-[0.15em] transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: YELLOW, color: BLUE }}
            >
              Anmelden
            </button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <div style={body} className="min-h-screen bg-[#F4F6FB]">
      <div className="border-b border-black/5 bg-white px-5 py-2.5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-black/40">
            Datenbank
          </span>
          <div className="flex items-center gap-2">
            {dbStatus && <span className="text-xs font-bold" style={{ color: CYAN }}>{dbStatus}</span>}
            <button
              onClick={handleExport}
              className="rounded-full border-2 border-[#0B2B6B] px-4 py-1 text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#0B2B6B] transition-colors hover:bg-[#0B2B6B] hover:text-white"
            >
              Export
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full border-2 border-[#0B2B6B] px-4 py-1 text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#0B2B6B] transition-colors hover:bg-[#0B2B6B] hover:text-white"
            >
              Import
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
