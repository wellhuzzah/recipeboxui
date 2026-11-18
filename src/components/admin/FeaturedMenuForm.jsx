import { useState, useEffect, useRef } from 'react'
import { getFeaturedMenu, updateFeaturedMenu, getFeaturedRecipes, getTags } from '../../api/recipes'
import client from '../../api/client'

export default function FeaturedMenuForm({ apiKey }) {
    const [title, setTitle] = useState('Seasonal Menu')
    const [active, setActive] = useState(false)
    const [tags, setTags] = useState([])
    const [recipeIds, setRecipeIds] = useState([])
    const [allTags, setAllTags] = useState([])
    const [matchCount, setMatchCount] = useState(null)
    const [saved, setSaved] = useState(false)
    const [pickedRecipes, setPickedRecipes] = useState([])
    const [filteredRecipes, setFilteredRecipes] = useState([])
    const [recipeSearch, setRecipeSearch] = useState('')
    const searchTimeout = useRef(null)

    useEffect(() => {
        getTags().then(res => setAllTags(res.data))
        getFeaturedMenu().then(res => {
            const d = res.data
            setTitle(d.title)
            setActive(d.active)
            setTags(d.tags || [])
            setRecipeIds(d.recipe_ids || [])
            if (d.recipe_ids?.length > 0) {
                client.get('/recipes/').then(r => {
                    const picks = r.data
                        .filter(rec => d.recipe_ids.includes(rec.id))
                        .map(rec => ({ id: rec.id, name: rec.name }))
                    setPickedRecipes(picks)
                })
            }
        })
    }, [])

    useEffect(() => {
        const q = recipeSearch.trim()
        if (tags.length === 0 && !q) {
            setFilteredRecipes([])
            return
        }
        clearTimeout(searchTimeout.current)
        searchTimeout.current = setTimeout(() => {
            const params = new URLSearchParams()
            if (q) params.set('q', q)
            if (tags.length > 0) params.set('tags', tags.join(','))
            client.get(`/recipes/search-any-tag?${params}`).then(res => setFilteredRecipes(res.data))
        }, 200)
    }, [tags, recipeSearch])

    useEffect(() => {
        if (tags.length === 0 && recipeIds.length === 0) { setMatchCount(null); return }
        getFeaturedRecipes().then(res => setMatchCount(res.data.length))
    }, [tags, recipeIds])

    const toggleTag = (tag) => {
        setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
        setSaved(false)
    }

    const togglePick = (recipe) => {
        const alreadyPicked = recipeIds.includes(recipe.id)
        if (alreadyPicked) {
            setRecipeIds(prev => prev.filter(id => id !== recipe.id))
            setPickedRecipes(prev => prev.filter(r => r.id !== recipe.id))
        } else {
            setRecipeIds(prev => [...prev, recipe.id])
            setPickedRecipes(prev => [...prev, { id: recipe.id, name: recipe.name }])
        }
        setSaved(false)
    }

    const save = async () => {
        await updateFeaturedMenu({ title, active, tags, recipe_ids: recipeIds }, apiKey)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    const showRecipeList = recipeSearch.trim().length > 0 || tags.length > 0

    return (
        <div className="featured-menu-form">
            <div className="fm-toggle-row">
                <label className="fm-toggle-label">
                    <input
                        type="checkbox"
                        checked={active}
                        onChange={e => { setActive(e.target.checked); setSaved(false) }}
                    />
                    <span>Menu active</span>
                </label>
                <span className="fm-status">{active ? 'Showing on home page' : 'Hidden'}</span>
            </div>

            <div className="fm-field">
                <label className="fm-label">Title</label>
                <input
                    className="fm-input"
                    type="text"
                    value={title}
                    onChange={e => { setTitle(e.target.value); setSaved(false) }}
                />
            </div>

            <div className="fm-field">
                <label className="fm-label">Tags — recipes matching any selected tag will appear</label>
                <div className="fm-tag-picker">
                    {allTags.map(t => (
                        <button
                            key={t}
                            className={`fm-tag ${tags.includes(t) ? 'active' : ''}`}
                            onClick={() => toggleTag(t)}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <div className="fm-field">
                <label className="fm-label">Hand-picked recipes — always included regardless of tags</label>

                {pickedRecipes.length > 0 && (
                    <div className="fm-picked-list">
                        {pickedRecipes.map(r => (
                            <div key={r.id} className="fm-picked-chip">
                                <span>{r.name}</span>
                                <button className="fm-picked-remove" onClick={() => togglePick(r)}>×</button>
                            </div>
                        ))}
                    </div>
                )}

                <input
                    className="fm-input"
                    type="text"
                    placeholder={tags.length > 0 ? 'Search within tag matches, or type to search all…' : 'Select tags above or search by name…'}
                    value={recipeSearch}
                    onChange={e => setRecipeSearch(e.target.value)}
                />

                {showRecipeList && (
                    <div className="fm-recipe-list">
                        {filteredRecipes.length === 0 ? (
                            <p className="fm-recipe-list-empty">No recipes found</p>
                        ) : (
                            filteredRecipes.map(r => {
                                const picked = recipeIds.includes(r.id)
                                return (
                                    <label key={r.id} className={`fm-recipe-row ${picked ? 'picked' : ''}`}>
                                        <span className="fm-recipe-row-check">
                                            <input
                                                type="checkbox"
                                                checked={picked}
                                                onChange={() => togglePick(r)}
                                            />
                                            <span className="fm-recipe-row-in-set">✓</span>
                                        </span>
                                        <span className="fm-recipe-row-name">{r.name}</span>
                                        {r.tags?.length > 0 && (
                                            <span className="fm-recipe-row-tags">{r.tags.join(' · ')}</span>
                                        )}
                                    </label>
                                )
                            })
                        )}
                    </div>
                )}
            </div>

            <div className="fm-footer">
                <span className="fm-count">
                    {matchCount !== null
                        ? `${matchCount} recipes in featured set`
                        : 'No tags or picks — showing random picks'}
                </span>
                <button className="fm-save" onClick={save}>
                    {saved ? 'Saved' : 'Save'}
                </button>
            </div>
        </div>
    )
}
