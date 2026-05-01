function RecipeCard({ recipe, onClick }) {
	return (
		<div className="recipe-card" onClick={onClick}>
			{recipe.now_serving && (
				<span className="now-serving-badge">Now Serving</span>
			)}
			<div className="recipe-card-header">
				<h2 className="recipe-card-title">{recipe.name}</h2>
				{recipe.description && (
					<p className="recipe-card-description">{recipe.description}</p>
				)}
			</div>

			{recipe.tags && recipe.tags.length > 0 && (
				<div className="recipe-card-tags">
					{recipe.tags.map(tag => (
						<span key={tag} className="tag">{tag}</span>
					))}
				</div>
			)}

			{recipe.artist && (
				<div className="recipe-card-bv">
					<svg
						className="bv-vinyl-stamp-inline"
						width="28" height="28"
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
					{recipe.artist} — {recipe.album} (Vol. {recipe.volume}, Side {recipe.side})
				</div>
			)}

			{recipe.original && (
				<div className="original-signature">L</div>
			)}
		</div>
	)
}

export default RecipeCard
