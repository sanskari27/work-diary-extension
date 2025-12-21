import { LoadingSpinner } from '@/components/atoms';
import TagAutocomplete from '@/components/molecules/TagAutocomplete/TagAutocomplete';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addEntry } from '@/store/slices/brainDumpSlice';
import { AnimatePresence, motion } from 'framer-motion';
import { Brain, Check } from 'lucide-react';
import { useRef, useState } from 'react';

const BrainDumpForm = () => {
	const dispatch = useAppDispatch();
	const entries = useAppSelector((state) => state.brainDump.entries);
	const [content, setContent] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [showAutocomplete, setShowAutocomplete] = useState(false);
	const [cursorPosition, setCursorPosition] = useState(0);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const mostRecentEntry = entries[0];

	const handleSubmit = () => {
		const trimmedContent = content.trim();
		if (!trimmedContent || isSubmitting) return;

		setIsSubmitting(true);
		dispatch(addEntry({ content: trimmedContent }));

		// Reset form and hide after submit
		setTimeout(() => {
			setContent('');
			setIsSubmitting(false);
			setIsSubmitted(true);
			// Hide the form after a brief success animation
			setTimeout(() => {
				setIsSubmitted(false);
			}, 1000);
		}, 300);
	};

	const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const value = e.target.value;
		const cursorPos = e.target.selectionStart;
		setContent(value);
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
		const beforeCursor = content.slice(0, cursorPosition);
		const lastAtIndex = beforeCursor.lastIndexOf('@');

		if (lastAtIndex !== -1) {
			const beforeTag = content.slice(0, lastAtIndex);
			const afterCursor = content.slice(cursorPosition);
			const newContent = `${beforeTag}@${tag} ${afterCursor}`;
			setContent(newContent);
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
			handleSubmit();
		}
	};

	const handleSelectionChange = () => {
		if (textareaRef.current) {
			setCursorPosition(textareaRef.current.selectionStart);
		}
	};

	return (
		<div className='space-y-3'>
			<AnimatePresence mode='wait'>
				{!isSubmitted ? (
					<motion.div
						key='form'
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.2 }}
					>
						<div className='space-y-2 relative'>
							<Textarea
								ref={textareaRef}
								value={content}
								onChange={handleTextareaChange}
								onKeyDown={handleKeyDown}
								onSelect={handleSelectionChange}
								onClick={handleSelectionChange}
								placeholder={"Dump it. We'll deal with it later.\nPress Cmd/Ctrl + Enter to submit"}
								className='w-full glass-strong text-white placeholder:text-gray-200/50 text-sm resize-none min-h-[80px]'
								disabled={isSubmitting}
							/>
							{showAutocomplete && (
								<TagAutocomplete
									value={content}
									selectionStart={cursorPosition}
									onSelect={handleTagSelect}
									onClose={() => setShowAutocomplete(false)}
									textareaRef={textareaRef}
								/>
							)}
							<Button
								onClick={handleSubmit}
								disabled={!content.trim() || isSubmitting}
								className='w-full bg-primary hover:bg-primary-hover text-white disabled:bg-primary/50 disabled:cursor-not-allowed'
								size='sm'
							>
								{isSubmitting ? (
									<>
										<LoadingSpinner size='sm' />
										Dumping...
									</>
								) : (
									<>
										<Brain className='w-4 h-4' />
										Dump It
									</>
								)}
							</Button>
						</div>
					</motion.div>
				) : (
					<motion.div
						key='success'
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.9 }}
						transition={{ duration: 0.3 }}
						className='flex items-center justify-center py-4'
					>
						<div className='flex items-center gap-2 text-text-accent'>
							<Check className='w-5 h-5' />
							<span className='text-sm font-medium'>Dumped!</span>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Most Recent Entry Preview */}
			{mostRecentEntry && !isSubmitted && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className='mt-3 p-2 rounded-lg glass-strong border border-white/10'
				>
					<p className='text-sm text-white/80 line-clamp-2'>
						{mostRecentEntry.content?.slice(0, 100)}{' '}
						{mostRecentEntry.content?.length > 100 ? '...' : ''}
					</p>
				</motion.div>
			)}
		</div>
	);
};

export default BrainDumpForm;
