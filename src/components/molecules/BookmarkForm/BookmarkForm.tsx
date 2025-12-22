import { LoadingSpinner } from '@/components/atoms';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible } from '@/components/ui/custom-collapsible';
import { Input } from '@/components/ui/input';
import { detectBookmarkType } from '@/lib/bookmarkUtils';
import { Bookmark as BookmarkType } from '@/store/slices/bookmarksSlice';
import { Bookmark, BookmarkPlus, Info } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface BookmarkFormProps {
	title: string;
	url: string;
	existingBookmark?: BookmarkType | null;
	onSave: (data: { name: string; url: string; existingBookmarkId?: string }) => void;
}

const BookmarkForm = ({ title, url, existingBookmark, onSave }: BookmarkFormProps) => {
	const [bookmarkName, setBookmarkName] = useState(title);
	const [isBookmarking, setIsBookmarking] = useState(false);

	// Detect bookmark type and suggest group
	const bookmarkType = useMemo(() => detectBookmarkType(url), [url]);

	// Update bookmark name when title or existing bookmark changes
	useEffect(() => {
		if (existingBookmark) {
			setBookmarkName(existingBookmark.name);
		} else {
			setBookmarkName(title);
		}
	}, [existingBookmark, title]);

	const handleSaveBookmark = () => {
		if (isBookmarking) return;

		const trimmedName = bookmarkName.trim();
		if (!trimmedName) {
			// If name is empty, use the title or existing bookmark name
			setBookmarkName(existingBookmark?.name || title);
			return;
		}

		setIsBookmarking(true);

		onSave({
			name: trimmedName,
			url,
			existingBookmarkId: existingBookmark?.id,
		});

		// Reset after a brief delay for visual feedback
		setTimeout(() => {
			setIsBookmarking(false);
		}, 500);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleSaveBookmark();
		}
	};

	return (
		<Collapsible
			header={
				<h3 className='text-white font-semibold flex items-center gap-2'>
					<BookmarkPlus className='w-4 h-4 text-text-accent' />
					Bookmark Current Tab
				</h3>
			}
			defaultOpen={false}
		>
			<div className='space-y-3'>
				{/* Detected Type and Suggested Group */}
				{!existingBookmark && (
					<div className='flex items-center gap-2 flex-wrap'>
						<Badge
							variant='outline'
							className='text-xs border-white/20 text-text-secondary/70 flex items-center gap-1'
						>
							<Info className='w-3 h-3' />
							Type: <span className='capitalize font-medium'>{bookmarkType}</span>
						</Badge>
					</div>
				)}

				<Input
					type='text'
					value={bookmarkName}
					onChange={(e) => setBookmarkName(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder='Enter bookmark name...'
					className='w-full glass-strong text-white placeholder:text-text-secondary/50 text-sm'
				/>
				<Button
					onClick={handleSaveBookmark}
					disabled={!url || isBookmarking || !bookmarkName.trim()}
					className='w-full bg-primary hover:bg-primary-hover text-white disabled:bg-primary/50 disabled:cursor-not-allowed'
					size='sm'
				>
					{isBookmarking ? (
						<>
							<LoadingSpinner size='sm' />
							{existingBookmark ? 'Updating...' : 'Bookmarking...'}
						</>
					) : existingBookmark ? (
						<>
							<Bookmark className='w-4 h-4' />
							Update Bookmark
						</>
					) : (
						<>
							<Bookmark className='w-4 h-4' />
							Bookmark Tab
						</>
					)}
				</Button>
			</div>
		</Collapsible>
	);
};

export default BookmarkForm;
