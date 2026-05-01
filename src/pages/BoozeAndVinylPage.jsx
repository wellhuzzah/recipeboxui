import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import LetterBoard from '../components/LetterBoard'

const API_BASE = 'https://bar.letsfriggen.party/api'

function BoozeAndVinylPage() {
	const [entries, setEntries] = useState([])
	const [loading, setLoading] = useState(true)
	const [spunFilter, setSpunFilter] = useState(null)
	const [ownedFilter, setOwnedFilter] = useState(null)
	const [searchQuery, setSearchQuery] = useState('')
	const navigate = useNavigate()

	useEffect(() => {
		fetch(`${API_BASE}/booze-and-vinyl/`)
			.then(res => res.json())
			.then(data => {
				setEntries(data)
				setLoading(false)
			})
			.catch(() => setLoading(false))
	}, [])

	const toggleSpun = (val) => setSpunFilter(prev => prev === val ? null : val)
	const toggleOwned = (val) => setOwnedFilter(prev => prev === val ? null : val)

	const buildGroups = (entries) => {
		const map = new Map()
		entries.forEach(e => {
			const key = `${e.artist}__${e.album}`
			if (!map.has(key)) map.set(key, { artist: e.artist, album: e.album, year: e.year ?? null, owned: e.owned, spun: e.spun, volume: e.volume, original: e.original ?? false, sides: [] })
			map.get(key).sides.push(e)
		})
		return Array.from(map.values())
	}

	const filtered = entries.filter(e => {
		if (spunFilter !== null && e.spun !== spunFilter) return false
		if (ownedFilter !== null && e.owned !== ownedFilter) return false
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase()
			if (!e.artist.toLowerCase().includes(q) && !e.album.toLowerCase().includes(q)) return false
		}
		return true
	})

	if (loading) return <div className="status-message">Pouring...</div>

	return (
		<div className="bv-page">
			<button className="back-button" onClick={() => navigate('/')}>
				← Back
			</button>
			<header className="bv-page-header">
				<h1 className="site-title">Booze & Vinyl</h1>
				<p className="site-subtitle">Records that earned a cocktail</p>
				<hr className="header-rule" />
			</header>

			<LetterBoard>
				Booze & Vinyl pairs 200+ classic albums with cocktails — one drink for each side of the record. Written by André and Tenaya Darlington, it's the inspiration behind this whole project.{' '}
				<a href="https://www.hachettebookgroup.com/titles/andre-darlington/booze-vinyl/9780762463473/?lens=running-press" target="_blank" rel="noopener noreferrer" className="bv-board-link">Authors' website →</a>
			</LetterBoard>

			<div className="bv-controls">
				<input
					type="text"
					className="bv-search"
					placeholder="Search artists, albums..."
					value={searchQuery}
					onChange={e => setSearchQuery(e.target.value)}
				/>
				<div className="bv-filter-grid">
					<button className={`filter-btn ${spunFilter === true ? 'active' : ''}`} onClick={() => toggleSpun(true)}>Spun</button>
					<button className={`filter-btn ${spunFilter === false ? 'active' : ''}`} onClick={() => toggleSpun(false)}>Not Yet</button>
					<button className={`filter-btn ${ownedFilter === true ? 'active' : ''}`} onClick={() => toggleOwned(true)}>Found</button>
					<button className={`filter-btn ${ownedFilter === false ? 'active' : ''}`} onClick={() => toggleOwned(false)}>Still Digging</button>
				</div>
			</div>

			<div className="bv-list">
				{buildGroups(filtered).map(group => (
					<div className="bv-group-card" key={`${group.artist}__${group.album}`}>
						<div className="bv-group-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
							<div className="bv-group-header-info">
								<span className="bv-group-artist">{group.artist}</span>
								<span className="bv-group-album">{group.album}{group.year ? ` · ${group.year}` : ''}</span>
							</div>
							<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
								<div className="bv-group-stamps" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
									{group.owned && <span className="bv-stamp bv-stamp-found">FOUND</span>}
									{group.spun && <span className="bv-stamp bv-stamp-spun">SPUN</span>}
								</div>
								<span className="bv-vol">VOL. {group.volume}</span>
							</div>
						</div>
						<div className="bv-sides">
							{group.sides.sort((a, b) => a.side.localeCompare(b.side)).map(side => (
								<div className="bv-side-row" key={side.id}>
									<span className="bv-side-label">Side {side.side}</span>
									{side.recipe_id ? (
										<Link to={`/recipes/${side.recipe_id}`} className="bv-side-recipe">
											{side.recipe_name || 'View Recipe'}
										</Link>
									) : (
										<span className="bv-side-empty">empty glass</span>
									)}
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

export default BoozeAndVinylPage
