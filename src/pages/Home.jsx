import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRecipes, searchRecipes, getNowServing } from '../api/recipes'
import RecipeCard from '../components/RecipeCard'
import LetterBoard from '../components/LetterBoard'

const CHEERS = [
	{ word: "Skål", language: "Swedish, Danish & Norwegian", url: "https://en.wikipedia.org/wiki/Sk%C3%A5l" },
	{ word: "Sláinte", language: "Irish & Scottish Gaelic", url: "https://en.wikipedia.org/wiki/Sl%C3%A1inte_mhath" },
	{ word: "Prost", language: "German", url: "https://en.wikipedia.org/wiki/Prost" },
	{ word: "Kanpai", language: "Japanese", url: "https://en.wikipedia.org/wiki/Kanpai" },
	{ word: "Salud", language: "Spanish", url: "https://en.wikipedia.org/wiki/Salud" },
	{ word: "Cin cin", language: "Italian", url: "https://en.wikipedia.org/wiki/Cin_cin" },
	{ word: "Santé", language: "French", url: "https://en.wiktionary.org/wiki/%C3%A0_votre_sant%C3%A9" },
	{ word: "Na Zdorovye", language: "Russian", url: "https://en.wiktionary.org/wiki/%D0%BD%D0%B0_%D0%B7%D0%B4%D0%BE%D1%80%D0%BE%D0%B2%D1%8C%D0%B5" },
	{ word: "Gān bēi", language: "Chinese", url: "https://en.wikipedia.org/wiki/Ganbei" },
	{ word: "Cheers", language: "English", url: "https://en.wikipedia.org/wiki/Toast_(honor)" },
]

function Home() {
	const [recipes, setRecipes] = useState([])
	const [allRecipes, setAllRecipes] = useState([])
	const [nowServing, setNowServing] = useState(null)
	const [query, setQuery] = useState('')
	const [activeTags, setActiveTags] = useState([])
	const [allTags, setAllTags] = useState([])
	const [originalsOnly, setOriginalsOnly] = useState(false)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const navigate = useNavigate()

	useEffect(() => {
		Promise.all([getRecipes(), getNowServing()])
			.then(([recipesRes, nowServingRes]) => {
				const recipes = recipesRes.data
				setRecipes(recipes)
				setAllRecipes(recipes)
				setNowServing(nowServingRes.data)

				// Extract all unique tags across all recipes
				const tags = [...new Set(recipes.flatMap(r => r.tags || []))]
				setAllTags(tags.sort())
				setLoading(false)
			})
			.catch(() => {
				setError('Could not load recipes.')
				setLoading(false)
			})
	}, [])

	useEffect(() => {
		const timer = setTimeout(() => {
			const params = {}
			if (query.trim()) params.q = query.trim()
			if (activeTags.length > 0) params.tags = activeTags.join(',')
			if (originalsOnly) params.original = true

			if (!params.q && !params.tags && !params.original) {
				setRecipes(allRecipes)
				return
			}

			searchRecipes(params).then(res => setRecipes(res.data))
		}, 300)
		return () => clearTimeout(timer)
	}, [query, activeTags, originalsOnly, allRecipes])

	const toggleTag = (tag) => {
		setActiveTags(prev =>
			prev.includes(tag)
				? prev.filter(t => t !== tag)
				: [...prev, tag]
		)
	}

	const handleRandom = () => {
		if (recipes.length === 0) return
		const random = recipes[Math.floor(Math.random() * recipes.length)]
		navigate(`/recipes/${random.id}`)
	}

	const [cheers] = useState(() => CHEERS[Math.floor(Math.random() * CHEERS.length)])
	const [cheersRevealed, setCheersRevealed] = useState(false)

	if (loading) return <div className="status-message">Pouring...</div>
	if (error) return <div className="status-message error">{error}</div>

	return (
		<main>
			<header className="site-header">
				<h1 className="site-title">Recipe Box</h1>
				<p className={`site-subtitle${cheersRevealed ? ' language-revealed' : ''}`}>
					<a
						href={cheers.url}
						target="_blank"
						rel="noopener noreferrer"
						className="cheers-link"
						onClick={(e) => {
							if (window.matchMedia('(hover: none)').matches && !cheersRevealed) {
								e.preventDefault()
								setCheersRevealed(true)
							}
						}}
					>
						{cheers.word}
					</a>
					<span className="cheers-language"> — {cheers.language}</span>
					{cheersRevealed && <span className="cheers-hint">Tap again to learn you something</span>}
				</p>
				<hr className="header-rule" />
				<nav className="site-nav">
					<a href="/booze-and-vinyl">Booze & Vinyl</a>
				</nav>
			</header>

			<div className="home-controls">
				<input
					className="search-input"
					type="text"
					placeholder="Search recipes, ingredients, notes..."
					value={query}
					onChange={e => setQuery(e.target.value)}
				/>
			</div>
			<div className="quick-filter-row">
				<button
					className={`quick-filter-btn${originalsOnly ? ' active' : ''}`}
					onClick={() => setOriginalsOnly(o => !o)}
				>
					★ Originals
				</button>
				<button className="quick-filter-btn" onClick={handleRandom}>
					Random Cocktail
				</button>
			</div>

			{allTags.length > 0 && (
				<div className="tag-filters">
					{allTags.map(tag => (
						<button
							key={tag}
							className={`tag-filter-btn ${activeTags.includes(tag) ? 'active' : ''}`}
							onClick={() => toggleTag(tag)}
						>
							{tag}
						</button>
					))}
				</div>
			)}

			{nowServing && (
				<LetterBoard recipe={nowServing} onClick={() => navigate(`/recipes/${nowServing.id}`)} />
			)}

			{recipes.length === 0 && (query || activeTags.length > 0) && (
				<div className="status-message">No recipes found.</div>
			)}

			<div className="recipe-grid">
				{recipes.map(recipe => (
					<RecipeCard
						key={recipe.id}
						recipe={recipe}
						onClick={() => navigate(`/recipes/${recipe.id}`)}
					/>
				))}
			</div>
		</main>
	)
}

export default Home