import { Greeting } from '@/components/molecules';
import { FeatureGrid, HomePageSearch, NotificationPanel } from '@/components/organisms';
import { PageLayout } from '@/components/templates';
import { FEATURES } from '@/config/features';
import { useContent } from '@/hooks/useContent';
import { useAppSelector } from '@/store/hooks';
import { motion } from 'framer-motion';

const HomePage = () => {
	const { content, loading } = useContent();
	const appearance = useAppSelector((state) => state.settings.appearanceSettings);

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

	const greetingName = (appearance.greetingName || '').trim() || content.greeting.userName;

	return (
		<PageLayout showHomeButton={false}>
			<div className='min-h-screen p-6 md:p-12 lg:p-16 flex flex-col'>
				<div className='max-w-[1920px] mx-auto w-full flex-1 flex flex-col lg:flex-row gap-6'>
					{/* Main Content */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.5 }}
						className='flex-1 flex flex-col'
					>
						<Greeting userName={greetingName} />

						{/* Center Piece - Search */}
						<motion.div
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							className='flex-1 flex flex-col items-center justify-center mb-12'
						>
							<HomePageSearch />
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

					{/* Notifications Panel */}
					<NotificationPanel />
				</div>
			</div>
		</PageLayout>
	);
};

export default HomePage;
