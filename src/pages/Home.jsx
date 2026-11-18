import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRecipes, searchRecipes, getNowServing, getFeaturedMenu, getFeaturedRecipes } from '../api/recipes'
import RecipeCard from '../components/RecipeCard'
import LetterBoard from '../components/LetterBoard'
import CardDeck from '../components/CardDeck'

const CHEERS = [
	{ word: "Cheers", language: "English", translation: "To your good health and happiness" },
	{ word: "Skål", language: "Swedish / Danish / Norwegian", translation: "To the bowl (shared drinking vessel)" },
	{ word: "Sláinte", language: "Irish & Scottish Gaelic", translation: "To your health" },
	{ word: "Prost", language: "German", translation: "May it be good for you" },
	{ word: "Kanpai", language: "Japanese", translation: "Empty the cup" },
	{ word: "Salud", language: "Spanish", translation: "To your health" },
	{ word: "Cin cin", language: "Italian", translation: "Clink clink (the sound of glasses)" },
	{ word: "Santé", language: "French", translation: "To your health" },
	{ word: "Na Zdorovye", language: "Russian", translation: "To your health" },
	{ word: "Gān bēi", language: "Chinese", translation: "Dry the cup" },
	{ word: "Saúde", language: "Portuguese", translation: "To your health" },
	{ word: "Yamas", language: "Greek", translation: "To our health" },
	{ word: "L'chaim", language: "Hebrew", translation: "To life" },
	{ word: "Şerefe", language: "Turkish", translation: "To your honor" },
	{ word: "Chok dee", language: "Thai", translation: "Good luck" },
	{ word: "Mabuhay", language: "Filipino", translation: "Long live" },
	{ word: "Geonbae", language: "Korean (건배)", translation: "Empty the glass" },
	{ word: "Na zdraví", language: "Czech", translation: "To health" },
	{ word: "Egészségedre", language: "Hungarian", translation: "To your wholeness" },
	{ word: "Tervist", language: "Estonian", translation: "To your health" },
	{ word: "Į sveikatą", language: "Lithuanian", translation: "To health" },
	{ word: "Noroc", language: "Romanian", translation: "Good luck" },
	{ word: "Živeli", language: "Serbian / Croatian", translation: "May you live long" },
	{ word: "Nazdravlje", language: "Bosnian", translation: "To health" },
	{ word: "Za zdorovye", language: "Ukrainian", translation: "To health" },
	{ word: "Proost", language: "Dutch", translation: "May it be good" },
	{ word: "Skál", language: "Icelandic", translation: "To the bowl" },
	{ word: "Kippis", language: "Finnish", translation: "Bottoms up" },
	{ word: "Iechyd da", language: "Welsh", translation: "Good health" },
	{ word: "Slàinte mhath", language: "Scottish Gaelic (long form)", translation: "Good health to you" },
	{ word: "Gezondheid", language: "Afrikaans", translation: "To your health" },
	{ word: "Oogy wawa", language: "Zulu (approximate)", translation: "To your strength" },
	{ word: "Sahha", language: "Arabic (Maghrebi)", translation: "To your health" },
	{ word: "Fi sihetik", language: "Arabic (Levantine)", translation: "To your health" },
	{ word: "Chai yo", language: "Thai (formal)", translation: "Victory and prosperity" },
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
	const [featuredMenu, setFeaturedMenu] = useState({ title: 'Seasonal Menu', active: false })
	const [deckRecipes, setDeckRecipes] = useState([])
	const navigate = useNavigate()

	useEffect(() => {
		getFeaturedMenu().then(res => setFeaturedMenu(res.data))
		getFeaturedRecipes().then(res => setDeckRecipes(res.data))
	}, [])

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

	const [cheers, setCheers] = useState(() => CHEERS[Math.floor(Math.random() * CHEERS.length)])
	const [cheersRevealed, setCheersRevealed] = useState(false)

	const cyclecheers = () => {
		setCheers(prev => {
			const next = CHEERS.filter(c => c.word !== prev.word)
			return next[Math.floor(Math.random() * next.length)]
		})
		setCheersRevealed(false)
	}

	useEffect(() => {
		const hint = document.getElementById('scroll-hint')
		const onScroll = () => { if (hint) hint.style.opacity = '0' }
		window.addEventListener('scroll', onScroll, { once: true })
		return () => window.removeEventListener('scroll', onScroll)
	}, [])

	if (loading) return <div className="status-message">Pouring...</div>
	if (error) return <div className="status-message error">{error}</div>

	return (
		<main>
			<header className="site-header">
				<h1 className="site-title">the bar</h1>
				<p className={`site-subtitle${cheersRevealed ? ' language-revealed' : ''}`}>
					<span
						className="cheers-word"
						role="button"
						tabIndex={0}
						onClick={() => {
							if (window.matchMedia('(hover: none)').matches) {
								if (!cheersRevealed) setCheersRevealed(true)
								else cyclecheers()
							} else {
								cyclecheers()
							}
						}}
						onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') cyclecheers() }}
					>
						{cheers.word}
					</span>
					<span className="cheers-language">{cheers.language}</span>
					<span className="cheers-translation">"{cheers.translation}"</span>
				</p>
				<hr className="header-rule" />
				<nav className="site-nav">
					<a href="/booze-and-vinyl">Booze & Vinyl</a>
					<a href="#recipe-search">Recipes</a>
				</nav>
			</header>

			{nowServing && (
				<LetterBoard recipe={nowServing} onClick={() => navigate(`/recipes/${nowServing.id}`)} />
			)}

			<div className="card-stack-header">
				<span className="card-stack-rule"></span>
				<span className="card-stack-title">{featuredMenu.title}</span>
				<span className="card-stack-rule"></span>
			</div>

			{deckRecipes.length > 0 && <CardDeck recipes={deckRecipes} />}

			<div className="scroll-hint" id="scroll-hint">↓ SCROLL FOR MORE RECIPES</div>

			<div className="home-controls" id="recipe-search">
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