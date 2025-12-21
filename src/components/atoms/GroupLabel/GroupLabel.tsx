import { cn } from '@/lib/utils';
import { Notebook } from '@/types/notebooks';

interface GroupLabelProps {
	notebook: Notebook;
	className?: string;
	size?: 'sm' | 'md' | 'lg';
}

const GroupLabel = ({ notebook, className, size = 'md' }: GroupLabelProps) => {
	const sizeClasses = {
		sm: 'text-xs',
		md: 'text-sm',
		lg: 'text-base',
	};

	const colorStyle = notebook.color
		? { borderLeftColor: notebook.color, borderLeftWidth: '3px' }
		: {};

	return (
		<div
			className={cn(
				'font-semibold text-text-primary border-l-3 pl-2',
				sizeClasses[size],
				className
			)}
			style={colorStyle}
		>
			{notebook.label}
		</div>
	);
};

export default GroupLabel;
