import TagBadge from '@/components/molecules/TagBadge/TagBadge';
import { getTagSuggestions } from '@/lib/tagUtils';
import { cn } from '@/lib/utils';
import { useCallback, useEffect, useRef, useState } from 'react';

interface TagAutocompleteProps {
	query: string;
	onSelect: (tag: string) => void;
	onClose: () => void;
	textareaRef: React.RefObject<HTMLTextAreaElement>;
	position?: { top: number; left: number };
}

export default function TagAutocomplete({
	query,
	onSelect,
	onClose,
	textareaRef,
	position,
}: TagAutocompleteProps) {
	const [selectedIndex, setSelectedIndex] = useState(0);
	const listRef = useRef<HTMLDivElement>(null);

	// Get suggestions
	const suggestions = getTagSuggestions(query);
	const showHints = !query.trim(); // Show hints only when query is empty

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

	if (suggestions.length === 0 || !query.trim()) {
		return null;
	}

	return (
		<div
			ref={listRef}
			className='absolute z-50 w-64 rounded-lg border border-white/20 glass-strong shadow-lg overflow-hidden'
			style={{
				...(position && {
					top: `${position.top}px`,
					left: `${position.left}px`,
				}),
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
								index === selectedIndex && 'bg-white/30'
							)}
							onClick={() => handleSelect(suggestion.label)}
							onMouseEnter={() => setSelectedIndex(index)}
						>
							<TagBadge tag={suggestion.label} variant='inline' />
							{showHints && suggestion.hint && (
								<span
									className={cn(
										'text-xs text-gray-200 ml-auto truncate',
										index === selectedIndex && 'text-gray-800 text-bold'
									)}
								>
									{suggestion.hint}
								</span>
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
