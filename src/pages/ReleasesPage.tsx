import PageLayout from '@/components/templates/PageLayout/PageLayout';
import Text from '@/components/atoms/Text/Text';
import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';

const ReleasesPage = () => {
	return (
		<PageLayout>
			<div className='min-h-screen p-6 md:p-12 lg:p-16 flex flex-col'>
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5 }}
					className='max-w-7xl mx-auto w-full flex-1 flex flex-col'
				>
					{/* Page Header */}
					<motion.div
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className='mb-12 flex items-center gap-4'
					>
						<motion.div
							animate={{
								rotate: [0, 10, -10, 0],
								scale: [1, 1.1, 1],
							}}
							transition={{
								duration: 3,
								repeat: Infinity,
								ease: 'easeInOut',
							}}
							className='p-4 rounded-2xl bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500'
						>
							<Rocket className='w-8 h-8 text-white' />
						</motion.div>
						<Text
							variant='h1'
							className='text-5xl md:text-6xl font-black tracking-tighter bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent'
						>
							Releases
						</Text>
					</motion.div>

					{/* Content Area */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						className='flex-1'
					>
						<div className='glass-strong rounded-3xl p-12 w-full min-h-[500px] flex items-center justify-center border border-white/20'>
							<div className='text-center space-y-4'>
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
									RELEASES CONTENT
								</motion.div>
								<p className='text-purple-300/30 text-sm font-medium'>
									Your releases content will go here
								</p>
							</div>
						</div>
					</motion.div>
				</motion.div>
			</div>
		</PageLayout>
	);
};

export default ReleasesPage;

