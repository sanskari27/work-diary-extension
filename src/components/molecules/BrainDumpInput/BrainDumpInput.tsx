import TagAutocomplete from '@/components/molecules/TagAutocomplete/TagAutocomplete';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAppDispatch } from '@/store/hooks';
import { addEntry } from '@/store/slices/brainDumpSlice';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { useRef, useState } from 'react';

const BrainDumpInput = () => {
	const dispatch = useAppDispatch();
	const [content, setContent] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showAutocomplete, setShowAutocomplete] = useState(false);
	const [cursorPosition, setCursorPosition] = useState(0);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const handleSubmit = () => {
		const trimmedContent = content.trim();
		if (!trimmedContent || isSubmitting) return;

		setIsSubmitting(true);
		dispatch(addEntry({ content: trimmedContent }));

		// Reset form after submit
		setTimeout(() => {
			setContent('');
			setIsSubmitting(false);
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
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className='w-full max-w-2xl mx-auto'
		>
			<div className='space-y-3'>
				<div className='flex items-center gap-2 mb-2'>
					<Brain className='w-5 h-5 text-text-accent' />
					<h3 className='text-lg font-semibold text-white'>Instant Brain Dump</h3>
				</div>
				<div className='relative'>
					<Textarea
						ref={textareaRef}
						value={content}
						onChange={handleTextareaChange}
						onKeyDown={handleKeyDown}
						onSelect={handleSelectionChange}
						onClick={handleSelectionChange}
						placeholder="Dump it. We'll deal with it later."
						className='w-full glass-strong text-white placeholder:text-gray-200/50 text-sm resize-none min-h-[120px]'
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
				</div>
				<div className='flex items-center justify-between'>
					<p className='text-xs text-text-secondary/60'>Press Cmd/Ctrl + Enter to submit</p>
					<Button
						onClick={handleSubmit}
						disabled={!content.trim() || isSubmitting}
						className='bg-primary hover:bg-primary-hover text-white disabled:bg-primary/50 disabled:cursor-not-allowed'
						size='sm'
					>
						{isSubmitting ? (
							<>Dumping...</>
						) : (
							<>
								<Brain className='w-4 h-4 mr-2' />
								Dump It
							</>
						)}
					</Button>
				</div>
			</div>
		</motion.div>
	);
};

export default BrainDumpInput;
