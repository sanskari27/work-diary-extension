import TagAutocomplete from '@/components/molecules/TagAutocomplete/TagAutocomplete';
import { Textarea } from '@/components/ui/textarea';
import { getQuery } from '@/lib/tagUtils';
import { getCaretPosition } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

interface TagBasedInputProps
	extends Omit<
		React.ComponentProps<'textarea'>,
		'value' | 'onChange' | 'onBlur' | 'onKeyDown' | 'onClick' | 'onSelect'
	> {
	value: string;
	onChange: (content: string) => void;
	onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
	onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
	onClick?: (e: React.MouseEvent<HTMLTextAreaElement>) => void;
	onSelect?: (e: React.SyntheticEvent<HTMLTextAreaElement>) => void;
}

export default function TagBasedInput({
	value,
	onChange,
	onBlur,
	onKeyDown,
	onClick,
	onSelect,
	...textareaProps
}: TagBasedInputProps) {
	const [showAutocomplete, setShowAutocomplete] = useState(false);
	const [cursorPosition, setCursorPosition] = useState(0);
	const [autocompletePosition, setAutocompletePosition] = useState<{
		top: number;
		left: number;
	} | null>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const wrapperRef = useRef<HTMLDivElement>(null);

	const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newValue = e.target.value;
		const cursorPos = e.target.selectionStart;

		// Call parent onChange
		onChange(newValue);
		setCursorPosition(cursorPos);

		// Check if we should show autocomplete
		const beforeCursor = newValue.slice(0, cursorPos);
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
		const beforeCursor = value.slice(0, cursorPosition);
		const lastAtIndex = beforeCursor.lastIndexOf('@');

		if (lastAtIndex !== -1) {
			const beforeTag = value.slice(0, lastAtIndex);
			const afterCursor = value.slice(cursorPosition);
			const newContent = `${beforeTag}@${tag} ${afterCursor}`;
			onChange(newContent);
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
				// Don't call parent handler when closing autocomplete
				return;
			}
			if (e.key === ' ') {
				// Space finalizes the tag
				setShowAutocomplete(false);
			}
		}

		// Call parent handler for any other keys
		onKeyDown?.(e);
	};

	const handleSelectionChange = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
		if (textareaRef.current) {
			setCursorPosition(textareaRef.current.selectionStart);
		}
		onSelect?.(e);
	};

	const handleClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
		handleSelectionChange(e);
		onClick?.(e);
	};

	// Calculate caret position when autocomplete should be shown
	useEffect(() => {
		if (showAutocomplete && textareaRef.current && wrapperRef.current) {
			const position = getCaretPosition(textareaRef, wrapperRef);
			if (!position) {
				setShowAutocomplete(false);
				return;
			} else {
				setAutocompletePosition({
					top: position.top + 20,
					left: position.left,
				});
			}
		} else {
			setAutocompletePosition(null);
		}
	}, [showAutocomplete, cursorPosition, value]);

	return (
		<div ref={wrapperRef} className='relative'>
			<Textarea
				ref={textareaRef}
				value={value}
				onChange={handleTextareaChange}
				onKeyDown={handleKeyDown}
				onSelect={handleSelectionChange}
				onClick={handleClick}
				onBlur={onBlur}
				{...textareaProps}
			/>
			{showAutocomplete && (
				<TagAutocomplete
					query={getQuery(value, cursorPosition)}
					onSelect={handleTagSelect}
					onClose={() => setShowAutocomplete(false)}
					textareaRef={textareaRef}
					position={autocompletePosition || undefined}
				/>
			)}
		</div>
	);
}
