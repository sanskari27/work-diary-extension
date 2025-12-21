import TagBadge from '@/components/molecules/TagBadge/TagBadge';
import { getTagSuggestions } from '@/lib/tagUtils';
import { cn } from '@/lib/utils';
import { useCallback, useEffect, useRef, useState } from 'react';

interface TagAutocompleteProps {
	value: string;
	selectionStart: number;
	onSelect: (tag: string) => void;
	onClose: () => void;
	textareaRef: React.RefObject<HTMLTextAreaElement>;
}

export default function TagAutocomplete({
	value,
	selectionStart,
	onSelect,
	onClose,
	textareaRef,
}: TagAutocompleteProps) {
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
	const listRef = useRef<HTMLDivElement>(null);

	// Extract query from value
	const beforeCursor = value.slice(0, selectionStart);
	const lastAtIndex = beforeCursor.lastIndexOf('@');
	const query = lastAtIndex !== -1 ? beforeCursor.slice(lastAtIndex + 1) : '';

	// Get suggestions
	const suggestions = getTagSuggestions(query);
	const showHints = !query.trim(); // Show hints only when query is empty

	// Calculate position - use a mirror div for accurate measurement
	useEffect(() => {
		if (!textareaRef.current || lastAtIndex === -1) {
			return;
		}

		const textarea = textareaRef.current;
		const rect = textarea.getBoundingClientRect();

		// Check if textarea is visible and has valid dimensions
		if (rect.width === 0 || rect.height === 0) {
			return;
		}

		const textareaStyles = window.getComputedStyle(textarea);

		// Get line information
		const lines = beforeCursor.split('\n');
		const lineIndex = lines.length - 1;
		const currentLine = lines[lineIndex];
		const atIndexInLine = currentLine.lastIndexOf('@');

		if (atIndexInLine === -1) {
			// Fallback: position below textarea
			setPosition({
				top: rect.bottom + 4,
				left: rect.left + (parseFloat(textareaStyles.paddingLeft) || 0),
			});
			return;
		}

		// Create a mirror div that matches textarea styling exactly
		const mirror = document.createElement('div');
		mirror.style.position = 'absolute';
		mirror.style.visibility = 'hidden';
		mirror.style.whiteSpace = 'pre-wrap';
		mirror.style.wordWrap = 'break-word';
		mirror.style.font = textareaStyles.font;
		mirror.style.fontSize = textareaStyles.fontSize;
		mirror.style.fontFamily = textareaStyles.fontFamily;
		mirror.style.fontWeight = textareaStyles.fontWeight;
		mirror.style.letterSpacing = textareaStyles.letterSpacing;
		mirror.style.padding = textareaStyles.padding;
		mirror.style.border = textareaStyles.border;
		mirror.style.width = `${rect.width}px`;
		mirror.style.boxSizing = textareaStyles.boxSizing;
		mirror.textContent = beforeCursor;
		document.body.appendChild(mirror);

		// Create span to measure width up to @
		const measureSpan = document.createElement('span');
		measureSpan.style.position = 'absolute';
		measureSpan.style.visibility = 'hidden';
		measureSpan.style.font = textareaStyles.font;
		measureSpan.style.fontSize = textareaStyles.fontSize;
		measureSpan.style.fontFamily = textareaStyles.fontFamily;
		measureSpan.style.fontWeight = textareaStyles.fontWeight;
		measureSpan.style.letterSpacing = textareaStyles.letterSpacing;
		measureSpan.textContent = currentLine.slice(0, atIndexInLine + 1);
		document.body.appendChild(measureSpan);

		const widthToAt = measureSpan.offsetWidth;
		const paddingLeft = parseFloat(textareaStyles.paddingLeft) || 0;
		const paddingTop = parseFloat(textareaStyles.paddingTop) || 0;

		// Calculate line height from mirror
		const mirrorHeight = mirror.offsetHeight;
		const lineHeight =
			(mirrorHeight > 0 && lines.length > 0 ? mirrorHeight / lines.length : null) ||
			parseFloat(textareaStyles.lineHeight) ||
			parseFloat(textareaStyles.fontSize) * 1.2 ||
			20;

		// Calculate position relative to viewport (since we use position: fixed)
		const top = rect.top + paddingTop + (lineIndex + 1) * lineHeight + 4;
		const left = rect.left + paddingLeft + widthToAt;

		// Cleanup
		document.body.removeChild(mirror);
		document.body.removeChild(measureSpan);

		// Validate position values
		if (isNaN(top) || isNaN(left) || top < 0 || left < 0) {
			// Fallback: position below textarea
			setPosition({
				top: rect.bottom + 4,
				left: rect.left + paddingLeft,
			});
		} else {
			setPosition({ top, left });
		}
	}, [value, selectionStart, beforeCursor, lastAtIndex, textareaRef]);

	// Recalculate position on scroll
	useEffect(() => {
		if (!textareaRef.current || lastAtIndex === -1) return;

		const handleScroll = () => {
			const textarea = textareaRef.current;
			if (!textarea) return;

			const rect = textarea.getBoundingClientRect();
			if (rect.width === 0 || rect.height === 0) return;

			const textareaStyles = window.getComputedStyle(textarea);
			const lines = beforeCursor.split('\n');
			const lineIndex = lines.length - 1;
			const currentLine = lines[lineIndex];
			const atIndexInLine = currentLine.lastIndexOf('@');

			if (atIndexInLine === -1) {
				setPosition({
					top: rect.bottom + 4,
					left: rect.left + (parseFloat(textareaStyles.paddingLeft) || 0),
				});
				return;
			}

			// Simple recalculation on scroll
			const paddingLeft = parseFloat(textareaStyles.paddingLeft) || 0;
			const paddingTop = parseFloat(textareaStyles.paddingTop) || 0;
			const lineHeight =
				parseFloat(textareaStyles.lineHeight) || parseFloat(textareaStyles.fontSize) * 1.2 || 20;

			// Measure width to @
			const measureSpan = document.createElement('span');
			measureSpan.style.position = 'absolute';
			measureSpan.style.visibility = 'hidden';
			measureSpan.style.font = textareaStyles.font;
			measureSpan.style.fontSize = textareaStyles.fontSize;
			measureSpan.style.fontFamily = textareaStyles.fontFamily;
			measureSpan.textContent = currentLine.slice(0, atIndexInLine + 1);
			document.body.appendChild(measureSpan);
			const widthToAt = measureSpan.offsetWidth;
			document.body.removeChild(measureSpan);

			setPosition({
				top: rect.top + paddingTop + (lineIndex + 1) * lineHeight + 4,
				left: rect.left + paddingLeft + widthToAt,
			});
		};

		window.addEventListener('scroll', handleScroll, true);
		return () => {
			window.removeEventListener('scroll', handleScroll, true);
		};
	}, [beforeCursor, lastAtIndex, textareaRef]);

	// Reset selected index when suggestions change
	useEffect(() => {
		setSelectedIndex(0);
	}, [suggestions.length]);

	// Scroll selected item into view
	useEffect(() => {
		if (listRef.current) {
			const selectedItem = listRef.current.children[selectedIndex] as HTMLElement;
			if (selectedItem) {
				selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
			}
		}
	}, [selectedIndex]);

	const handleSelect = useCallback(
		(tag: string) => {
			onSelect(tag);
		},
		[onSelect]
	);

	// Handle keyboard navigation at document level
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Only handle if textarea is focused
			if (document.activeElement !== textareaRef.current) {
				return;
			}

			if (e.key === 'ArrowDown') {
				e.preventDefault();
				setSelectedIndex((prev) => (prev + 1) % Math.max(suggestions.length, 1));
			} else if (e.key === 'ArrowUp') {
				e.preventDefault();
				setSelectedIndex(
					(prev) => (prev - 1 + Math.max(suggestions.length, 1)) % Math.max(suggestions.length, 1)
				);
			} else if (e.key === 'Enter' || e.key === 'Tab') {
				e.preventDefault();
				if (suggestions.length > 0) {
					handleSelect(suggestions[selectedIndex].label);
				} else {
					// Accept current text as tag
					handleSelect(query);
				}
			} else if (e.key === 'Escape') {
				e.preventDefault();
				onClose();
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [suggestions, selectedIndex, query, handleSelect, onClose, textareaRef]);

	if (suggestions.length === 0 && !query.trim()) {
		return null;
	}

	if (!position) {
		return null;
	}

	const { top, left } = position;

	return (
		<div
			ref={listRef}
			className='fixed z-50 w-64 rounded-lg border border-white/20 glass-strong shadow-lg overflow-hidden'
			style={{
				top: `${top}px`,
				left: `${left}px`,
			}}
		>
			<div className='max-h-64 overflow-y-auto'>
				{suggestions.length > 0 ? (
					suggestions.map((suggestion, index) => (
						<button
							key={`${suggestion.label}-${index}`}
							type='button'
							className={cn(
								'w-full px-3 py-2 text-left hover:bg-white/10 transition-colors flex items-center gap-2',
								index === selectedIndex && 'bg-white/10'
							)}
							onClick={() => handleSelect(suggestion.label)}
							onMouseEnter={() => setSelectedIndex(index)}
						>
							<TagBadge tag={suggestion.label} variant='inline' />
							{showHints && suggestion.hint && (
								<span className='text-xs text-gray-400 ml-auto truncate'>{suggestion.hint}</span>
							)}
						</button>
					))
				) : (
					<div className='px-3 py-2 text-sm text-gray-400'>Type to create a custom tag</div>
				)}
			</div>
		</div>
	);
}


