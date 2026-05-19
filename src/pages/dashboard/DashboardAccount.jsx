import { useState, useEffect } from 'react'
import { Save, Check, Loader2, AlertCircle, ShieldCheck, User, Lock } from 'lucide-react'
import { api } from '../../lib/api'
import { setToken } from '../../lib/api'

const INPUT = 'w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-navara-blue/30'

export default function DashboardAccount() {
  const [me, setMe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Form state — three fields. We only send the ones the user has actually filled in.
  const [currentPassword, setCurrentPassword] = useState('')
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/auth/me')
        setMe(res)
        setNewUsername(res?.username || '')
      } catch (err) {
        setError(err?.body?.error || err.message)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  async function save(e) {
    e?.preventDefault?.()
    setSaveError(null)
    setSaved(false)

    if (!currentPassword) {
      setSaveError('Enter your current password to confirm the change.')
      return
    }

    const wantsNewPassword = Boolean(newPassword)
    const wantsNewUsername = newUsername && newUsername !== me?.username
    if (!wantsNewPassword && !wantsNewUsername) {
      setSaveError('Nothing to change — set a new username or new password (or both).')
      return
    }
    if (wantsNewPassword) {
      if (newPassword.length < 8) {
        setSaveError('New password must be at least 8 characters.')
        return
      }
      if (newPassword !== confirmPassword) {
        setSaveError('New password and confirmation do not match.')
        return
      }
    }

    setSaving(true)
    try {
      const res = await api.post('/api/auth/change-credentials', {
        currentPassword,
        newUsername: wantsNewUsername ? newUsername : undefined,
        newPassword: wantsNewPassword ? newPassword : undefined,
      })
      // The backend returns a fresh JWT tied to the new username — swap our stored token
      // so the next request doesn't 401 if the username actually changed.
      if (res?.token) setToken(res.token)
      setMe((m) => ({ ...m, username: res.username }))
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setSaveError(err?.body?.error || err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 size={14} className="animate-spin" /> Loading account…</div>
  }

  return (
    <div className="space-y-5 max-w-xl">
      <div>
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-navara-blue" />
          <h1 className="text-xl font-bold text-slate-800">Account Settings</h1>
        </div>
        <p className="text-sm text-slate-400 mt-0.5">
          Change the username or password you use to log into this dashboard.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-600 flex items-start gap-2">
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" /> <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-navara-blue/10 flex items-center justify-center">
          <User size={16} className="text-navara-blue" />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-800">{me?.username || '—'}</div>
          <div className="text-[11px] text-slate-400">
            {me?.source === 'db' ? 'Credentials stored in database' : 'Credentials still from environment variables (will switch to DB on first save)'}
          </div>
        </div>
      </div>

      <form onSubmit={save} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
            <Lock size={12} /> Change credentials
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Enter your current password to confirm. Fill the new username or password (or both).
          </p>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Current Password *</label>
            <input
              type="password"
              className={INPUT}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <div className="border-t border-slate-100 pt-4">
            <label className="block text-xs font-semibold text-slate-600 mb-1">New Username</label>
            <p className="text-[11px] text-slate-400 mb-1.5">Leave unchanged to keep the current username.</p>
            <input
              type="text"
              className={INPUT}
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              minLength={3}
              maxLength={64}
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">New Password</label>
            <p className="text-[11px] text-slate-400 mb-1.5">Min. 8 characters. Leave blank to keep the current password.</p>
            <input
              type="password"
              className={INPUT}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Confirm New Password</label>
            <input
              type="password"
              className={INPUT}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          {saveError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600 flex items-start gap-2">
              <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
              <span>{saveError}</span>
            </div>
          )}
        </div>
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-navara-blue text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-navara-blue/90 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Save size={14} />}
            {saving ? 'Updating…' : saved ? 'Updated' : 'Update credentials'}
          </button>
        </div>
      </form>
    </div>
  )
}
