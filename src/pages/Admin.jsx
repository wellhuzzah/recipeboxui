import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import RecipeForm from '../components/admin/RecipeForm'
import BVForm from '../components/admin/BVForm'
import StatsDashboard from '../components/admin/StatsDashboard'
import FeaturedMenuForm from '../components/admin/FeaturedMenuForm'
import { getRecipes, getStats, getRecipe } from '../api/recipes'

const LOCAL_PREFIXES = ['192.168.', '10.', '127.']

function isLocalNetwork() {
	const host = window.location.hostname
	return LOCAL_PREFIXES.some(prefix => host.startsWith(prefix))
}

function Admin() {
	const [apiKey, setApiKey] = useState('')
	const [authenticated, setAuthenticated] = useState(false)
	const [keyInput, setKeyInput] = useState('')
	const [tab, setTab] = useState('recipes')
	const [recipes, setRecipes] = useState([])
	const [stats, setStats] = useState(null)
	const [editingRecipe, setEditingRecipe] = useState(null)
	const [error, setError] = useState(null)

	const [searchParams] = useSearchParams()

	useEffect(() => {
		if (!authenticated) return
		const editId = searchParams.get('edit')
		if (editId) {
			getRecipe(parseInt(editId)).then(res => setEditingRecipe(res.data))
		}
	}, [authenticated])

	if (!isLocalNetwork()) {
		return (
			<div className="admin-blocked">
				<p>Admin access is only available on the local network.</p>
			</div>
		)
	}

	const handleAuth = (e) => {
		e.preventDefault()
		if (keyInput.trim()) {
			setApiKey(keyInput.trim())
			setAuthenticated(true)
		}
	}

	useEffect(() => {
		if (!authenticated) return
		refreshRecipes()
		getStats().then(res => setStats(res.data))
	}, [authenticated])

	const refreshRecipes = () => {
		getRecipes().then(res => setRecipes(res.data))
	}

	if (!authenticated) {
		return (
			<div className="admin-auth">
				<div className="admin-auth-card">
					<h1 className="admin-title">Admin</h1>
					<form onSubmit={handleAuth} className="admin-auth-form">
						<input
							type="password"
							className="admin-input"
							value={keyInput}
							onChange={e => setKeyInput(e.target.value)}
							autoFocus
						/>
						<button type="submit" className="admin-btn-primary">
							Enter
						</button>
					</form>
				</div>
			</div>
		)
	}

	return (
		<div className="admin-layout">
			<header className="admin-header">
				<a href="/" className="admin-home-link">← Home</a>
				<h1 className="admin-title">Admin</h1>
				<nav className="admin-tabs">
					<button
						className={`admin-tab ${tab === 'recipes' ? 'active' : ''}`}
						onClick={() => setTab('recipes')}
					>
						Recipes
					</button>
					<button
						className={`admin-tab ${tab === 'bv' ? 'active' : ''}`}
						onClick={() => setTab('bv')}
					>
						Booze & Vinyl
					</button>
					<button
						className={`admin-tab ${tab === 'stats' ? 'active' : ''}`}
						onClick={() => setTab('stats')}
					>
						Stats
					</button>
					<button
						className={`admin-tab ${tab === 'featured' ? 'active' : ''}`}
						onClick={() => setTab('featured')}
					>
						Featured Menu
					</button>
				</nav>
			</header>

			<main className="admin-main">
				{tab === 'recipes' && (
					<div className="admin-section">
						<div className="admin-section-header">
							<h2 className="admin-section-title">Recipes</h2>
							<button
								className="admin-btn-primary"
								onClick={() => setEditingRecipe({})}
							>
								+ New Recipe
							</button>
						</div>

						{editingRecipe !== null && (
							<RecipeForm
								recipe={editingRecipe}
								apiKey={apiKey}
								onSave={() => {
									setEditingRecipe(null)
									refreshRecipes()
								}}
								onCancel={() => setEditingRecipe(null)}
							/>
						)}

						<div className="admin-recipe-list">
							{recipes.map(recipe => (
								<div key={recipe.id} className="admin-recipe-row">
									<span className="admin-recipe-name">{recipe.name}</span>
									<div className="admin-recipe-actions">
										{recipe.now_serving && (
											<span className="admin-now-serving-indicator">Now Serving</span>
										)}
										<button
											className="admin-btn-secondary"
											onClick={async () => {
												const res = await getRecipe(recipe.id)
												setEditingRecipe(res.data)
											}}
										>
											Edit
										</button>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{tab === 'bv' && (
					<div className="admin-section">
						<h2 className="admin-section-title">Booze & Vinyl</h2>
						<BVForm apiKey={apiKey} recipes={recipes} onSave={refreshRecipes} />
					</div>
				)}

				{tab === 'stats' && (
					<div className="admin-section">
						<h2 className="admin-section-title">Stats</h2>
						<StatsDashboard stats={stats} />
					</div>
				)}

				{tab === 'featured' && (
					<div className="admin-section">
						<h2 className="admin-section-title">Featured Menu</h2>
						<FeaturedMenuForm apiKey={apiKey} />
					</div>
				)}
			</main>
		</div>
	)
}

export default Admin