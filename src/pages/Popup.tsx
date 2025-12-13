import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addBookmark } from '@/store/slices/bookmarksSlice';
import { motion } from 'framer-motion';
import { Bookmark, BookmarkPlus } from 'lucide-react';
import { useEffect, useState } from 'react';

const Popup = () => {
	const dispatch = useAppDispatch();
	const bookmarks = useAppSelector((state) => state.bookmarks.bookmarks);
	const [currentTab, setCurrentTab] = useState<{ title: string; url: string } | null>(null);
	const [isBookmarking, setIsBookmarking] = useState(false);

	useEffect(() => {
		// Get current tab information
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			if (tabs[0]) {
				// Remove notification count from title (e.g., "(3) Title" or "Title (3)")
				const rawTitle = tabs[0].title || 'Untitled';
				const cleanTitle = rawTitle.replace(/^\(\d+\)\s*/, '').replace(/\s*\(\d+\)$/, '');

				setCurrentTab({
					title: cleanTitle,
					url: tabs[0].url || '',
				});
			}
		});
	}, []);

	const handleBookmarkCurrentTab = () => {
		if (!currentTab || isBookmarking) return;

		// Check if bookmark already exists
		const bookmarkExists = bookmarks.some(
			(b) => b.pageUrl.toLowerCase() === currentTab.url.toLowerCase()
		);

		if (bookmarkExists) {
			return;
		}

		setIsBookmarking(true);
		dispatch(
			addBookmark({
				name: currentTab.title,
				pageUrl: currentTab.url,
			})
		);

		// Reset after a brief delay for visual feedback
		setTimeout(() => {
			setIsBookmarking(false);
		}, 500);
	};

	return (
		<div className='w-[400px] h-[500px] relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden'>
			{/* Animated Background Orbs */}
			<div className='absolute inset-0 overflow-hidden pointer-events-none'>
				<motion.div
					animate={{
						x: [0, 50, 0],
						y: [0, -50, 0],
						scale: [1, 1.1, 1],
					}}
					transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
					className='absolute top-0 left-0 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl'
				/>
				<motion.div
					animate={{
						x: [0, -50, 0],
						y: [0, 50, 0],
						scale: [1, 1.2, 1],
					}}
					transition={{
						duration: 20,
						repeat: Infinity,
						ease: 'easeInOut',
						delay: 1,
					}}
					className='absolute bottom-0 right-0 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl'
				/>
			</div>

			{/* Content */}
			<div className='relative z-10 h-full flex flex-col p-6'>
				{/* Header with Branding */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className='mb-6'
				>
					<h1 className='text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-2'>
						Work Diary
					</h1>
					<p className='text-purple-300/60 text-sm'>Your productivity companion</p>
				</motion.div>

				{/* Features Section */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.1 }}
					className='flex-1 flex flex-col gap-4'
				>
					{/* Bookmark Current Tab Feature */}
					<div className='glass-strong rounded-xl p-4 border border-purple-400/30'>
						<div className='flex items-start justify-between gap-3 mb-3'>
							<div className='flex-1 overflow-hidden'>
								<h3 className='text-white font-semibold mb-1 flex items-center gap-2'>
									<BookmarkPlus className='w-4 h-4 text-purple-400' />
									Bookmark Current Tab
								</h3>
								{currentTab && (
									<div className='text-xs text-purple-300/70 truncate' title={currentTab.title}>
										{currentTab.title}
									</div>
								)}
							</div>
						</div>
						<Button
							onClick={handleBookmarkCurrentTab}
							disabled={
								!currentTab ||
								isBookmarking ||
								bookmarks.some(
									(b) => b.pageUrl.toLowerCase() === (currentTab?.url || '').toLowerCase()
								)
							}
							className='w-full bg-purple-600 hover:bg-purple-700 text-white disabled:bg-purple-800/50 disabled:cursor-not-allowed'
							size='sm'
						>
							{isBookmarking ? (
								<>
									<motion.div
										animate={{ rotate: 360 }}
										transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
										className='w-4 h-4 border-2 border-white border-t-transparent rounded-full'
									/>
									Bookmarking...
								</>
							) : bookmarks.some(
									(b) => b.pageUrl.toLowerCase() === (currentTab?.url || '').toLowerCase()
							  ) ? (
								<>
									<Bookmark className='w-4 h-4' />
									Already Bookmarked
								</>
							) : (
								<>
									<Bookmark className='w-4 h-4' />
									Bookmark Tab
								</>
							)}
						</Button>
					</div>
					{/* Placeholder for future features */}
					<div className='glass rounded-xl p-4 border border-purple-400/20'>
						<p className='text-purple-300/40 text-xs text-center'>More features coming soon...</p>
					</div>
				</motion.div>
			</div>
		</div>
	);
};

export default Popup;
