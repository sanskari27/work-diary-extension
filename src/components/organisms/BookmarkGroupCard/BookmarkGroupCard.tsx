import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { BookmarkGroup } from '@/store/slices/bookmarksSlice';
import { motion } from 'framer-motion';
import { ExternalLink, FolderOpen, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface BookmarkGroupCardProps {
	group: BookmarkGroup;
	onDelete: (groupId: string) => void;
	onUpdate: (groupId: string, updates: Partial<BookmarkGroup>) => void;
	onOpenGroup: (group: BookmarkGroup, event?: React.MouseEvent) => void;
}

export default function BookmarkGroupCard({
	group,
	onDelete,
	onUpdate,
	onOpenGroup,
}: BookmarkGroupCardProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [editName, setEditName] = useState(group.name);
	const inputRef = useRef<HTMLInputElement>(null);

	// Focus input when editing starts
	useEffect(() => {
		if (isEditing && inputRef.current) {
			inputRef.current.focus();
			inputRef.current.select();
		}
	}, [isEditing]);

	// Update editName when group name changes externally
	useEffect(() => {
		if (!isEditing) {
			setEditName(group.name);
		}
	}, [group.name, isEditing]);

	const handleOpenGroup = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!isEditing) {
			onOpenGroup(group, e);
		}
	};

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (window.confirm(`Are you sure you want to delete the group "${group.name}"?`)) {
			onDelete(group.id);
		}
	};

	const handleEdit = (e: React.MouseEvent) => {
		e.stopPropagation();
		setIsEditing(true);
		setEditName(group.name);
	};

	const handleSave = () => {
		const trimmedName = editName.trim();
		if (trimmedName && trimmedName !== group.name) {
			onUpdate(group.id, { name: trimmedName });
		}
		setIsEditing(false);
	};

	const handleCancel = () => {
		setEditName(group.name);
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
			onClick={handleOpenGroup}
		>
			{/* Content */}
			<div className='flex-1 flex flex-col justify-between min-h-0'>
				{/* Icon and Title */}
				<div className='mb-1.5 flex items-start gap-1.5'>
					<FolderOpen className='w-3.5 h-3.5 text-text-accent flex-shrink-0 mt-0.5' />
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
							title={group.name}
						>
							{group.name}
						</h3>
					)}
				</div>

				{/* Bookmark count */}
				<div className='mb-auto'>
					<p className='text-[10px] text-text-secondary/70'>
						{group.items.length} bookmark{group.items.length === 1 ? '' : 's'}
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
							title='Edit group name'
						>
							<Pencil className='h-2.5 w-2.5' />
						</Button>
					)}
					{!isEditing && (
						<Button
							size='icon'
							variant='ghost'
							className='h-6 w-6 p-0 border border-glass-border text-text-accent/80 hover:text-text-primary hover:bg-primary/10'
							onClick={handleOpenGroup}
							title='Open all bookmarks in new window'
						>
							<ExternalLink className='h-2.5 w-2.5' />
						</Button>
					)}
					{!isEditing && (
						<Button
							size='icon'
							variant='ghost'
							className='h-6 w-6 p-0 border border-red-500/30 text-red-400/80 hover:text-red-300 hover:bg-red-500/10'
							onClick={handleDelete}
							title='Delete group'
						>
							<Trash2 className='h-2.5 w-2.5' />
						</Button>
					)}
				</div>
			</div>
		</motion.div>
	);
}
