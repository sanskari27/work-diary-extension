import { AnimatedBackgroundOrbs, PopupHeader } from '@/components/atoms';
import { BookmarkForm, BookmarkGroupForm, BrainDumpForm } from '@/components/molecules';
import { Collapsible } from '@/components/ui/custom-collapsible';
import { getCurrentTab } from '@/lib/chromeUtils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addBookmark, updateBookmark } from '@/store/slices/bookmarksSlice';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
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
		getCurrentTab()
			.then((tab) => {
				if (tab) {
					setCurrentTab({
						title: tab.title,
						url: tab.url,
					});
				}
			})
			.catch((error) => {
				console.error('Error getting current tab:', error);
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
					className='flex-1 flex flex-col gap-4 overflow-y-auto'
				>
					{/* Instant Brain Dump - Pressure Valve */}
					<Collapsible
						header={
							<h3 className='text-white font-semibold flex items-center gap-2'>
								<Brain className='w-4 h-4 text-text-accent' />
								Instant Brain Dump
							</h3>
						}
						defaultOpen={true}
					>
						<BrainDumpForm />
					</Collapsible>

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
