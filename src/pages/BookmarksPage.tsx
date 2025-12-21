import { SearchBar, Text } from '@/components/atoms';
import { BookmarkCard, BookmarkGroupCard } from '@/components/organisms';
import { PageLayout } from '@/components/templates';
import { useAppearanceStyles } from '@/hooks/useAppearanceStyles';
import { openUrlsAsTabGroup, openUrlsInNewWindow } from '@/lib/chromeUtils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
	Bookmark,
	BookmarkGroup,
	deleteBookmark,
	deleteBookmarkGroup,
	updateBookmark,
	updateBookmarkGroup,
} from '@/store/slices/bookmarksSlice';
import { motion } from 'framer-motion';
import { Bookmark as BookmarkIcon, FolderOpen } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function BookmarksPage() {
	const dispatch = useAppDispatch();
	const bookmarks = useAppSelector((state) => state.bookmarks.bookmarks) || [];
	const groups = useAppSelector((state) => state.bookmarks.groups) || [];
	const { appearance, page: spacing } = useAppearanceStyles();
	const [searchQuery, setSearchQuery] = useState('');

	// Sort and filter bookmarks
	const filteredBookmarks = useMemo(() => {
		let filtered = [...bookmarks];

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase().trim();
			filtered = filtered.filter(
				(bookmark) =>
					bookmark.name.toLowerCase().includes(query) ||
					bookmark.pageUrl.toLowerCase().includes(query)
			);
		}

		// Sort by creation date (newest first)
		return filtered.sort((a, b) => b.createdAt - a.createdAt);
	}, [bookmarks, searchQuery]);

	// Sort and filter groups
	const filteredGroups = useMemo(() => {
		let filtered = [...groups];

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase().trim();
			filtered = filtered.filter((group) => group.name.toLowerCase().includes(query));
		}

		// Sort by creation date (newest first)
		return filtered.sort((a, b) => b.createdAt - a.createdAt);
	}, [groups, searchQuery]);

	const handleDelete = (bookmarkId: string) => {
		dispatch(deleteBookmark(bookmarkId));
	};

	const handleUpdate = (bookmarkId: string, updates: Partial<Bookmark>) => {
		dispatch(updateBookmark({ id: bookmarkId, updates }));
	};

	const handleDeleteGroup = (groupId: string) => {
		dispatch(deleteBookmarkGroup(groupId));
	};

	const handleUpdateGroup = (groupId: string, updates: Partial<BookmarkGroup>) => {
		dispatch(updateBookmarkGroup({ id: groupId, updates }));
	};

	const handleOpenGroup = async (group: BookmarkGroup, event?: React.MouseEvent) => {
		if (group.items.length === 0) return;

		const urls = group.items.map((item) => item.url);
		const isModifierPressed = event?.ctrlKey || event?.metaKey;

		try {
			if (isModifierPressed) {
				// Open in new window if Ctrl/Cmd is pressed
				await openUrlsInNewWindow(urls);
			} else {
				// Open in current window as Chrome tab group
				await openUrlsAsTabGroup(urls, group.name, 'blue');
			}
		} catch (error) {
			console.error('Error opening bookmark group:', error);
		}
	};

	return (
		<PageLayout>
			<div className={`min-h-screen ${spacing.padding} flex flex-col`}>
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5 }}
					className='max-w-7xl mx-auto w-full flex-1 flex flex-col'
				>
					{/* Page Header */}
					<motion.div
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className={`${spacing.headerMargin} flex items-center justify-between`}
					>
						<div className='flex items-center gap-4'>
							{!appearance.minimalMode && (
								<motion.div
									animate={{
										scale: [1, 1.05, 1],
										rotate: [0, 5, 0],
									}}
									transition={{
										duration: 3,
										repeat: Infinity,
										ease: 'easeInOut',
									}}
									className={`${
										appearance.compactMode ? 'p-3' : 'p-4'
									} rounded-2xl bg-icon-gradient`}
								>
									<BookmarkIcon className={spacing.iconSize + ' text-white'} />
								</motion.div>
							)}
							<Text
								variant='h1'
								className={`${spacing.titleSize} font-black bg-clip-text text-transparent bg-gradient-text`}
							>
								Bookmarks
							</Text>
						</div>
					</motion.div>

					{/* Search Bar */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						className={`${spacing.headerMargin}`}
					>
						<SearchBar
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							onClear={() => setSearchQuery('')}
							placeholder='Search bookmarks and groups by name or URL...'
							className='w-full'
						/>
					</motion.div>

					{/* Stats */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.25 }}
						className={`${spacing.headerMargin} flex flex-wrap gap-${
							appearance.compactMode ? '4' : '6'
						} items-center`}
					>
						<div className='flex items-center gap-2'>
							<span className='text-sm text-text-secondary'>
								{searchQuery.trim() ? 'Filtered:' : 'Total:'}
							</span>
							<span className='text-2xl font-bold text-white'>
								{searchQuery.trim()
									? filteredBookmarks.length + filteredGroups.length
									: bookmarks.length + groups.length}
							</span>
							{searchQuery.trim() && (
								<span className='text-sm text-text-secondary/60'>
									of {bookmarks.length + groups.length}
								</span>
							)}
						</div>
						<div className='flex items-center gap-2'>
							<span className='text-sm text-text-secondary'>Groups:</span>
							<span className='text-2xl font-bold text-white'>
								{searchQuery.trim() ? filteredGroups.length : groups.length}
							</span>
						</div>
					</motion.div>

					{/* Content Area */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.3 }}
						className={`flex-1 ${appearance.compactMode ? 'pb-4' : 'pb-8'}`}
					>
						{filteredBookmarks.length > 0 || filteredGroups.length > 0 ? (
							<div className='space-y-6'>
								{/* Bookmark Groups Section */}
								{filteredGroups.length > 0 && (
									<div>
										<h2 className='text-lg font-semibold text-text-secondary mb-3 flex items-center gap-2'>
											<FolderOpen className='w-5 h-5 text-text-accent' />
											Groups
										</h2>
										<div className='flex flex-wrap gap-3'>
											{filteredGroups.map((group, index) => (
												<motion.div
													key={group.id}
													initial={{ opacity: 0, y: 20 }}
													animate={{ opacity: 1, y: 0 }}
													transition={{ delay: index * 0.02 }}
													className='h-fill-available'
												>
													<BookmarkGroupCard
														group={group}
														onDelete={handleDeleteGroup}
														onUpdate={handleUpdateGroup}
														onOpenGroup={handleOpenGroup}
													/>
												</motion.div>
											))}
										</div>
									</div>
								)}

								{/* Bookmarks Section */}
								{filteredBookmarks.length > 0 && (
									<div>
										{filteredGroups.length > 0 && (
											<h2 className='text-lg font-semibold text-text-secondary mb-3 flex items-center gap-2'>
												<BookmarkIcon className='w-5 h-5 text-text-accent' />
												Bookmarks
											</h2>
										)}
										<div className='flex flex-wrap gap-3'>
											{filteredBookmarks.map((bookmark, index) => (
												<motion.div
													key={bookmark.id}
													initial={{ opacity: 0, y: 20 }}
													animate={{ opacity: 1, y: 0 }}
													transition={{ delay: index * 0.02 }}
													className='h-fill-available'
												>
													<BookmarkCard
														bookmark={bookmark}
														onDelete={handleDelete}
														onUpdate={handleUpdate}
													/>
												</motion.div>
											))}
										</div>
									</div>
								)}
							</div>
						) : searchQuery.trim() ? (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.4 }}
								className='flex-1 flex items-center justify-center'
							>
								<div className='text-center space-y-4'>
									<BookmarkIcon className='w-16 h-16 text-text-accent/40 mx-auto' />
									<div className='space-y-2'>
										<h3 className='text-2xl font-semibold text-text-secondary'>No results found</h3>
										<p className='text-text-secondary/50'>Try adjusting your search query</p>
									</div>
								</div>
							</motion.div>
						) : (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.4 }}
								className='flex-1 flex items-center justify-center'
							>
								<div className='text-center space-y-4'>
									<BookmarkIcon className='w-16 h-16 text-text-accent/40 mx-auto' />
									<div className='space-y-2'>
										<h3 className='text-2xl font-semibold text-text-secondary'>No bookmarks yet</h3>
										<p className='text-text-secondary/50'>
											Use the extension popup to bookmark your favorite pages
										</p>
									</div>
								</div>
							</motion.div>
						)}
					</motion.div>
				</motion.div>
			</div>
		</PageLayout>
	);
}
