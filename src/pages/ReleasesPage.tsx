import Text from '@/components/atoms/Text/Text';
import CollapsibleSection from '@/components/molecules/CollapsibleSection/CollapsibleSection';
import ReleaseCard from '@/components/organisms/ReleaseCard/ReleaseCard';
import ReleaseEventForm from '@/components/organisms/ReleaseEventForm/ReleaseEventForm';
import PageLayout from '@/components/templates/PageLayout/PageLayout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
	addReleaseEvent,
	addReleaseItem,
	deleteReleaseEvent,
	deleteReleaseItem,
	ReleaseEvent,
	toggleItemStatus,
	updateReleaseItem,
} from '@/store/slices/releasesSlice';
import { motion } from 'framer-motion';
import { Calendar, Clock, History, Package, Plus, Rocket } from 'lucide-react';
import { useMemo, useState } from 'react';

const ReleasesPage = () => {
	const dispatch = useAppDispatch();
	const events = useAppSelector((state) => state.releases.events);
	const customStatuses = useAppSelector((state) => state.settings.customStatuses);
	const [showReleaseForm, setShowReleaseForm] = useState(false);

	// Group and sort releases
	const groupedReleases = useMemo(() => {
		const now = new Date();
		const currentYear = now.getFullYear();
		const currentMonth = now.getMonth();

		// Reset time to start of day for accurate comparison
		const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

		const thisMonth: ReleaseEvent[] = [];
		const upcoming: ReleaseEvent[] = [];
		const previous: ReleaseEvent[] = [];

		events.forEach((event) => {
			const releaseDate = new Date(event.date);
			const releaseDateStart = new Date(
				releaseDate.getFullYear(),
				releaseDate.getMonth(),
				releaseDate.getDate()
			);

			if (releaseDate.getFullYear() === currentYear && releaseDate.getMonth() === currentMonth) {
				// This month
				thisMonth.push(event);
			} else if (releaseDateStart >= todayStart) {
				// Upcoming (future months)
				upcoming.push(event);
			} else {
				// Previous (past)
				previous.push(event);
			}
		});

		// Sort descending (newest/furthest first)
		const sortDescending = (a: ReleaseEvent, b: ReleaseEvent) => {
			return new Date(b.date).getTime() - new Date(a.date).getTime();
		};

		return {
			thisMonth: thisMonth.sort(sortDescending),
			upcoming: upcoming.sort(sortDescending),
			previous: previous.sort(sortDescending),
		};
	}, [events]);

	const handleCreateRelease = (data: {
		title: string;
		date: string;
		reminderEnabled: boolean;
		reminderDelta?: string;
	}) => {
		dispatch(addReleaseEvent(data));
		setShowReleaseForm(false);
	};

	const handleDeleteRelease = (id: string) => {
		if (confirm('Are you sure you want to delete this release event?')) {
			dispatch(deleteReleaseEvent(id));
		}
	};

	const handleAddItem = (eventId: string, item: any) => {
		// Get visible custom status names from settings
		const statusNames = customStatuses
			.filter((status) => status.isVisible)
			.sort((a, b) => a.order - b.order)
			.map((status) => status.name);

		dispatch(addReleaseItem({ eventId, item, customStatuses: statusNames }));
	};

	const handleUpdateItem = (eventId: string, itemId: string, updates: any) => {
		dispatch(updateReleaseItem({ eventId, itemId, updates }));
	};

	const handleDeleteItem = (eventId: string, itemId: string) => {
		if (confirm('Are you sure you want to delete this item?')) {
			dispatch(deleteReleaseItem({ eventId, itemId }));
		}
	};

	const handleToggleStatus = (eventId: string, itemId: string, statusName: string) => {
		dispatch(toggleItemStatus({ eventId, itemId, statusName }));
	};

	return (
		<>
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
							className='mb-8 flex items-center justify-between'
						>
							<div className='flex items-center gap-4'>
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
									className='text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent'
								>
									Releases
								</Text>
							</div>

							{/* New Release Button */}
							<motion.div
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.4, delay: 0.2 }}
							>
								<Button
									onClick={() => setShowReleaseForm(true)}
									className='flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium shadow-lg shadow-purple-500/30'
								>
									<Plus className='w-5 h-5' />
									<span>New Release</span>
								</Button>
							</motion.div>
						</motion.div>

						{/* Content Area */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							className='flex-1 pb-8'
						>
							{events.length > 0 ? (
								<div className='space-y-8'>
									{/* This Month Section */}
									{groupedReleases.thisMonth.length > 0 && (
										<CollapsibleSection
											title='This Month'
											count={groupedReleases.thisMonth.length}
											icon={<Calendar className='w-5 h-5' />}
											defaultOpen={true}
										>
											<div className='space-y-4'>
												{groupedReleases.thisMonth.map((event, index) => (
													<motion.div
														key={event.id}
														initial={{ opacity: 0, y: 20 }}
														animate={{ opacity: 1, y: 0 }}
														transition={{ delay: index * 0.05 }}
													>
														<ReleaseCard
															event={event}
															onDelete={handleDeleteRelease}
															onAddItem={handleAddItem}
															onUpdateItem={handleUpdateItem}
															onDeleteItem={handleDeleteItem}
															onToggleStatus={handleToggleStatus}
														/>
													</motion.div>
												))}
											</div>
										</CollapsibleSection>
									)}

									{/* Upcoming Section */}
									{groupedReleases.upcoming.length > 0 && (
										<CollapsibleSection
											title='Upcoming'
											count={groupedReleases.upcoming.length}
											icon={<Clock className='w-5 h-5' />}
											defaultOpen={true}
										>
											<div className='space-y-4'>
												{groupedReleases.upcoming.map((event, index) => (
													<motion.div
														key={event.id}
														initial={{ opacity: 0, y: 20 }}
														animate={{ opacity: 1, y: 0 }}
														transition={{ delay: index * 0.05 }}
													>
														<ReleaseCard
															event={event}
															onDelete={handleDeleteRelease}
															onAddItem={handleAddItem}
															onUpdateItem={handleUpdateItem}
															onDeleteItem={handleDeleteItem}
															onToggleStatus={handleToggleStatus}
														/>
													</motion.div>
												))}
											</div>
										</CollapsibleSection>
									)}

									{/* Previous Section */}
									{groupedReleases.previous.length > 0 && (
										<CollapsibleSection
											title='Previous'
											count={groupedReleases.previous.length}
											icon={<History className='w-5 h-5' />}
											defaultOpen={false}
										>
											<div className='space-y-4'>
												{groupedReleases.previous.map((event, index) => (
													<motion.div
														key={event.id}
														initial={{ opacity: 0, y: 20 }}
														animate={{ opacity: 1, y: 0 }}
														transition={{ delay: index * 0.05 }}
													>
														<ReleaseCard
															event={event}
															onDelete={handleDeleteRelease}
															onAddItem={handleAddItem}
															onUpdateItem={handleUpdateItem}
															onDeleteItem={handleDeleteItem}
															onToggleStatus={handleToggleStatus}
														/>
													</motion.div>
												))}
											</div>
										</CollapsibleSection>
									)}
								</div>
							) : (
								<div className='glass-strong rounded-3xl p-12 w-full min-h-[500px] flex items-center justify-center border border-white/20'>
									<div className='text-center space-y-6'>
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
										>
											<Package className='w-24 h-24 mx-auto text-purple-400/40' />
										</motion.div>
										<div className='space-y-2'>
											<h3 className='text-2xl font-bold text-white/60'>No Release Events Yet</h3>
											<p className='text-purple-300/40 text-sm max-w-md mx-auto'>
												Create your first release event to start tracking deployments, repositories,
												and production readiness.
											</p>
										</div>
										<Button
											onClick={() => setShowReleaseForm(true)}
											className='inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium shadow-lg shadow-purple-500/30'
										>
											<Plus className='w-5 h-5' />
											<span>Create First Release</span>
										</Button>
									</div>
								</div>
							)}
						</motion.div>
					</motion.div>
				</div>
			</PageLayout>

			{/* Release Form Dialog */}
			<Dialog open={showReleaseForm} onOpenChange={setShowReleaseForm}>
				<DialogContent className='glass-strong border-white/30 text-white max-w-2xl'>
					<DialogHeader>
						<DialogTitle className='text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent'>
							Create New Release Event
						</DialogTitle>
					</DialogHeader>
					<ReleaseEventForm
						onSubmit={handleCreateRelease}
						onCancel={() => setShowReleaseForm(false)}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default ReleasesPage;
