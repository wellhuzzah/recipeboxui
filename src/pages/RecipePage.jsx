import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getRecipe, getRecipes } from '../api/recipes'

function RecipePage() {
	const { id } = useParams()
	const navigate = useNavigate()
	const [recipe, setRecipe] = useState(null)
	const [allRecipes, setAllRecipes] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => {
		Promise.all([getRecipe(id), getRecipes()])
			.then(([recipeRes, allRes]) => {
				setRecipe(recipeRes.data)
				setAllRecipes(allRes.data)
				setLoading(false)
			})
			.catch(() => {
				setError('Recipe not found.')
				setLoading(false)
			})
	}, [id])

	const currentIndex = allRecipes.findIndex(r => r.id === parseInt(id))
	const prevRecipe = currentIndex > 0 ? allRecipes[currentIndex - 1] : null
	const nextRecipe = currentIndex < allRecipes.length - 1 ? allRecipes[currentIndex + 1] : null

	const goTo = useCallback((recipe) => {
		if (recipe) navigate(`/recipes/${recipe.id}`)
	}, [navigate])

	useEffect(() => {
		const handleKey = (e) => {
			if (e.key === 'ArrowLeft') goTo(prevRecipe)
			if (e.key === 'ArrowRight') goTo(nextRecipe)
		}
		window.addEventListener('keydown', handleKey)
		return () => window.removeEventListener('keydown', handleKey)
	}, [prevRecipe, nextRecipe, goTo])

	// Touch swipe detection
	useEffect(() => {
		let startX = null
		const handleTouchStart = (e) => { startX = e.touches[0].clientX }
		const handleTouchEnd = (e) => {
			if (startX === null) return
			const diff = startX - e.changedTouches[0].clientX
			if (Math.abs(diff) > 60) {
				if (diff > 0) goTo(nextRecipe)
				else goTo(prevRecipe)
			}
			startX = null
		}
		window.addEventListener('touchstart', handleTouchStart)
		window.addEventListener('touchend', handleTouchEnd)
		return () => {
			window.removeEventListener('touchstart', handleTouchStart)
			window.removeEventListener('touchend', handleTouchEnd)
		}
	}, [prevRecipe, nextRecipe, goTo])

	if (loading) return <div className="status-message">Pouring...</div>
	if (error) return <div className="status-message error">{error}</div>

	return (
		<div className="recipe-page">
			<div className="recipe-page-nav">
				<button className="back-button" onClick={() => navigate('/')}>
					← Back
				</button>
				<div className="recipe-nav-arrows">
					<button
						className="nav-arrow"
						onClick={() => goTo(prevRecipe)}
						disabled={!prevRecipe}
						title={prevRecipe ? prevRecipe.name : ''}
					>
						←
					</button>
					<button
						className="nav-arrow"
						onClick={() => goTo(nextRecipe)}
						disabled={!nextRecipe}
						title={nextRecipe ? nextRecipe.name : ''}
					>
						→
					</button>
				</div>
			</div>

			<article className="cocktail-card">
				{recipe.now_serving && (
					<span className="now-serving-badge">Now Serving</span>
				)}
				<header className="cocktail-card-header">
					<h1 className="cocktail-name">{recipe.name}</h1>
					{recipe.description && (
						<p className="cocktail-description">{recipe.description}</p>
					)}
				</header>

				<div className="cocktail-divider" />

				<section className="cocktail-section">
					<h2 className="cocktail-section-title">Ingredients</h2>
					<ul className="ingredient-list">
						{recipe.ingredients.map((ing, index) => (
							<li key={index} className="ingredient-item">
								<span className="ingredient-amount">
									{ing.amount} {ing.unit}
								</span>
								<span className="ingredient-name">
									{ing.name}
									{ing.optional && <em className="optional"> optional</em>}
								</span>
							</li>
						))}
					</ul>
				</section>

				<div className="cocktail-divider" />

				<section className="cocktail-section">
					<h2 className="cocktail-section-title">Method</h2>
					<p className="cocktail-body">{recipe.method}</p>
				</section>

				{recipe.garnish && (
					<>
						<div className="cocktail-divider" />
						<section className="cocktail-section">
							<h2 className="cocktail-section-title">Garnish</h2>
							<p className="cocktail-body">{recipe.garnish}</p>
						</section>
					</>
				)}

				{recipe.glassware && (
					<>
						<div className="cocktail-divider" />
						<section className="cocktail-section">
							<h2 className="cocktail-section-title">Vessel</h2>
							<p className="cocktail-body">{recipe.glassware}</p>
						</section>
					</>
				)}

				{recipe.notes && (
					<>
						<div className="cocktail-divider" />
						<section className="cocktail-section">
							<h2 className="cocktail-section-title">Notes</h2>
							<p className="cocktail-body cocktail-notes">{recipe.notes}</p>
						</section>
					</>
				)}

				{recipe.tags && recipe.tags.length > 0 && (
					<>
						<div className="cocktail-divider" />
						<div className="cocktail-card-tags">
							{recipe.tags.map(tag => (
								<span key={tag} className="tag">{tag}</span>
							))}
						</div>
					</>
				)}

				{recipe.artist && (
					<div className="cocktail-bv">
						<span className="cocktail-bv-label">Booze & Vinyl</span>
						{recipe.artist} — {recipe.album} (Vol. {recipe.volume}, Side {recipe.side})
					</div>
				)}

				{recipe.original && (
					<div className="original-signature cocktail-signature">L</div>
				)}

				{recipe.artist && (
					<svg
						className="bv-vinyl-stamp"
						width="48" height="48"
						viewBox="0 0 52 52"
						xmlns="http://www.w3.org/2000/svg"
					>
						<circle cx="26" cy="26" r="24" fill="#2a1f14"/>
						<circle cx="26" cy="26" r="22" fill="none" stroke="#3d2e1e" strokeWidth="0.6"/>
						<circle cx="26" cy="26" r="20" fill="none" stroke="#3d2e1e" strokeWidth="0.5"/>
						<circle cx="26" cy="26" r="18" fill="none" stroke="#3d2e1e" strokeWidth="0.5"/>
						<circle cx="26" cy="26" r="16" fill="none" stroke="#3d2e1e" strokeWidth="0.5"/>
						<circle cx="26" cy="26" r="14" fill="none" stroke="#3d2e1e" strokeWidth="0.5"/>
						<circle cx="26" cy="26" r="12" fill="none" stroke="#3d2e1e" strokeWidth="0.5"/>
						<circle cx="26" cy="26" r="9.5" fill="#8b1a1a"/>
						<circle cx="26" cy="26" r="8.5" fill="none" stroke="#a02020" strokeWidth="0.4"/>
						<circle cx="26" cy="26" r="1.5" fill="#1a1208"/>
					</svg>
				)}
			</article>
		</div>
	)
}

export default RecipePage