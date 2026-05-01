import api from './client'

export const getRecipes = () => api.get('/recipes/')
export const getRecipe = (id) => api.get(`/recipes/${id}`)
export const searchRecipes = (params) => api.get('/recipes/search', { params })
export const getNowServing = () => api.get('/recipes/now-serving')
export const getStats = () => api.get('/recipes/stats')

export const createRecipe = (data, apiKey) => api.post('/recipes/', data, {
	headers: { 'X-Api-Key': apiKey }
})

export const updateRecipe = (id, data, apiKey) => api.put(`/recipes/${id}`, data, {
	headers: { 'X-Api-Key': apiKey }
})

export const deleteRecipe = (id, apiKey) => api.delete(`/recipes/${id}`, {
	headers: { 'X-Api-Key': apiKey }
})

export const updateBVStatus = (id, payload) =>
	api.patch(`/booze-and-vinyl/${id}/status`, payload)