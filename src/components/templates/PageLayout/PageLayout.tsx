import { AnimatedBackgroundOrbs } from '@/components/atoms';
import { SettingsModal } from '@/components/organisms';
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
						className='fixed top-8 left-8 z-20 glass-strong rounded-2xl p-4 hover:bg-white/30 transition-all duration-300 group'
					>
						<Home className='w-5 h-5 text-primary group-hover:text-white transition-colors' />
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
				tabIndex={-1}
				className='fixed bottom-8 left-8 z-20 glass-strong rounded-2xl p-4 hover:bg-white/30 transition-all duration-300 group shadow-2xl'
			>
				<Settings className='w-6 h-6 text-primary group-hover:text-white transition-colors group-hover:rotate-90 duration-300' />
			</motion.button>

			{/* Settings Modal */}
			<SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
		</div>
	);
};

export default PageLayout;
