import Greeting from '@/components/molecules/Greeting/Greeting';
import FeatureGrid from '@/components/organisms/FeatureGrid/FeatureGrid';
import PageLayout from '@/components/templates/PageLayout/PageLayout';
import { FEATURES } from '@/config/features';
import { useContent } from '@/hooks/useContent';
import { motion } from 'framer-motion';

const HomePage = () => {
	const { content, loading } = useContent();

	if (loading || !content) {
		return (
			<PageLayout showHomeButton={false}>
				<div className='min-h-screen flex items-center justify-center'>
					<motion.div
						animate={{ rotate: 360 }}
						transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
						className='w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full'
					/>
				</div>
			</PageLayout>
		);
	}

	return (
		<PageLayout showHomeButton={false}>
			<div className='min-h-screen p-6 md:p-12 lg:p-16 flex flex-col'>
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5 }}
					className='max-w-7xl mx-auto w-full flex-1 flex flex-col'
				>
					<Greeting userName={content.greeting.userName} />

					{/* Center Piece Placeholder */}
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						className='flex-1 flex items-center justify-center mb-12'
					>
						<div className='glass-strong rounded-3xl p-12 w-full max-w-4xl min-h-[240px] flex items-center justify-center border-2 border-dashed border-purple-400/30'>
							<div className='text-center space-y-3'>
								<motion.div
									animate={{
										scale: [1, 1.05, 1],
										opacity: [0.5, 0.8, 0.5],
									}}
									transition={{
										duration: 3,
										repeat: Infinity,
										ease: 'easeInOut',
									}}
									className='text-purple-400/40 text-4xl font-black tracking-wider'
								>
									CENTER PIECE
								</motion.div>
								<p className='text-purple-300/30 text-xs font-medium'>
									Your main content will go here
								</p>
							</div>
						</div>
					</motion.div>

					{/* Features Section */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.4 }}
						className='pb-8'
					>
						<FeatureGrid features={FEATURES} />
					</motion.div>
				</motion.div>
			</div>
		</PageLayout>
	);
};

export default HomePage;
