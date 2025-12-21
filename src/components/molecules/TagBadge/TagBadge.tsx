import { getTagColor, TagColor } from '@/lib/tagUtils';
import { cn } from '@/lib/utils';

interface TagBadgeProps {
	tag: string;
	variant?: 'inline' | 'list';
	className?: string;
}

const colorClasses: Record<TagColor, string> = {
	green: 'bg-green-500/20 text-green-100 border-green-500/30',
	red: 'bg-red-500/20 text-red-100 border-red-500/30',
	blue: 'bg-blue-500/20 text-blue-100 border-blue-500/30',
	yellow: 'bg-yellow-500/20 text-yellow-100 border-yellow-500/30',
	neutral: 'bg-gray-500/20 text-gray-100 border-gray-500/30',
};

export default function TagBadge({ tag, variant = 'inline', className }: TagBadgeProps) {
	const color = getTagColor(tag);
	const colorClass = colorClasses[color];

	const baseClasses =
		'inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-medium';

	const variantClasses = {
		inline: 'text-xs',
		list: 'text-xs',
	};

	return (
		<span className={cn(baseClasses, colorClass, variantClasses[variant], className)}>{tag}</span>
	);
}
