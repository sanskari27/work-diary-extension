import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Bookmark } from '@/store/slices/bookmarksSlice';
import { motion } from 'framer-motion';
import { ExternalLink, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface BookmarkCardProps {
	bookmark: Bookmark;
	onDelete: (bookmarkId: string) => void;
}

export default function BookmarkCard({ bookmark, onDelete }: BookmarkCardProps) {
	const [isHovered, setIsHovered] = useState(false);

	const handleOpenLink = (e: React.MouseEvent) => {
		e.stopPropagation();
		window.open(bookmark.pageUrl, '_blank', 'noopener,noreferrer');
	};

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (window.confirm('Are you sure you want to delete this bookmark?')) {
			onDelete(bookmark.id);
		}
	};

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
		<motion.div
			whileHover={{ scale: 1.02, y: -2 }}
			whileTap={{ scale: 0.98 }}
			className={cn(
				'group relative rounded-xl border border-white/20 glass-strong p-2.5 shadow-lg transition-all hover:shadow-xl cursor-pointer flex flex-col'
			)}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			onClick={handleOpenLink}
		>
			{/* Content */}
			<div className='flex-1 flex flex-col justify-between min-h-0'>
				{/* Title */}
				<div className='mb-1.5'>
					<h3
						className='text-xs font-semibold text-white group-hover:text-purple-300 transition-colors line-clamp-2 leading-tight'
						title={bookmark.name}
					>
						{bookmark.name}
					</h3>
				</div>

				{/* Domain */}
				<div className='mb-auto'>
					<p className='text-[10px] text-purple-300/70 truncate' title={bookmark.pageUrl}>
						{getDomain(bookmark.pageUrl)}
					</p>
				</div>

				{/* Actions - Show on hover */}
				<div
					className={cn(
						'flex items-center justify-end gap-1.5 mt-1.5 transition-opacity',
						isHovered ? 'opacity-100' : 'opacity-0'
					)}
				>
					<Button
						size='icon'
						variant='ghost'
						className='h-6 w-6 p-0 border border-white/10 text-white/80 hover:text-white hover:bg-white/10'
						onClick={handleOpenLink}
					>
						<ExternalLink className='h-2.5 w-2.5' />
					</Button>
					<Button
						size='icon'
						variant='ghost'
						className='h-6 w-6 p-0 border border-red-500/30 text-red-400/80 hover:text-red-300 hover:bg-red-500/10'
						onClick={handleDelete}
					>
						<Trash2 className='h-2.5 w-2.5' />
					</Button>
				</div>
			</div>
		</motion.div>
	);
}
