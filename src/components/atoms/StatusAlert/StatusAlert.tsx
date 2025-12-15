import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle } from 'lucide-react';

export type StatusType = 'success' | 'error';

export interface StatusAlertProps {
	type: StatusType;
	message: string;
	className?: string;
}

export function StatusAlert({ type, message, className }: StatusAlertProps) {
	const isSuccess = type === 'success';

	return (
		<div
			className={cn(
				'glass-strong rounded-xl p-4 border',
				isSuccess ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5',
				className
			)}
		>
			<div className='flex items-start gap-3'>
				{isSuccess ? (
					<CheckCircle className='w-5 h-5 text-green-400 flex-shrink-0 mt-0.5' />
				) : (
					<AlertCircle className='w-5 h-5 text-red-400 flex-shrink-0 mt-0.5' />
				)}
				<p className={cn('text-sm', isSuccess ? 'text-green-300' : 'text-red-300')}>{message}</p>
			</div>
		</div>
	);
}

export default StatusAlert;
