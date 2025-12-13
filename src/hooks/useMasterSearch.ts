import { useAppSelector } from '@/store/hooks';
import { Bookmark } from '@/store/slices/bookmarksSlice';
import { ReleaseEvent, ReleaseItem } from '@/store/slices/releasesSlice';
import { Todo } from '@/store/slices/todosSlice';
import { useMemo } from 'react';

export type SearchResultType = 'bookmark' | 'release' | 'todo';

export interface MasterSearchResult {
	type: SearchResultType;
	result: Bookmark | ReleaseEvent | Todo | ReleaseItem;
}

/**
 * Hook to search across bookmarks, releases, and todos
 * Priority: bookmarks > releases > todos
 * @param query - Search query string
 * @returns Array of search results with type and result value
 */
export const useMasterSearch = (
	query: string,
	{ limit }: { limit?: number } = {}
): MasterSearchResult[] => {
	const bookmarks = useAppSelector((state) => state.bookmarks.bookmarks);
	const releases = useAppSelector((state) => state.releases.events);
	const todos = useAppSelector((state) => state.todos.todos);

	const results = useMemo(() => {
		if (!query || query.trim().length === 0) {
			return [];
		}

		const searchTerm = query.toLowerCase().trim();
		const searchResults: MasterSearchResult[] = [];

		// Search Bookmarks (Priority 1)
		const bookmarkMatches = bookmarks.filter((bookmark) => {
			const nameMatch = bookmark.name.toLowerCase().includes(searchTerm);
			const urlMatch = bookmark.pageUrl.toLowerCase().includes(searchTerm);
			return nameMatch || urlMatch;
		});

		bookmarkMatches.forEach((bookmark) => {
			searchResults.push({
				type: 'bookmark',
				result: bookmark,
			});
		});

		// Search Releases (Priority 2)
		// Search in release event titles and release items
		releases.forEach((release) => {
			const titleMatch = release.title.toLowerCase().includes(searchTerm);

			// Search in release items
			const matchingItems = release.items.filter((item) => {
				const repoNameMatch = item.repoName.toLowerCase().includes(searchTerm);
				const descriptionMatch = item.description?.toLowerCase().includes(searchTerm);
				const leadMatch = item.leadName?.toLowerCase().includes(searchTerm);
				return repoNameMatch || descriptionMatch || leadMatch;
			});

			// Add release event if title matches
			if (titleMatch) {
				searchResults.push({
					type: 'release',
					result: release,
				});
			}

			// Add matching release items
			matchingItems.forEach((item) => {
				searchResults.push({
					type: 'release',
					result: item,
				});
			});
		});

		// Search Todos (Priority 3)
		const todoMatches = todos.filter((todo) => {
			const titleMatch = todo.title.toLowerCase().includes(searchTerm);
			const descriptionMatch = todo.description?.toLowerCase().includes(searchTerm);
			return titleMatch || descriptionMatch;
		});

		todoMatches.forEach((todo) => {
			searchResults.push({
				type: 'todo',
				result: todo,
			});
		});

		return searchResults;
	}, [query, bookmarks, releases, todos]);

	if (limit) {
		return results.slice(0, limit);
	}
	return results;
};
