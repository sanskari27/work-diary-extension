import { useFavicon } from '@/hooks/useFavicon';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/store/hooks';
import { Bookmark } from '@/store/slices/bookmarksSlice';
import { Bookmark as BookmarkIcon } from 'lucide-react';

interface BookmarkSearchBadgeProps {
	bookmark: Bookmark;
	className?: string;
}

const BookmarkSearchBadge = ({ bookmark, className }: BookmarkSearchBadgeProps) => {
	const faviconUrl = useFavicon(bookmark.pageUrl);
	const compactMode = useAppSelector((state) => state.settings.appearanceSettings.compactMode);

	// Extract domain from URL
	const getDomain = (url: string) => {
		try {
			const urlObj = new URL(url);
			return urlObj.hostname.replace('www.', '');
		} catch {
			return url;
		}
	};

	return (
		<div className={cn('flex items-center', compactMode ? 'gap-1.5' : 'gap-2', className)}>
			{/* Favicon */}
			<div className='flex-shrink-0'>
				{faviconUrl ? (
					<img
						src={faviconUrl}
						alt=''
						className={cn('rounded', compactMode ? 'w-3.5 h-3.5' : 'w-4 h-4')}
						onError={(e) => {
							e.currentTarget.style.display = 'none';
						}}
					/>
				) : (
					<BookmarkIcon
						className={cn('text-purple-400', compactMode ? 'w-3.5 h-3.5' : 'w-4 h-4')}
					/>
				)}
			</div>

			{/* Content */}
			<div className='flex-1 min-w-0'>
				<div
					className={cn('font-medium text-white truncate', compactMode ? 'text-[10px]' : 'text-xs')}
					title={bookmark.name}
				>
					{bookmark.name}
				</div>
				<div
					className={cn('text-purple-300/60 truncate', compactMode ? 'text-[9px]' : 'text-[10px]')}
					title={bookmark.pageUrl}
				>
					{getDomain(bookmark.pageUrl)}
				</div>
			</div>
		</div>
	);
};

export default BookmarkSearchBadge;
