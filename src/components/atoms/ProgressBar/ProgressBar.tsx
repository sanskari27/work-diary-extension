import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ProgressBarProps {
	value: number; // percentage 0-100
	className?: string; // classes for the outer track
	barClassName?: string; // classes for the inner moving bar
}

const clampPercentage = (value: number) => {
	if (Number.isNaN(value)) return 0;
	return Math.min(100, Math.max(0, value));
};

const ProgressBar = ({ value, className, barClassName }: ProgressBarProps) => {
	const safeValue = clampPercentage(value);

	return (
		<div className={cn('w-full bg-white/10 rounded-full overflow-hidden', className)}>
			<motion.div
				initial={{ width: 0 }}
				animate={{ width: `${safeValue}%` }}
				transition={{ duration: 0.2 }}
				className={cn(
					'h-full bg-gradient-to-r from-emerald-400 via-lime-400 to-green-500',
					barClassName
				)}
			/>
		</div>
	);
};

export default ProgressBar;
