import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface PageHeaderProps {
	title: string;
	subtitle?: string;
	className?: string;
	animate?: boolean;
}

const PopupHeader = ({ title, subtitle, className, animate = true }: PageHeaderProps) => {
	return (
		<motion.div
			initial={animate ? { opacity: 0, y: -20 } : false}
			animate={animate ? { opacity: 1, y: 0 } : false}
			transition={{ duration: 0.5 }}
			className={cn('mb-6', className)}
		>
			<h1 className='text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-2'>
				{title}
			</h1>
			{subtitle && <p className='text-text-secondary/60 text-sm'>{subtitle}</p>}
		</motion.div>
	);
};

export default PopupHeader;
