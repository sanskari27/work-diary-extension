import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

interface PageLayoutProps {
	children: ReactNode;
	showHomeButton?: boolean;
}

const PageLayout = ({ children, showHomeButton = true }: PageLayoutProps) => {
	const navigate = useNavigate();

	return (
		<div className='min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'>
			{/* Animated Background Orbs */}
			<div className='absolute inset-0 overflow-hidden'>
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

			{/* Floating Work Diary Badge */}
			<motion.div
				initial={{ opacity: 0, scale: 0.8 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.5, delay: 0.8 }}
				className='fixed bottom-8 right-8 z-20'
			>
				<div className='glass-strong rounded-3xl px-6 py-4 shadow-2xl'>
					<p className='text-sm font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent'>
						Work Diary
					</p>
				</div>
			</motion.div>
		</div>
	);
};

export default PageLayout;

