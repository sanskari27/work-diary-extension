import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAppearanceStyles } from '@/hooks/useAppearanceStyles';
import { formatRelativeTime } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';
import { BrainDumpEntry } from '@/store/slices/brainDumpSlice';
import { motion } from 'framer-motion';
import { Brain, Check, Pencil, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface BrainDumpCardProps {
	entry: BrainDumpEntry;
	onDelete: (entryId: string) => void;
	onUpdate: (entryId: string, updates: Partial<BrainDumpEntry>) => void;
}

export default function BrainDumpCard({ entry, onDelete, onUpdate }: BrainDumpCardProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [editContent, setEditContent] = useState(entry.content);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const { styles } = useAppearanceStyles();
	const cardStyles = styles.card();
	const iconStyles = styles.icon();
	const textStyles = styles.text();

	// Focus textarea when editing starts
	useEffect(() => {
		if (isEditing && textareaRef.current) {
			textareaRef.current.focus();
			textareaRef.current.setSelectionRange(
				textareaRef.current.value.length,
				textareaRef.current.value.length
			);
		}
	}, [isEditing]);

	// Update editContent when entry content changes externally
	useEffect(() => {
		if (!isEditing) {
			setEditContent(entry.content);
		}
	}, [entry.content, isEditing]);

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (window.confirm('Are you sure you want to delete this brain dump?')) {
			onDelete(entry.id);
		}
	};

	const handleEdit = (e: React.MouseEvent) => {
		e.stopPropagation();
		setIsEditing(true);
		setEditContent(entry.content);
	};

	const handleSave = (e?: React.MouseEvent) => {
		e && e.stopPropagation();
		const trimmedContent = editContent.trim();
		if (trimmedContent && trimmedContent !== entry.content) {
			onUpdate(entry.id, { content: trimmedContent });
		}
		setIsEditing(false);
	};

	const handleCancel = (e?: React.MouseEvent) => {
		e && e.stopPropagation();
		setEditContent(entry.content);
		setIsEditing(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			handleSave();
		} else if (e.key === 'Escape') {
			e.preventDefault();
			handleCancel();
		}
	};

	return (
		<motion.div
			whileHover={{ scale: 1.01, y: -2 }}
			whileTap={{ scale: 0.99 }}
			className={cn(
				'group relative rounded-xl glass-strong',
				'border border-white/20 shadow-lg hover:shadow-xl transition-all',
				'flex flex-col',
				cardStyles.padding,
				cardStyles.spacing
			)}
		>
			{/* Header */}
			<div className='flex items-start justify-between gap-3'>
				<div className='flex items-center gap-2 flex-1 min-w-0'>
					<Brain className={cn(iconStyles.iconSize, 'text-text-accent flex-shrink-0')} />
					<span className={cn(textStyles.metaSize, 'text-gray-300/70 truncate')}>
						{formatRelativeTime(new Date(entry.timestamp).toISOString())}
					</span>
				</div>

				{/* Actions - Show on hover */}
				<div
					className={cn(
						'flex items-center gap-1.5 transition-opacity',
						isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
					)}
				>
					{isEditing ? (
						<>
							<Button
								size='icon'
								variant='ghost'
								className={cn(
									iconStyles.iconSize,
									'p-0 text-green-400/80 hover:text-green-300 hover:bg-green-500/10'
								)}
								onClick={handleSave}
							>
								<Check className={iconStyles.iconSize} />
							</Button>
							<Button
								size='icon'
								variant='ghost'
								className={cn(
									iconStyles.iconSize,
									'p-0 text-text-accent/80 hover:text-text-primary hover:bg-primary/10'
								)}
								onClick={handleCancel}
							>
								<X className={iconStyles.iconSize} />
							</Button>
						</>
					) : (
						<>
							<Button
								size='icon'
								variant='ghost'
								className={cn(
									iconStyles.iconSize,
									'p-0 text-text-accent/80 hover:text-text-primary hover:bg-primary/10'
								)}
								onClick={handleEdit}
							>
								<Pencil className={iconStyles.iconSize} />
							</Button>
							<Button
								size='icon'
								variant='ghost'
								className={cn(
									iconStyles.iconSize,
									'p-0 text-red-400/80 hover:text-red-300 hover:bg-red-500/10'
								)}
								onClick={handleDelete}
							>
								<Trash2 className={iconStyles.iconSize} />
							</Button>
						</>
					)}
				</div>
			</div>

			{/* Content */}
			{isEditing ? (
				<Textarea
					ref={textareaRef}
					value={editContent}
					onChange={(e) => setEditContent(e.target.value)}
					onBlur={() => handleSave()}
					onKeyDown={handleKeyDown}
					className={cn(
						cardStyles.textSize,
						'bg-white/10 border-glass-border-strong text-white placeholder:text-white/50 focus-visible:ring-primary/50 resize-none min-h-[100px]'
					)}
					onClick={(e) => e.stopPropagation()}
				/>
			) : (
				<p
					className={cn(
						cardStyles.textSize,
						'text-white/90 whitespace-pre-wrap break-words leading-relaxed'
					)}
				>
					{entry.content}
				</p>
			)}

			{isEditing && (
				<p className={cn(textStyles.metaSize, 'text-gray-300/50 mt-1')}>
					Press Cmd/Ctrl + Enter to save, Esc to cancel
				</p>
			)}
		</motion.div>
	);
}
