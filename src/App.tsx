import { lazy, Suspense } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './components/providers/ThemeProvider';

// Lazy load all pages for better initial load performance
const HomePage = lazy(() => import('./pages/HomePage'));
const ActivePrsPage = lazy(() => import('./pages/ActivePrsPage'));
const BookmarksPage = lazy(() => import('./pages/BookmarksPage'));
const BrainDumpsPage = lazy(() => import('./pages/BrainDumpsPage'));
const ReleasesPage = lazy(() => import('./pages/ReleasesPage'));
const TodosPage = lazy(() => import('./pages/TodosPage'));
const UtilitiesPage = lazy(() => import('./pages/UtilitiesPage'));
const VisualNotesPage = lazy(() => import('./pages/VisualNotesPage'));

// Simple loading fallback component
const PageLoader = () => (
	<div className='min-h-screen flex items-center justify-center bg-black'>
		<div className='animate-pulse text-muted-foreground'>Loading...</div>
	</div>
);

function App() {
	return (
		<ThemeProvider>
			<HashRouter>
				<Suspense fallback={<PageLoader />}>
					<Routes>
						<Route path='/' element={<HomePage />} />
						<Route path='/prs' element={<ActivePrsPage />} />
						<Route path='/releases' element={<ReleasesPage />} />
						<Route path='/todos' element={<TodosPage />} />
						<Route path='/bookmarks' element={<BookmarksPage />} />
						<Route path='/brain-dumps' element={<BrainDumpsPage />} />
						<Route path='/utilities' element={<UtilitiesPage />} />
						<Route path='/visual-notes' element={<VisualNotesPage />} />
					</Routes>
				</Suspense>
			</HashRouter>
		</ThemeProvider>
	);
}

export default App;
