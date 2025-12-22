import { Button } from '@/components/ui/button';
import { useAppearanceStyles } from '@/hooks/useAppearanceStyles';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { ReactNode, useState } from 'react';

interface CollapsibleSectionProps {
	title: string;
	count: number;
	children: ReactNode;
	defaultOpen?: boolean;
	icon?: ReactNode;
}

const CollapsibleSection = ({
	title,
	count,
	children,
	defaultOpen = true,
	icon,
}: CollapsibleSectionProps) => {
	const [isOpen, setIsOpen] = useState(defaultOpen);
	const { styles } = useAppearanceStyles();
	const cardStyles = styles.card();
	const badgeStyles = styles.badge();
	const iconStyles = styles.icon();

	return (
		<div className={cardStyles.spacing}>
			{/* Section Header */}
			<Button
				onClick={() => setIsOpen(!isOpen)}
				variant='default'
				className={cn(
					'w-full flex items-center justify-between rounded-xl glass-strong border border-white/10 transition-all group',
					cardStyles.padding
				)}
			>
				<div className='flex items-center gap-3'>
					{icon && <div className='text-text-accent'>{icon}</div>}
					<div className='flex items-center gap-3'>
						<h2 className={cn(cardStyles.titleSize, 'font-bold text-white')}>{title}</h2>
						<span
							className={cn(
								badgeStyles.padding,
								badgeStyles.textSize,
								'rounded-full bg-primary/20 text-text-primary font-medium'
							)}
						>
							{count}
						</span>
					</div>
				</div>
				<motion.div animate={{ rotate: isOpen ? 0 : -90 }} transition={{ duration: 0.2 }}>
					<ChevronDown
						className={cn(iconStyles.iconSize, 'text-white/70 group-hover:text-white/90')}
					/>
				</motion.div>
			</Button>

			{/* Section Content */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: 'auto', opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.3 }}
						className='overflow-hidden'
					>
						<div className={cn(cardStyles.spacing, 'pl-2')}>{children}</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default CollapsibleSection;
