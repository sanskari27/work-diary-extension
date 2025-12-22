import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { ReactNode, useState } from 'react';

interface CollapsibleProps {
	header: ReactNode;
	children: ReactNode;
	defaultOpen?: boolean;
	className?: string;
	headerClassName?: string;
	contentClassName?: string;
	hideCollapseButton?: boolean;
}

export const Collapsible = ({
	header,
	children,
	defaultOpen = true,
	className,
	headerClassName,
	contentClassName,
	hideCollapseButton = false,
}: CollapsibleProps) => {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	return (
		<div className={cn('glass-strong rounded-xl border border-glass-border-strong', className)}>
			{/* Header */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className={cn(
					'w-full flex items-center justify-between gap-3 p-4 transition-all group',
					headerClassName
				)}
			>
				<div className='flex-1 overflow-hidden'>{header}</div>
				{!hideCollapseButton && (
					<motion.div
						animate={{ rotate: isOpen ? 0 : -90 }}
						transition={{ duration: 0.15 }}
						className='flex-shrink-0'
					>
						<ChevronDown className='w-4 h-4 text-text-accent group-hover:text-text-primary transition-colors' />
					</motion.div>
				)}
			</button>

			{/* Content */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: 'auto', opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.15 }}
						className='overflow-hidden'
					>
						<div className={cn('px-4 pb-4', contentClassName)}>{children}</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};
