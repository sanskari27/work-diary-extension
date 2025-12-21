import { Text } from '@/components/atoms';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ToolGroupTemplateProps {
	title: string;
	description?: string;
	children: ReactNode;
	className?: string;
}

const ToolGroupTemplate = ({ title, description, children, className }: ToolGroupTemplateProps) => {
	return (
		<div className={cn('space-y-6', className)}>
			{/* Header */}
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
			>
				<Text
					variant='h1'
					className='text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-text mb-2'
				>
					{title}
				</Text>
				{description && (
					<Text variant='p' className='text-text-secondary text-lg'>
						{description}
					</Text>
				)}
			</motion.div>

			{/* Tools Grid */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, delay: 0.2 }}
				className='space-y-6'
			>
				{children}
			</motion.div>
		</div>
	);
};

export default ToolGroupTemplate;
