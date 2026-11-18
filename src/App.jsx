import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import RecipePage from './pages/RecipePage'
import Admin from './pages/Admin'
import BoozeAndVinylPage from './pages/BoozeAndVinylPage'
import BoozeAndVinylDetail from './pages/BoozeAndVinylDetail'

function App() {
	const bgImages = ['royaltavern.jpg', 'khyberpass.jpg'];
	const bgImage = bgImages[Math.floor(Math.random() * bgImages.length)];
	return (
		<>
			<div className="bg-layer">
				<img src={`/${bgImage}`} alt="" className="bg-image bg-image-sharp" />
				<img src={`/${bgImage}`} alt="" className="bg-image bg-image-blurred" />
				<div className="bg-overlay" />
			</div>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/recipes/:id" element={<RecipePage />} />
					<Route path="/admin" element={<Admin />} />
					<Route path="/booze-and-vinyl" element={<BoozeAndVinylPage />} />
					<Route path="/booze-and-vinyl/:id" element={<BoozeAndVinylDetail />} />
				</Routes>
			</BrowserRouter>
		</>
	)
}

export default App