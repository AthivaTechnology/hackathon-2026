import { useEffect, useState } from 'react'
import { listUsers, updateUser, deleteUser, resetPassword } from '../../api/users'
import useAuthStore from '../../store/authStore'

const ROLES = ['ADMIN', 'JUDGE', 'PARTICIPANT']
const ROLE_STYLES = {
  ADMIN: 'text-violet-400 border-violet-400/30 bg-violet-400/10',
  JUDGE: 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10',
  PARTICIPANT: 'text-green-400 border-green-400/30 bg-green-400/10',
}

export default function UsersPage() {
  const { user: me } = useAuthStore()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', role: '' })
  const [saving, setSaving] = useState(false)
  const [resetId, setResetId] = useState(null)
  const [newPwd, setNewPwd] = useState('')
  const [search, setSearch] = useState('')

  const load = () => {
    listUsers()
      .then(({ data }) => setUsers(data.users))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const startEdit = (u) => { setEditingId(u.id); setEditForm({ name: u.name, role: u.role }) }

  const saveEdit = async (id) => {
    setSaving(true)
    try { await updateUser(id, editForm); setEditingId(null); load() }
    catch (err) { alert(err.response?.data?.error || 'Failed to update') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return
    try { await deleteUser(id); load() }
    catch (err) { alert(err.response?.data?.error || 'Cannot delete user') }
  }

  const handleReset = async (id) => {
    if (!newPwd || newPwd.length < 8) return alert('Password must be at least 8 characters')
    try { await resetPassword(id, newPwd); setResetId(null); setNewPwd('') }
    catch (err) { alert(err.response?.data?.error || 'Failed to reset') }
  }

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">User Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">{users.length} users</p>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users…"
          className="input-dark max-w-xs py-1.5 text-sm"
        />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-hack-border">
            <tr>
              {['Name', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                <th key={h} className={`px-5 py-3 text-xs font-mono text-gray-500 ${h === 'Actions' ? 'text-right' : 'text-left'}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-hack-border/50 last:border-0 hover:bg-hack-border/20 transition-colors">
                <td className="px-5 py-3">
                  {editingId === u.id ? (
                    <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="input-dark py-1 text-xs w-32" />
                  ) : (
                    <span className="font-medium text-white">{u.name}</span>
                  )}
                </td>
                <td className="px-5 py-3 text-gray-500 font-mono text-xs">{u.email}</td>
                <td className="px-5 py-3">
                  {editingId === u.id ? (
                    <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      className="input-dark py-1 text-xs w-auto">
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  ) : (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-medium border ${ROLE_STYLES[u.role]}`}>
                      {u.role}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-gray-600 font-mono text-xs">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {editingId === u.id ? (
                      <>
                        <button onClick={() => saveEdit(u.id)} disabled={saving}
                          className="text-xs px-3 py-1 btn-primary">Save</button>
                        <button onClick={() => setEditingId(null)}
                          className="text-xs px-3 py-1 btn-ghost">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(u)}
                          className="text-xs px-3 py-1 btn-ghost">Edit</button>
                        <button onClick={() => { setResetId(u.id); setNewPwd('') }}
                          className="text-xs px-3 py-1 text-hack-amber border border-hack-amber/20 bg-hack-amber/5 rounded hover:bg-hack-amber/10 transition-colors">
                          Reset Pwd
                        </button>
                        {u.id !== me?.id && (
                          <button onClick={() => handleDelete(u.id)}
                            className="text-xs px-3 py-1 text-red-400 border border-red-500/20 bg-red-500/5 rounded hover:bg-red-500/10 transition-colors">
                            Delete
                          </button>
                        )}
                      </>
                    )}
                  </div>
                  {resetId === u.id && (
                    <div className="flex items-center gap-2 mt-2 justify-end">
                      <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)}
                        placeholder="New password" minLength={8}
                        className="input-dark py-1 text-xs w-36" />
                      <button onClick={() => handleReset(u.id)}
                        className="text-xs px-3 py-1 btn-primary">Set</button>
                      <button onClick={() => setResetId(null)}
                        className="text-xs text-gray-500 hover:text-white">✕</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <p className="text-center text-gray-600 text-sm py-10">No users found.</p>
        )}
      </div>
    </div>
  )
}
