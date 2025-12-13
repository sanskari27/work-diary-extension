import { Button } from '@/components/ui/button';
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

	return (
		<div className='space-y-4'>
			{/* Section Header */}
			<Button
				onClick={() => setIsOpen(!isOpen)}
				variant='ghost'
				className='w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group'
			>
				<div className='flex items-center gap-3'>
					{icon && <div className='text-purple-400'>{icon}</div>}
					<div className='flex items-center gap-3'>
						<h2 className='text-xl font-bold text-white'>{title}</h2>
						<span className='px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium'>
							{count}
						</span>
					</div>
				</div>
				<motion.div animate={{ rotate: isOpen ? 0 : -90 }} transition={{ duration: 0.2 }}>
					<ChevronDown className='w-5 h-5 text-white/70 group-hover:text-white/90' />
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
						<div className='space-y-4 pl-2'>{children}</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default CollapsibleSection;



