import SettingsModal from '@/components/organisms/SettingsModal/SettingsModal';
import { motion } from 'framer-motion';
import { Home, Settings } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface PageLayoutProps {
	children: ReactNode;
	showHomeButton?: boolean;
}

const PageLayout = ({ children, showHomeButton = true }: PageLayoutProps) => {
	const navigate = useNavigate();
	const [settingsOpen, setSettingsOpen] = useState(false);

	return (
		<div className='min-h-screen relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'>
			{/* Animated Background Orbs */}
			<div className='absolute inset-0 overflow-hidden pointer-events-none'>
				<motion.div
					animate={{
						x: [0, 100, 0],
						y: [0, -100, 0],
						scale: [1, 1.2, 1],
					}}
					transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
					className='absolute top-0 left-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl'
				/>
				<motion.div
					animate={{
						x: [0, -100, 0],
						y: [0, 100, 0],
						scale: [1, 1.3, 1],
					}}
					transition={{
						duration: 25,
						repeat: Infinity,
						ease: 'easeInOut',
						delay: 2,
					}}
					className='absolute bottom-0 right-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl'
				/>
				<motion.div
					animate={{
						x: [0, 50, 0],
						y: [0, -50, 0],
						scale: [1, 1.1, 1],
					}}
					transition={{
						duration: 15,
						repeat: Infinity,
						ease: 'easeInOut',
						delay: 1,
					}}
					className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl'
				/>
			</div>

			{/* Content */}
			<div className='relative z-10 min-h-screen'>
				{showHomeButton && (
					<motion.button
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5 }}
						onClick={() => navigate('/')}
						className='fixed top-8 left-8 z-20 glass-strong rounded-2xl p-4 hover:bg-white/30 transition-all duration-300 group'
					>
						<Home className='w-5 h-5 text-purple-300 group-hover:text-white transition-colors' />
					</motion.button>
				)}

				{children}
			</div>

			{/* Floating Settings Button */}
			<motion.button
				initial={{ opacity: 0, scale: 0.8 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.5, delay: 0.8 }}
				onClick={() => setSettingsOpen(true)}
				className='fixed bottom-8 left-8 z-20 glass-strong rounded-2xl p-4 hover:bg-white/30 transition-all duration-300 group shadow-2xl'
			>
				<Settings className='w-6 h-6 text-purple-300 group-hover:text-white transition-colors group-hover:rotate-90 duration-300' />
			</motion.button>

			{/* Settings Modal */}
			<SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
		</div>
	);
};

export default PageLayout;
