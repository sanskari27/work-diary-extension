import { HashRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './components/providers/ThemeProvider';
import ActivePrsPage from './pages/ActivePrsPage';
import BookmarksPage from './pages/BookmarksPage';
import HomePage from './pages/HomePage';
import ReleasesPage from './pages/ReleasesPage';
import TodosPage from './pages/TodosPage';

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
				</Routes>
			</HashRouter>
		</ThemeProvider>
	);
}

export default App;
