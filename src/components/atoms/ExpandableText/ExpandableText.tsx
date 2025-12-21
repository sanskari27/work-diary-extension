import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ExpandableTextProps {
	content: string;
	charLimit?: number;
	className?: string;
	showMoreText?: string;
	showLessText?: string;
	renderContent?: (content: string) => React.ReactNode;
}

/**
 * ExpandableText component
 * Shows truncated content with expand/collapse functionality
 * Content is truncated to charLimit characters initially
 * Accepts an optional renderContent function to customize how content is rendered
 */
export default function ExpandableText({
	content,
	charLimit = 300,
	className,
	showMoreText = 'Show more',
	showLessText = 'Show less',
	renderContent,
}: ExpandableTextProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	const shouldTruncate = content.length > charLimit;

	if (!shouldTruncate) {
		const displayContent = renderContent ? renderContent(content) : content;
		return <div className={className}>{displayContent}</div>;
	}

	const displayContent = isExpanded ? content : content.slice(0, charLimit);
	const renderedContent = renderContent ? renderContent(displayContent) : displayContent;

	return (
		<div className={cn('flex flex-col gap-2', className)}>
			<div>{renderedContent}</div>
			<Button
				variant='ghost'
				size='sm'
				onClick={() => setIsExpanded(!isExpanded)}
				className={cn(
					'self-start text-xs text-text-accent/70 hover:text-text-primary',
					'hover:bg-primary/10 px-2 py-1 h-auto'
				)}
			>
				{isExpanded ? showLessText : showMoreText}
			</Button>
		</div>
	);
}
