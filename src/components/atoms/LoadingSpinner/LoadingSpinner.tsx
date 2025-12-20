import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
	size?: 'sm' | 'md' | 'lg';
	className?: string;
}

const LoadingSpinner = ({ size = 'md', className }: LoadingSpinnerProps) => {
	const sizeClasses = {
		sm: 'w-4 h-4',
		md: 'w-6 h-6',
		lg: 'w-8 h-8',
	};

	return (
		<motion.div
			animate={{ rotate: 360 }}
			transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
			className={cn(
				'border-2 border-white border-t-transparent rounded-full',
				sizeClasses[size],
				className
			)}
		/>
	);
};

export default LoadingSpinner;
