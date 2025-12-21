import { StatusAlert } from '@/components/atoms';
import { cn } from '@/lib/utils';

interface ErrorDisplayProps {
	error?: string;
	line?: number;
	column?: number;
	className?: string;
}

const ErrorDisplay = ({ error, line, column, className }: ErrorDisplayProps) => {
	if (!error) return null;

	const message = line && column ? `Line ${line}, Column ${column}: ${error}` : error;

	return (
		<div className={cn('mt-2', className)}>
			<StatusAlert type='error' message={message} />
		</div>
	);
};

export default ErrorDisplay;
