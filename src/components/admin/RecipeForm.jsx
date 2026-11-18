import { useState, useEffect } from 'react'
import { createRecipe, updateRecipe, deleteRecipe } from '../../api/recipes'

const EMPTY_RECIPE = {
	name: '',
	description: '',
	method: '',
	glassware: '',
	garnish: '',
	notes: '',
	now_serving: false,
	original: false,
	ingredients: [],
	tags: []
}

function RecipeForm({ recipe, apiKey, onSave, onCancel }) {
	const isNew = !recipe.id
	const [form, setForm] = useState({ ...EMPTY_RECIPE, ...recipe })
	const [tagInput, setTagInput] = useState('')
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState(null)
	const [confirmDelete, setConfirmDelete] = useState(false)

	const set = (field, value) => setForm(f => ({ ...f, [field]: value }))

	const addIngredient = () => {
		setForm(f => ({
			...f,
			ingredients: [...f.ingredients, { name: '', amount: '', unit: '', optional: false }]
		}))
	}

	const updateIngredient = (i, field, value) => {
		setForm(f => {
			const ingredients = [...f.ingredients]
			ingredients[i] = { ...ingredients[i], [field]: value }
			return { ...f, ingredients }
		})
	}

	const removeIngredient = (i) => {
		setForm(f => ({
			...f,
			ingredients: f.ingredients.filter((_, idx) => idx !== i)
		}))
	}

	const addTag = (e) => {
		if (e.key === 'Enter' && tagInput.trim()) {
			e.preventDefault()
			const tag = tagInput.trim().toLowerCase()
			if (!form.tags.includes(tag)) {
				set('tags', [...form.tags, tag])
			}
			setTagInput('')
		}
	}

	const removeTag = (tag) => {
		set('tags', form.tags.filter(t => t !== tag))
	}

	const handleSave = async () => {
		if (!form.name.trim()) {
			setError('Name is required.')
			return
		}
		setSaving(true)
		setError(null)
		try {
			const payload = {
				...form,
				ingredients: form.ingredients.map(ing => ({
					...ing,
					amount: ing.amount === '' ? null : parseFloat(ing.amount)
				}))
			}
			if (isNew) {
				await createRecipe(payload, apiKey)
			} else {
				await updateRecipe(recipe.id, payload, apiKey)
			}
			onSave()
		} catch (err) {
			setError('Save failed. Check your API key or try again.')
		} finally {
			setSaving(false)
		}
	}

	const handleDelete = async () => {
		if (!confirmDelete) {
			setConfirmDelete(true)
			return
		}
		try {
			await deleteRecipe(recipe.id, apiKey)
			onSave()
		} catch {
			setError('Delete failed.')
		}
	}

	return (
		<div className="recipe-form">
			<h3 className="recipe-form-title">{isNew ? 'New Recipe' : `Editing: ${recipe.name}`}</h3>

			{error && <p className="recipe-form-error">{error}</p>}

			<div className="form-grid">
				<div className="form-field full">
					<label>Name</label>
					<input className="admin-input" value={form.name} onChange={e => set('name', e.target.value)} />
				</div>
				<div className="form-field full">
					<label>Description</label>
					<input className="admin-input" value={form.description || ''} onChange={e => set('description', e.target.value)} />
				</div>
				<div className="form-field full">
					<label>Method</label>
					<textarea className="admin-input admin-textarea" value={form.method || ''} onChange={e => set('method', e.target.value)} />
				</div>
				<div className="form-field">
					<label>Glassware</label>
					<input className="admin-input" value={form.glassware || ''} onChange={e => set('glassware', e.target.value)} />
				</div>
				<div className="form-field">
					<label>Garnish</label>
					<input className="admin-input" value={form.garnish || ''} onChange={e => set('garnish', e.target.value)} />
				</div>
				<div className="form-field full">
					<label>Notes</label>
					<textarea className="admin-input admin-textarea" value={form.notes || ''} onChange={e => set('notes', e.target.value)} />
				</div>
				<div className="form-field form-checkbox">
					<label>
						<input type="checkbox" checked={form.now_serving} onChange={e => set('now_serving', e.target.checked)} />
						Now Serving
					</label>
				</div>
				<div className="form-field form-checkbox">
					<label>
						<input type="checkbox" checked={form.original} onChange={e => set('original', e.target.checked)} />
						Original
					</label>
				</div>
			</div>

			<div className="form-section">
				<div className="form-section-header">
					<h4 className="form-section-title">Ingredients</h4>
					<button className="admin-btn-secondary" onClick={addIngredient}>+ Add</button>
				</div>
				{form.ingredients.map((ing, i) => (
					<div key={i} className="ingredient-form-row">
						<input className="admin-input" placeholder="Amount" value={ing.amount} onChange={e => updateIngredient(i, 'amount', e.target.value)} />
						<input className="admin-input" placeholder="Unit" value={ing.unit} onChange={e => updateIngredient(i, 'unit', e.target.value)} />
						<input className="admin-input ing-name" placeholder="Ingredient" value={ing.name} onChange={e => updateIngredient(i, 'name', e.target.value)} />
						<label className="ing-optional">
							<input type="checkbox" checked={ing.optional} onChange={e => updateIngredient(i, 'optional', e.target.checked)} />
							Optional
						</label>
						<button className="admin-btn-danger" onClick={() => removeIngredient(i)}>✕</button>
					</div>
				))}
			</div>

			<div className="form-section">
				<h4 className="form-section-title">Tags</h4>
				<input
					className="admin-input"
					placeholder="Type a tag and press Enter"
					value={tagInput}
					onChange={e => setTagInput(e.target.value)}
					onKeyDown={addTag}
				/>
				<div className="form-tags">
					{form.tags.map(tag => (
						<span key={tag} className="form-tag">
							{tag} <button onClick={() => removeTag(tag)}>✕</button>
						</span>
					))}
				</div>
			</div>

			<div className="form-actions">
				{!isNew && (
					<button
						className={`admin-btn-danger ${confirmDelete ? 'confirming' : ''}`}
						onClick={handleDelete}
					>
						{confirmDelete ? 'Confirm Delete' : 'Delete'}
					</button>
				)}
				<div className="form-actions-right">
					<button className="admin-btn-secondary" onClick={onCancel}>Cancel</button>
					<button className="admin-btn-primary" onClick={handleSave} disabled={saving}>
						{saving ? 'Saving...' : 'Save Recipe'}
					</button>
				</div>
			</div>
		</div>
	)
}

export default RecipeForm