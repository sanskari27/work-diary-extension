import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { HTMLAttributes, ReactNode } from 'react';

interface TextProps extends HTMLAttributes<HTMLElement> {
	variant?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
	children: ReactNode;
	animate?: boolean;
}

const Text = ({ variant = 'p', children, className, animate = false, ...props }: TextProps) => {
	const Component = variant;

	const baseClasses = {
		h1: 'text-5xl md:text-7xl font-bold tracking-tight',
		h2: 'text-3xl md:text-5xl font-bold tracking-tight',
		h3: 'text-xl md:text-2xl font-semibold',
		p: 'text-base',
		span: 'text-base',
	};

	const content = (
		<Component className={cn(baseClasses[variant], className)} {...props}>
			{children}
		</Component>
	);

	if (animate) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.2, ease: 'easeOut' }}
			>
				{content}
			</motion.div>
		);
	}

	return content;
};

export default Text;
