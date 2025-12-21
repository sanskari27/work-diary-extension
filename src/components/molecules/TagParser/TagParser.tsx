import TagBadge from '@/components/molecules/TagBadge/TagBadge';
import * as React from 'react';

interface TagParserProps {
	content: string;
	className?: string;
}

/**
 * TagParser component
 * Parses content and renders tags inline with colored badges
 * Preserves whitespace and formatting
 */
export default function TagParser({ content, className }: TagParserProps) {
	const parts: React.ReactNode[] = [];
	const tagRegex = /@([\w-]+)/g;
	let lastIndex = 0;
	let match;

	while ((match = tagRegex.exec(content)) !== null) {
		// Add text before the tag
		if (match.index > lastIndex) {
			parts.push(content.slice(lastIndex, match.index));
		}

		// Add the tag badge
		const tagName = match[1];
		parts.push(<TagBadge key={`tag-${match.index}`} tag={tagName} variant='inline' />);

		lastIndex = match.index + match[0].length;
	}

	// Add remaining text
	if (lastIndex < content.length) {
		parts.push(content.slice(lastIndex));
	}

	return (
		<span className={className} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
			{parts}
		</span>
	);
}


