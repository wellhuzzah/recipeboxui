import { useState, useEffect } from 'react'
import api from '../../api/client'

const api_base = api.defaults.baseURL

async function getBVEntries() {
	const res = await fetch(`${api_base}/booze-and-vinyl/`)
	return res.json()
}

async function createBV(data, apiKey) {
	const res = await fetch(`${api_base}/booze-and-vinyl/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Api-Key': apiKey
		},
		body: JSON.stringify(data)
	})
	return res.json()
}

async function deleteBV(id, apiKey) {
	await fetch(`${api_base}/booze-and-vinyl/${id}`, {
		method: 'DELETE',
		headers: { 'X-Api-Key': apiKey }
	})
}

async function patchBVStatus(id, payload, apiKey) {
	await fetch(`${api_base}/booze-and-vinyl/${id}/status`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			'X-Api-Key': apiKey
		},
		body: JSON.stringify(payload)
	})
}

function buildGroups(entries) {
	const groups = []
	const seen = new Map()
	for (const entry of entries) {
		const key = `${entry.artist}|||${entry.album}`
		if (!seen.has(key)) {
			seen.set(key, groups.length)
			groups.push({ key, artist: entry.artist, album: entry.album, entries: [entry] })
		} else {
			groups[seen.get(key)].entries.push(entry)
		}
	}
	return groups
}

function BVForm({ apiKey, recipes, onSave }) {
	const [entries, setEntries] = useState([])
	const [form, setForm] = useState({ artist: '', album: '', volume: 1, side: 'A' })
	const [error, setError] = useState(null)
	const [saving, setSaving] = useState(false)
	const [confirmDelete, setConfirmDelete] = useState(null)

	useEffect(() => {
		getBVEntries().then(setEntries)
	}, [])

	const set = (field, value) => setForm(f => ({ ...f, [field]: value }))

	const handleSave = async () => {
		if (!form.artist.trim() || !form.album.trim()) {
			setError('Artist and album are required.')
			return
		}
		setSaving(true)
		setError(null)
		try {
			await createBV({ ...form, volume: parseInt(form.volume) }, apiKey)
			setForm({ artist: '', album: '', volume: 1, side: 'A' })
			const updated = await getBVEntries()
			setEntries(updated)
			onSave()
		} catch {
			setError('Save failed.')
		} finally {
			setSaving(false)
		}
	}

	const handleDelete = async (id) => {
		if (confirmDelete !== id) {
			setConfirmDelete(id)
			return
		}
		try {
			await deleteBV(id, apiKey)
			setEntries(entries.filter(e => e.id !== id))
			setConfirmDelete(null)
			onSave()
		} catch {
			setError('Delete failed.')
		}
	}

	const handleLinkRecipe = async (recipeId, bvId) => {
		if (!recipeId) return
		try {
			const res = await fetch(`${api_base}/booze-and-vinyl/${bvId}/link`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': apiKey
				},
				body: JSON.stringify({ recipe_id: parseInt(recipeId) })
			})
			if (!res.ok) throw new Error(`Link failed: ${res.status}`)
			const linked = recipes.find(r => r.id === parseInt(recipeId))
			setEntries(prev => prev.map(e =>
				e.id === bvId
					? { ...e, recipe_id: parseInt(recipeId), recipe_name: linked?.name ?? null }
					: e
			))
			onSave()
		} catch {
			setError('Failed to link recipe.')
		}
	}

	const handleToggleStatus = async (groupEntries, field) => {
		const next = !groupEntries[0][field]
		try {
			await Promise.all(groupEntries.map(e => patchBVStatus(e.id, { [field]: next }, apiKey)))
			setEntries(prev => prev.map(e =>
				groupEntries.some(ge => ge.id === e.id) ? { ...e, [field]: next } : e
			))
		} catch {
			setError('Status update failed.')
		}
	}

	const groups = buildGroups(entries)

	return (
		<div className="bv-form">
			<div className="form-grid">
				<div className="form-field">
					<label>Artist</label>
					<input className="admin-input" value={form.artist} onChange={e => set('artist', e.target.value)} />
				</div>
				<div className="form-field">
					<label>Album</label>
					<input className="admin-input" value={form.album} onChange={e => set('album', e.target.value)} />
				</div>
				<div className="form-field">
					<label>Volume</label>
					<select className="admin-input" value={form.volume} onChange={e => set('volume', e.target.value)}>
						<option value={1}>1</option>
						<option value={2}>2</option>
					</select>
				</div>
				<div className="form-field">
					<label>Side</label>
					<select className="admin-input" value={form.side} onChange={e => set('side', e.target.value)}>
						<option value="A">A</option>
						<option value="B">B</option>
					</select>
				</div>
			</div>

			{error && <p className="recipe-form-error">{error}</p>}

			<button className="admin-btn-primary" onClick={handleSave} disabled={saving}>
				{saving ? 'Saving...' : '+ Add Entry'}
			</button>

			<div className="bv-list">
				{groups.map(group => (
					<div key={group.key} className="bv-group">
						<div className="bv-album-header">
							<div className="bv-album-header-info">
								<span className="bv-artist">{group.artist}</span>
								<span className="bv-album">{group.album}</span>
							</div>
							<div className="bv-album-pills">
								<button
									className={`bv-pill ${group.entries[0].owned ? 'active' : ''}`}
									onClick={() => handleToggleStatus(group.entries, 'owned')}
								>
									Owned
								</button>
								<button
									className={`bv-pill ${group.entries[0].spun ? 'active' : ''}`}
									onClick={() => handleToggleStatus(group.entries, 'spun')}
								>
									Spun
								</button>
							</div>
						</div>
						{group.entries.map(entry => (
							<div key={entry.id} className="bv-row bv-row-indented">
								<div className="bv-info">
									<span className="bv-album">Vol. {entry.volume}, Side {entry.side}</span>
								</div>
								<div className="bv-actions">
									<select
										className="admin-input bv-link-select"
										value={entry.recipe_id ?? ''}
										onChange={e => {
											if (e.target.value) handleLinkRecipe(e.target.value, entry.id)
										}}
									>
										<option value="">Link recipe...</option>
										{recipes.map(r => (
											<option key={r.id} value={r.id}>{r.name}</option>
										))}
									</select>
									<button
										className={`admin-btn-danger ${confirmDelete === entry.id ? 'confirming' : ''}`}
										onClick={() => handleDelete(entry.id)}
									>
										{confirmDelete === entry.id ? 'Confirm' : '✕'}
									</button>
								</div>
							</div>
						))}
					</div>
				))}
			</div>
		</div>
	)
}

export default BVForm
