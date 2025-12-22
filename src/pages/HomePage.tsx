import { BrainDumpInput, Greeting } from '@/components/molecules';
import { FeatureGrid, HomePageSearch, NotificationPanel } from '@/components/organisms';
import { PageLayout } from '@/components/templates';
import { FEATURES } from '@/config/features';
import { useAppSelector } from '@/store/hooks';
import { motion } from 'framer-motion';

const HomePage = () => {
	const content = useAppSelector((state) => state.content.content);
	const appearance = useAppSelector((state) => state.settings.appearanceSettings);

	const greetingName = (appearance.greetingName || '').trim() || content.greeting.userName;

	return (
		<PageLayout showHomeButton={false}>
			<div className='min-h-screen p-6 md:p-12 lg:p-16 flex flex-col relative'>
				<div className='max-w-[1920px] mx-auto w-full flex-1 flex flex-col'>
					{/* Main Content */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.2 }}
						className='flex-1 flex flex-col'
					>
						<Greeting userName={greetingName} />

						{/* Center Piece - Search */}
						<motion.div
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.25, delay: 0.1 }}
							className='flex-1 flex flex-col items-center justify-center mb-12'
						>
							<HomePageSearch />
						</motion.div>

						{/* Instant Brain Dump */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.25, delay: 0.15 }}
							className='mb-8'
						>
							<BrainDumpInput />
						</motion.div>

						{/* Features Section */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.25, delay: 0.2 }}
							className='pb-8'
						>
							<FeatureGrid features={FEATURES} />
						</motion.div>
					</motion.div>
				</div>

				{/* Notifications Panel - Floating Window */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.25, delay: 0.2 }}
					className='absolute top-6 right-6 md:top-12 md:right-12 lg:top-16 lg:right-16 z-50'
				>
					<NotificationPanel />
				</motion.div>
			</div>
		</PageLayout>
	);
};

export default HomePage;
