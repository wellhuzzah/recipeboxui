function LetterBoard({ recipe, message, children, onClick }) {
	return (
		<div className="letterboard" onClick={onClick}>
			<div className="letterboard-inner">
				{children
					? <div className="letterboard-body">{children}</div>
					: <>
						{!message && <div className="letterboard-label letterboard-header">Now Serving</div>}
						<div className="letterboard-name">{message ?? recipe.name}</div>
						{!message && recipe?.description && (
							<div className="letterboard-desc">{recipe.description}</div>
						)}
					</>
				}
			</div>
		</div>
	)
}

export default LetterBoard