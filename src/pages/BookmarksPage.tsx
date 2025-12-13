import SearchBar from '@/components/atoms/SearchBar/SearchBar';
import Text from '@/components/atoms/Text/Text';
import BookmarkCard from '@/components/organisms/BookmarkCard/BookmarkCard';
import PageLayout from '@/components/templates/PageLayout/PageLayout';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { deleteBookmark } from '@/store/slices/bookmarksSlice';
import { motion } from 'framer-motion';
import { Bookmark as BookmarkIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function BookmarksPage() {
	const dispatch = useAppDispatch();
	const bookmarks = useAppSelector((state) => state.bookmarks.bookmarks);
	const appearance = useAppSelector((state) => state.settings.appearanceSettings);
	const [searchQuery, setSearchQuery] = useState('');

	// Get spacing based on appearance settings
	const getSpacing = () => {
		if (appearance.compactMode) {
			return {
				padding: 'p-4 md:p-6 lg:p-8',
				sectionGap: 'space-y-4',
				headerMargin: 'mb-4',
				iconSize: 'w-6 h-6',
				titleSize: 'text-4xl md:text-5xl',
			};
		} else if (appearance.cardSize === 'large') {
			return {
				padding: 'p-8 md:p-16 lg:p-20',
				sectionGap: 'space-y-10',
				headerMargin: 'mb-10',
				iconSize: 'w-10 h-10',
				titleSize: 'text-6xl md:text-7xl',
			};
		} else if (appearance.cardSize === 'small') {
			return {
				padding: 'p-4 md:p-8 lg:p-12',
				sectionGap: 'space-y-4',
				headerMargin: 'mb-6',
				iconSize: 'w-6 h-6',
				titleSize: 'text-3xl md:text-4xl',
			};
		}
		return {
			padding: 'p-6 md:p-12 lg:p-16',
			sectionGap: 'space-y-8',
			headerMargin: 'mb-8',
			iconSize: 'w-8 h-8',
			titleSize: 'text-5xl md:text-6xl',
		};
	};

	const spacing = getSpacing();

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

	const handleDelete = (bookmarkId: string) => {
		dispatch(deleteBookmark(bookmarkId));
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
									} rounded-2xl bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500`}
								>
									<BookmarkIcon className={spacing.iconSize + ' text-white'} />
								</motion.div>
							)}
							<Text
								variant='h1'
								className={`${spacing.titleSize} font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent`}
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
							placeholder='Search bookmarks by name or URL...'
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
							<span className='text-sm text-white/70'>
								{searchQuery.trim() ? 'Filtered:' : 'Total:'}
							</span>
							<span className='text-2xl font-bold text-white'>
								{searchQuery.trim() ? filteredBookmarks.length : bookmarks.length}
							</span>
							{searchQuery.trim() && (
								<span className='text-sm text-purple-300/60'>of {bookmarks.length}</span>
							)}
						</div>
					</motion.div>

					{/* Content Area */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.3 }}
						className={`flex-1 ${appearance.compactMode ? 'pb-4' : 'pb-8'}`}
					>
						{filteredBookmarks.length > 0 ? (
							<div className='grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3'>
								{filteredBookmarks.map((bookmark, index) => (
									<motion.div
										key={bookmark.id}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: index * 0.02 }}
									>
										<BookmarkCard bookmark={bookmark} onDelete={handleDelete} />
									</motion.div>
								))}
							</div>
						) : searchQuery.trim() ? (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.4 }}
								className='flex-1 flex items-center justify-center'
							>
								<div className='text-center space-y-4'>
									<BookmarkIcon className='w-16 h-16 text-purple-400/40 mx-auto' />
									<div className='space-y-2'>
										<h3 className='text-2xl font-semibold text-white/70'>No results found</h3>
										<p className='text-purple-300/50'>Try adjusting your search query</p>
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
									<BookmarkIcon className='w-16 h-16 text-purple-400/40 mx-auto' />
									<div className='space-y-2'>
										<h3 className='text-2xl font-semibold text-white/70'>No bookmarks yet</h3>
										<p className='text-purple-300/50'>
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
