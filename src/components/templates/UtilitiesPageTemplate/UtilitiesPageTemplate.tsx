import { AnimatedBackgroundOrbs } from '@/components/atoms';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { ReactNode, useState } from 'react';

interface UtilitiesPageTemplateProps {
	children: ReactNode;
	sidebar: ReactNode;
}

const UtilitiesPageTemplate = ({ children, sidebar }: UtilitiesPageTemplateProps) => {
	const [sidebarOpen, setSidebarOpen] = useState(true);

	return (
		<div className='min-h-screen relative bg-background-gradient'>
			<AnimatedBackgroundOrbs variant='full' />

			{/* Content */}
			<div className='relative z-10 min-h-screen'>
				{/* Mobile Sidebar Toggle */}
				<motion.button
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					onClick={() => setSidebarOpen(!sidebarOpen)}
					className='fixed top-8 right-8 z-30 md:hidden glass-strong rounded-xl p-2 hover:bg-white/10 transition-all duration-300 group'
				>
					{sidebarOpen ? (
						<X className='w-4 h-4 text-text-accent group-hover:text-text-primary transition-colors' />
					) : (
						<Menu className='w-4 h-4 text-text-accent group-hover:text-text-primary transition-colors' />
					)}
				</motion.button>

				{/* Main Layout */}
				<div className='flex h-screen'>
					{/* Sidebar */}
					<motion.aside
						initial={false}
						animate={{
							width: sidebarOpen ? '280px' : '0px',
							opacity: sidebarOpen ? 1 : 0,
						}}
						transition={{ duration: 0.3, ease: 'easeInOut' }}
						className={cn(
							'hidden md:block fixed left-0 top-0 h-full z-20 overflow-hidden',
							'bg-background-gradient border-r border-glass-border',
							sidebarOpen && 'block'
						)}
					>
						<div className='h-full overflow-y-auto '>{sidebar}</div>
					</motion.aside>

					{/* Desktop Sidebar Toggle - Beside Sidebar */}
					<motion.button
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{
							opacity: 1,
							scale: 1,
							left: sidebarOpen ? '280px' : '0px',
						}}
						transition={{ duration: 0.3, delay: 0.2 }}
						onClick={() => setSidebarOpen(!sidebarOpen)}
						className='fixed top-8 z-30 hidden md:block glass-strong rounded-xl p-2 hover:bg-white/10 transition-all duration-300 group'
					>
						{sidebarOpen ? (
							<X className='w-4 h-4 text-text-accent group-hover:text-text-primary transition-colors' />
						) : (
							<Menu className='w-4 h-4 text-text-accent group-hover:text-text-primary transition-colors' />
						)}
					</motion.button>

					{/* Mobile Sidebar Overlay */}
					{sidebarOpen && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setSidebarOpen(false)}
							className='md:hidden fixed inset-0 bg-black/50 z-10'
						/>
					)}

					{/* Mobile Sidebar */}
					<motion.aside
						initial={{ x: '-100%' }}
						animate={{ x: sidebarOpen ? 0 : '-100%' }}
						transition={{ duration: 0.3, ease: 'easeInOut' }}
						className={cn(
							'md:hidden fixed left-0 top-0 h-full w-64 z-20',
							'bg-background-gradient border-r border-glass-border overflow-y-auto '
						)}
					>
						{sidebar}
					</motion.aside>

					{/* Main Content */}
					<main
						className={cn(
							'flex-1 overflow-y-auto transition-all duration-300 h-full',
							sidebarOpen && 'md:ml-[280px]'
						)}
					>
						<div className='max-w-7xl mx-auto p-6 h-full'>{children}</div>
					</main>
				</div>
			</div>
		</div>
	);
};

export default UtilitiesPageTemplate;
