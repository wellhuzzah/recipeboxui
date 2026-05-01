function StatsDashboard({ stats }) {
	if (!stats) return <p style={{ color: 'var(--color-ink-muted)', fontStyle: 'italic' }}>Loading stats...</p>

	const { most_made, most_used_ingredients, most_used_tags, by_month } = stats

	return (
		<div className="stats-dashboard">
			<div className="stats-grid">
				<div className="stats-card">
					<h3 className="stats-card-title">Most Made</h3>
					{most_made.length === 0
						? <p className="stats-empty">No data yet.</p>
						: most_made.map(r => (
							<div key={r.id} className="stats-row">
								<span className="stats-label">{r.name}</span>
								<span className="stats-value">{r.times_made}×</span>
							</div>
						))
					}
				</div>

				<div className="stats-card">
					<h3 className="stats-card-title">Most Used Ingredients</h3>
					{most_used_ingredients.length === 0
						? <p className="stats-empty">No data yet.</p>
						: most_used_ingredients.map(i => (
							<div key={i.name} className="stats-row">
								<span className="stats-label">{i.name}</span>
								<span className="stats-value">{i.times_used}×</span>
							</div>
						))
					}
				</div>

				<div className="stats-card">
					<h3 className="stats-card-title">Most Used Tags</h3>
					{most_used_tags.length === 0
						? <p className="stats-empty">No data yet.</p>
						: most_used_tags.map(t => (
							<div key={t.name} className="stats-row">
								<span className="stats-label">{t.name}</span>
								<span className="stats-value">{t.times_used}×</span>
							</div>
						))
					}
				</div>

				<div className="stats-card">
					<h3 className="stats-card-title">Drinks by Month</h3>
					{by_month.length === 0
						? <p className="stats-empty">No data yet.</p>
						: by_month.map(m => (
							<div key={m.month} className="stats-row">
								<span className="stats-label">{m.month}</span>
								<span className="stats-value">{m.count}</span>
							</div>
						))
					}
				</div>
			</div>
		</div>
	)
}

export default StatsDashboard