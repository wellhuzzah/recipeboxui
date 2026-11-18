import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import RecipeCard from '../components/RecipeCard'
import api from '../api/client'

const API_BASE = api.defaults.baseURL

function BoozeAndVinylDetail() {
	const { id } = useParams()
	const navigate = useNavigate()
	const [entry, setEntry] = useState(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		fetch(`${API_BASE}/booze-and-vinyl/${id}`)
			.then(res => res.json())
			.then(data => {
				setEntry(data)
				setLoading(false)
			})
			.catch(() => setLoading(false))
	}, [id])

	if (loading) return <div className="status-message">Pouring...</div>
	if (!entry) return <div className="status-message error">Not found.</div>

	return (
		<div className="bv-detail-page">
			<button className="back-button" onClick={() => navigate('/booze-and-vinyl')}>
				← Booze & Vinyl
			</button>

			<div className="bv-detail-header">
				<p className="bv-detail-meta">Vol. {entry.volume} · Side {entry.side}</p>
				<h1 className="bv-detail-artist">{entry.artist}</h1>
				<h2 className="bv-detail-album">{entry.album}{entry.year ? ` · ${entry.year}` : ''}</h2>
			</div>

			{entry.recipes && entry.recipes.length > 0 && (
				<div className="bv-detail-recipes">
					<p className="cocktail-section-title" style={{ marginBottom: '1rem' }}>
						Paired Cocktail
					</p>
					{entry.recipes.map(recipe => (
						<RecipeCard
							key={recipe.id}
							recipe={recipe}
							onClick={() => navigate(`/recipes/${recipe.id}`)}
						/>
					))}
				</div>
			)}
		</div>
	)
}

export default BoozeAndVinylDetail