import { HashRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './components/providers/ThemeProvider';
import ActivePrsPage from './pages/ActivePrsPage';
import BookmarksPage from './pages/BookmarksPage';
import BrainDumpsPage from './pages/BrainDumpsPage';
import HomePage from './pages/HomePage';
import ReleasesPage from './pages/ReleasesPage';
import TodosPage from './pages/TodosPage';
import UtilitiesPage from './pages/UtilitiesPage';

function App() {
	return (
		<ThemeProvider>
			<HashRouter>
				<Routes>
					<Route path='/' element={<HomePage />} />
					<Route path='/prs' element={<ActivePrsPage />} />
					<Route path='/releases' element={<ReleasesPage />} />
					<Route path='/todos' element={<TodosPage />} />
					<Route path='/bookmarks' element={<BookmarksPage />} />
					<Route path='/brain-dumps' element={<BrainDumpsPage />} />
					<Route path='/utilities' element={<UtilitiesPage />} />
				</Routes>
			</HashRouter>
		</ThemeProvider>
	);
}

export default App;
