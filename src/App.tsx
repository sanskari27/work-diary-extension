import { HashRouter, Route, Routes } from 'react-router-dom';
import BookmarksPage from './pages/BookmarksPage';
import HomePage from './pages/HomePage';
import ReleasesPage from './pages/ReleasesPage';
import TodosPage from './pages/TodosPage';

function App() {
	return (
		<HashRouter>
			<Routes>
				<Route path='/' element={<HomePage />} />
				<Route path='/releases' element={<ReleasesPage />} />
				<Route path='/todos' element={<TodosPage />} />
				<Route path='/bookmarks' element={<BookmarksPage />} />
			</Routes>
		</HashRouter>
	);
}

export default App;
