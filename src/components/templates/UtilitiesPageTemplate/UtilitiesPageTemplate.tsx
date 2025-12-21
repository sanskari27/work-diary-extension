import { AnimatedBackgroundOrbs } from '@/components/atoms';
import { SettingsModal } from '@/components/organisms';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Home, Menu, Settings, X } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface UtilitiesPageTemplateProps {
	children: ReactNode;
	sidebar: ReactNode;
	showHomeButton?: boolean;
}

const UtilitiesPageTemplate = ({
	children,
	sidebar,
	showHomeButton = true,
}: UtilitiesPageTemplateProps) => {
	const navigate = useNavigate();
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [sidebarOpen, setSidebarOpen] = useState(true);

	return (
		<div className='min-h-screen relative bg-background-gradient'>
			<AnimatedBackgroundOrbs variant='full' />

			{/* Content */}
			<div className='relative z-10 min-h-screen'>
				{showHomeButton && (
					<motion.button
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5 }}
						onClick={() => navigate('/')}
						className='fixed top-8 left-8 z-30 glass-strong rounded-2xl p-4 hover:bg-white/30 transition-all duration-300 group'
					>
						<Home className='w-5 h-5 text-primary group-hover:text-white transition-colors' />
					</motion.button>
				)}

				{/* Mobile Sidebar Toggle */}
				<motion.button
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					onClick={() => setSidebarOpen(!sidebarOpen)}
					className='fixed top-8 right-8 z-30 md:hidden glass-strong rounded-2xl p-4 hover:bg-white/30 transition-all duration-300 group'
				>
					{sidebarOpen ? (
						<X className='w-5 h-5 text-primary group-hover:text-white transition-colors' />
					) : (
						<Menu className='w-5 h-5 text-primary group-hover:text-white transition-colors' />
					)}
				</motion.button>

				{/* Desktop Sidebar Toggle */}
				<motion.button
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					onClick={() => setSidebarOpen(!sidebarOpen)}
					className='fixed top-8 right-24 z-30 hidden md:block glass-strong rounded-2xl p-4 hover:bg-white/30 transition-all duration-300 group'
				>
					{sidebarOpen ? (
						<X className='w-5 h-5 text-primary group-hover:text-white transition-colors' />
					) : (
						<Menu className='w-5 h-5 text-primary group-hover:text-white transition-colors' />
					)}
				</motion.button>

				{/* Main Layout */}
				<div className='flex h-screen pt-20'>
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
						<div className='h-full overflow-y-auto pt-20'>{sidebar}</div>
					</motion.aside>

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
							'bg-background-gradient border-r border-glass-border overflow-y-auto pt-20'
						)}
					>
						{sidebar}
					</motion.aside>

					{/* Main Content */}
					<main
						className={cn(
							'flex-1 overflow-y-auto transition-all duration-300',
							sidebarOpen && 'md:ml-[280px]'
						)}
					>
						<div className='max-w-7xl mx-auto p-6 md:p-12'>{children}</div>
					</main>
				</div>

				{/* Floating Settings Button */}
				<motion.button
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.5, delay: 0.8 }}
					onClick={() => setSettingsOpen(true)}
					tabIndex={-1}
					className='fixed bottom-8 left-8 z-20 glass-strong rounded-2xl p-4 hover:bg-white/30 transition-all duration-300 group shadow-2xl'
				>
					<Settings className='w-6 h-6 text-primary group-hover:text-white transition-colors group-hover:rotate-90 duration-300' />
				</motion.button>

				{/* Settings Modal */}
				<SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
			</div>
		</div>
	);
};

export default UtilitiesPageTemplate;
