import { AnimatedBackgroundOrbs, PopupHeader } from '@/components/atoms';
import { BookmarkForm, BookmarkGroupForm } from '@/components/molecules';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addBookmark, updateBookmark } from '@/store/slices/bookmarksSlice';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

const Popup = () => {
	const dispatch = useAppDispatch();
	const bookmarks = useAppSelector((state) => state.bookmarks.bookmarks);
	const [currentTab, setCurrentTab] = useState<{ title: string; url: string } | null>(null);

	// Find existing bookmark for current tab
	const existingBookmark = useMemo(() => {
		if (!currentTab) return null;
		return bookmarks.find((b) => b.pageUrl.toLowerCase() === currentTab.url.toLowerCase()) || null;
	}, [bookmarks, currentTab]);

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

	const handleSaveBookmark = (data: { name: string; url: string; existingBookmarkId?: string }) => {
		if (data.existingBookmarkId) {
			// Update existing bookmark
			dispatch(
				updateBookmark({
					id: data.existingBookmarkId,
					updates: { name: data.name },
				})
			);
		} else {
			// Add new bookmark
			dispatch(
				addBookmark({
					name: data.name,
					pageUrl: data.url,
				})
			);
		}
	};

	return (
		<div className='w-[400px] bg-black h-[500px] relative overflow-hidden bg-background-gradient'>
			<AnimatedBackgroundOrbs variant='popup' />

			{/* Content */}
			<div className='relative z-10 h-full flex flex-col p-6'>
				<PopupHeader title='Work Diary' subtitle='Your productivity companion' />

				{/* Features Section */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.1 }}
					className='flex-1 flex flex-col gap-4'
				>
					{currentTab && (
						<BookmarkForm
							title={currentTab.title}
							url={currentTab.url}
							existingBookmark={existingBookmark}
							onSave={handleSaveBookmark}
						/>
					)}
					<BookmarkGroupForm />
				</motion.div>
			</div>
		</div>
	);
};

export default Popup;
