import TagAutocomplete from '@/components/molecules/TagAutocomplete/TagAutocomplete';
import TagBadge from '@/components/molecules/TagBadge/TagBadge';
import TagParser from '@/components/molecules/TagParser/TagParser';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAppearanceStyles } from '@/hooks/useAppearanceStyles';
import { formatRelativeTime } from '@/lib/dateUtils';
import { extractTags } from '@/lib/tagUtils';
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
	const [showAutocomplete, setShowAutocomplete] = useState(false);
	const [cursorPosition, setCursorPosition] = useState(0);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const { styles } = useAppearanceStyles();
	const cardStyles = styles.card();
	const iconStyles = styles.icon();
	const textStyles = styles.text();

	// Extract unique tags from content
	const tags = Array.from(new Set(extractTags(entry.content)));

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

	const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const value = e.target.value;
		const cursorPos = e.target.selectionStart;
		setEditContent(value);
		setCursorPosition(cursorPos);

		// Check if we should show autocomplete
		const beforeCursor = value.slice(0, cursorPos);
		const lastAtIndex = beforeCursor.lastIndexOf('@');

		if (lastAtIndex !== -1) {
			const tagQuery = beforeCursor.slice(lastAtIndex + 1);
			// Check if we're still in a tag (no space or newline after @)
			if (!tagQuery.includes(' ') && !tagQuery.includes('\n')) {
				setShowAutocomplete(true);
			} else {
				setShowAutocomplete(false);
			}
		} else {
			setShowAutocomplete(false);
		}
	};

	const handleTagSelect = (tag: string) => {
		const beforeCursor = editContent.slice(0, cursorPosition);
		const lastAtIndex = beforeCursor.lastIndexOf('@');

		if (lastAtIndex !== -1) {
			const beforeTag = editContent.slice(0, lastAtIndex);
			const afterCursor = editContent.slice(cursorPosition);
			const newContent = `${beforeTag}@${tag} ${afterCursor}`;
			setEditContent(newContent);
			setShowAutocomplete(false);

			// Set cursor position after the inserted tag
			setTimeout(() => {
				if (textareaRef.current) {
					const newCursorPos = lastAtIndex + tag.length + 2; // +2 for @ and space
					textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
					setCursorPosition(newCursorPos);
				}
			}, 0);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (showAutocomplete) {
			// Let autocomplete handle these keys
			if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter' || e.key === 'Tab') {
				// Autocomplete will handle these
				return;
			}
			if (e.key === 'Escape') {
				e.preventDefault();
				setShowAutocomplete(false);
				return;
			}
			if (e.key === ' ') {
				// Space finalizes the tag
				setShowAutocomplete(false);
			}
		}

		if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			handleSave();
		} else if (e.key === 'Escape' && !showAutocomplete) {
			e.preventDefault();
			handleCancel();
		}
	};

	const handleSelectionChange = () => {
		if (textareaRef.current) {
			setCursorPosition(textareaRef.current.selectionStart);
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
				<div className='relative'>
					<Textarea
						ref={textareaRef}
						value={editContent}
						onChange={handleTextareaChange}
						onBlur={() => handleSave()}
						onKeyDown={handleKeyDown}
						onSelect={handleSelectionChange}
						onClick={handleSelectionChange}
						className={cn(
							cardStyles.textSize,
							'bg-white/10 border-glass-border-strong text-white placeholder:text-white/50 focus-visible:ring-primary/50 resize-none min-h-[100px]'
						)}
						onClickCapture={(e) => e.stopPropagation()}
					/>
					{showAutocomplete && (
						<TagAutocomplete
							value={editContent}
							selectionStart={cursorPosition}
							onSelect={handleTagSelect}
							onClose={() => setShowAutocomplete(false)}
							textareaRef={textareaRef}
						/>
					)}
				</div>
			) : (
				<TagParser
					content={entry.content}
					className={cn(cardStyles.textSize, 'text-white/90 break-words leading-relaxed block')}
				/>
			)}

			{/* Tag List */}
			{tags.length > 0 && (
				<div className='flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-white/10'>
					{tags.map((tag) => (
						<TagBadge key={tag} tag={tag} variant='list' />
					))}
				</div>
			)}

			{isEditing && (
				<p className={cn(textStyles.metaSize, 'text-gray-300/50 mt-1')}>
					Press Cmd/Ctrl + Enter to save, Esc to cancel
				</p>
			)}
		</motion.div>
	);
}
