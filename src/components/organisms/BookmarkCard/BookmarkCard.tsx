import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFavicon } from '@/hooks/useFavicon';
import { cn } from '@/lib/utils';
import { Bookmark } from '@/store/slices/bookmarksSlice';
import { motion } from 'framer-motion';
import { Pencil, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface BookmarkCardProps {
	bookmark: Bookmark;
	onDelete: (bookmarkId: string) => void;
	onUpdate: (bookmarkId: string, updates: Partial<Bookmark>) => void;
}

export default function BookmarkCard({ bookmark, onDelete, onUpdate }: BookmarkCardProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [editName, setEditName] = useState(bookmark.name);
	const inputRef = useRef<HTMLInputElement>(null);
	const faviconUrl = useFavicon(bookmark.pageUrl);

	// Focus input when editing starts
	useEffect(() => {
		if (isEditing && inputRef.current) {
			inputRef.current.focus();
			inputRef.current.select();
		}
	}, [isEditing]);

	// Update editName when bookmark name changes externally
	useEffect(() => {
		if (!isEditing) {
			setEditName(bookmark.name);
		}
	}, [bookmark.name, isEditing]);

	const handleOpenLink = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!isEditing) {
			window.open(bookmark.pageUrl, '_blank', 'noopener,noreferrer');
		}
	};

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (window.confirm('Are you sure you want to delete this bookmark?')) {
			onDelete(bookmark.id);
		}
	};

	const handleEdit = (e: React.MouseEvent) => {
		e.stopPropagation();
		setIsEditing(true);
		setEditName(bookmark.name);
	};

	const handleSave = () => {
		const trimmedName = editName.trim();
		if (trimmedName && trimmedName !== bookmark.name) {
			onUpdate(bookmark.id, { name: trimmedName });
		}
		setIsEditing(false);
	};

	const handleCancel = () => {
		setEditName(bookmark.name);
		setIsEditing(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleSave();
		} else if (e.key === 'Escape') {
			e.preventDefault();
			handleCancel();
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
				'h-full group relative rounded-xl glass-strong p-2.5 cursor-pointer',
				'border border-white/20 shadow-lg hover:shadow-xl transition-all',
				'flex flex-col',
				isEditing ? 'min-w-[24rem]' : 'w-[10rem]'
			)}
			onClick={handleOpenLink}
		>
			{/* Content */}
			<div className='flex-1 flex flex-col justify-between min-h-0'>
				{/* Favicon and Title */}
				<div className='mb-1.5 flex items-start gap-1.5'>
					{faviconUrl && (
						<img
							src={faviconUrl}
							alt=''
							className='w-3.5 h-3.5 rounded flex-shrink-0 mt-0.5'
							onError={(e) => {
								// Hide image on error
								e.currentTarget.style.display = 'none';
							}}
						/>
					)}
					{isEditing ? (
						<Input
							ref={inputRef}
							value={editName}
							onChange={(e) => setEditName(e.target.value)}
							onBlur={handleSave}
							onKeyDown={handleKeyDown}
							className='text-xs h-6 px-1.5 py-0.5 bg-white/10 border-glass-border-strong text-white placeholder:text-white/50 focus-visible:ring-primary/50 flex-1'
							onClick={(e) => e.stopPropagation()}
						/>
					) : (
						<h3
							className='text-xs font-semibold text-white group-hover:text-text-primary transition-colors line-clamp-2 leading-tight flex-1'
							title={bookmark.name}
						>
							{bookmark.name}
						</h3>
					)}
				</div>

				{/* Domain */}
				<div className='mb-auto'>
					<p className='text-[10px] text-text-secondary/70 truncate' title={bookmark.pageUrl}>
						{getDomain(bookmark.pageUrl)}
					</p>
				</div>

				{/* Actions - Show on hover */}
				<div
					className={cn(
						'flex items-center justify-end gap-1.5 mt-1.5 transition-opacity group-hover:opacity-100',
						isEditing ? 'opacity-100' : 'opacity-0'
					)}
				>
					{!isEditing && (
						<Button
							size='icon'
							variant='ghost'
							className='h-6 w-6 p-0 border border-glass-border text-text-accent/80 hover:text-text-primary hover:bg-primary/10'
							onClick={handleEdit}
						>
							<Pencil className='h-2.5 w-2.5' />
						</Button>
					)}
					{!isEditing && (
						<Button
							size='icon'
							variant='ghost'
							className='h-6 w-6 p-0 border border-red-500/30 text-red-400/80 hover:text-red-300 hover:bg-red-500/10'
							onClick={handleDelete}
						>
							<Trash2 className='h-2.5 w-2.5' />
						</Button>
					)}
				</div>
			</div>
		</motion.div>
	);
}
