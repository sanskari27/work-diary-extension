import { HashRouter, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ReleasesPage from './pages/ReleasesPage';

function App() {
	return (
		<HashRouter>
			<Routes>
				<Route path='/' element={<HomePage />} />
				<Route path='/releases' element={<ReleasesPage />} />
			</Routes>
		</HashRouter>
	);
}

export default App;
