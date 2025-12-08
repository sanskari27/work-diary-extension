import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ReleasesPage from './pages/ReleasesPage';

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path='/' element={<HomePage />} />
				<Route path='/releases' element={<ReleasesPage />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
