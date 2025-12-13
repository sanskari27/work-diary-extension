import { SearchBar } from '@/components/atoms';
import { MasterSearchBadge } from '@/components/organisms';
import { Button } from '@/components/ui/button';
import { MasterSearchResult, useMasterSearch } from '@/hooks/useMasterSearch';
import { getDateAfterDays } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Bookmark } from '@/store/slices/bookmarksSlice';
import { ReleaseEvent, ReleaseItem } from '@/store/slices/releasesSlice';
import { addTodo, Todo } from '@/store/slices/todosSlice';
import { setSearchQuery } from '@/store/slices/uiSlice';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePageSearch = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const searchQuery = useAppSelector((state) => state.ui.searchQuery);
	const compactMode = useAppSelector((state) => state.settings.appearanceSettings.compactMode);
	const releases = useAppSelector((state) => state.releases.events);
	const reminderPreferences = useAppSelector((state) => state.settings.reminderPreferences);

	// Check if query starts with "TODO" (case-sensitive)
	const trimmedQuery = searchQuery.trim().toLowerCase();
	const isTodoQuery = trimmedQuery.startsWith('todo');
	const todoTitle = isTodoQuery
		? trimmedQuery.substring(4).trim() // Remove "TODO" prefix and trim
		: '';

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		dispatch(setSearchQuery(e.target.value));
	};

	const handleClear = () => {
		dispatch(setSearchQuery(''));
	};

	const handleCreateTodo = () => {
		if (!todoTitle) {
			return; // Don't create if there's no title
		}

		const todoData = {
			title: todoTitle,
			date: getDateAfterDays(5), // Default to 5 days from now
			description: '',
			isUrgent: false,
			status: 'pending' as const,
			reminderEnabled: reminderPreferences.defaultReminderEnabled,
			reminderDelta: reminderPreferences.defaultReminderEnabled
				? reminderPreferences.defaultReminderDelta
				: undefined,
		};

		dispatch(addTodo(todoData));
		dispatch(setSearchQuery('')); // Clear the search query after creating
	};

	const handleResultClick = (result: MasterSearchResult) => {
		dispatch(setSearchQuery(''));

		if (result.type === 'bookmark') {
			const bookmark = result.result as Bookmark;
			// Open bookmark in the same tab
			window.location.href = bookmark.pageUrl;
		} else if (result.type === 'release') {
			const releaseResult = result.result as ReleaseEvent | ReleaseItem;

			// Check if it's a ReleaseEvent or ReleaseItem
			if ('title' in releaseResult) {
				// It's a ReleaseEvent
				const releaseEvent = releaseResult as ReleaseEvent;
				navigate(`/releases?expand=${releaseEvent.id}`);
			} else {
				// It's a ReleaseItem - need to find the parent ReleaseEvent
				const releaseItem = releaseResult as ReleaseItem;
				const parentRelease = releases.find((event) =>
					event.items.some((item) => item.id === releaseItem.id)
				);

				if (parentRelease) {
					navigate(`/releases?expand=${parentRelease.id}&itemId=${releaseItem.id}`);
				} else {
					navigate('/releases');
				}
			}
		} else if (result.type === 'todo') {
			const todo = result.result as Todo;
			navigate(`/todos?todoId=${todo.id}`);
		}
	};

	const handleSearchComplete = (query: string) => {
		if (query.startsWith('todo')) {
			handleCreateTodo();
		}
	};

	// Use master search hook with limit
	const searchResults = useMasterSearch(searchQuery, { limit: compactMode ? 7 : 5 });

	// Build actions array - Create Todo button when query starts with TODO
	const actions: React.ReactNode[] = [];
	if (isTodoQuery && todoTitle.length > 0) {
		actions.push(
			<Button
				key='create-todo'
				variant='gradient'
				onClick={handleCreateTodo}
				className='text-sm font-medium '
			>
				Create Todo
			</Button>
		);
	}

	return (
		<div className='w-full max-w-2xl px-4 space-y-4 relative'>
			{/* Search Bar */}
			<SearchBar
				value={searchQuery}
				onChange={handleSearchChange}
				onClear={handleClear}
				actions={actions}
				onComplete={handleSearchComplete}
				containerClassName='w-full rounded-full'
				className='text-base h-12'
				autoFocus
				placeholder='Search...'
			/>

			{/* Search Results */}
			<AnimatePresence>
				{searchQuery && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.2 }}
						className='absolute w-full max-h-[400px] overflow-y-auto custom-scrollbar'
					>
						{searchResults.length > 0 ? (
							<div className='flex flex-wrap gap-2 justify-center'>
								{searchResults.map((result, index) => {
									// Generate unique key based on type and result id
									const key =
										result.type === 'bookmark'
											? `bookmark-${(result.result as any).id}`
											: result.type === 'release'
											? `release-${(result.result as any).id}`
											: `todo-${(result.result as any).id}`;
									return (
										<MasterSearchBadge
											key={key}
											result={result}
											index={index}
											onClick={() => handleResultClick(result)}
										/>
									);
								})}
							</div>
						) : (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								className={cn(
									'text-center text-text-secondary/50 text-sm py-8',
									isTodoQuery && 'hidden'
								)}
							>
								No results found for &quot;{searchQuery}&quot;
							</motion.div>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default HomePageSearch;
