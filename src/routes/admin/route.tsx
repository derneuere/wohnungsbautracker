import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useState } from 'react'
import { checkPassword } from '../../server/auth'

export const Route = createFileRoute('/admin')({
  component: AdminLayout,
})

function AdminLayout() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

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

  return <Outlet />
}
