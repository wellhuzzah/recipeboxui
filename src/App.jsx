import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import RecipePage from './pages/RecipePage'
import Admin from './pages/Admin'
import BoozeAndVinylPage from './pages/BoozeAndVinylPage'
import BoozeAndVinylDetail from './pages/BoozeAndVinylDetail'

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/recipes/:id" element={<RecipePage />} />
				<Route path="/admin" element={<Admin />} />
				<Route path="/booze-and-vinyl" element={<BoozeAndVinylPage />} />
				<Route path="/booze-and-vinyl/:id" element={<BoozeAndVinylDetail />} />
			</Routes>
		</BrowserRouter>
	)
}

export default App