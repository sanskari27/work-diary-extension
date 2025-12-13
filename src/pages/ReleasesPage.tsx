import { Text } from '@/components/atoms';
import { CollapsibleSection } from '@/components/molecules';
import { ReleaseCard, ReleaseEventForm } from '@/components/organisms';
import { PageLayout } from '@/components/templates';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getCurrentMonth, getCurrentYear, getDateStart, getTodayStart } from '@/lib/dateUtils';
import { sortDescending, sortThisMonthReleases } from '@/lib/sortingUtils';
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
import { useSearchParams } from 'react-router-dom';

const ReleasesPage = () => {
	const dispatch = useAppDispatch();
	const events = useAppSelector((state) => state.releases.events);
	const customStatuses = useAppSelector((state) => state.settings.customStatuses);
	const appearance = useAppSelector((state) => state.settings.appearanceSettings);
	const [showReleaseForm, setShowReleaseForm] = useState(false);
	const [searchParams] = useSearchParams();
	const expandReleaseId = searchParams.get('expand');
	const expandItemId = searchParams.get('itemId');

	// Group and sort releases
	const groupedReleases = useMemo(() => {
		const currentYear = getCurrentYear();
		const currentMonth = getCurrentMonth();
		const todayStart = getTodayStart();

		const thisMonth: ReleaseEvent[] = [];
		const upcoming: ReleaseEvent[] = [];
		const previous: ReleaseEvent[] = [];

		// Filter out archived releases
		const activeEvents = events.filter((event) => !event.isArchived);

		activeEvents.forEach((event) => {
			const releaseDate = new Date(event.date);
			const releaseDateStart = getDateStart(event.date);

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

		return {
			thisMonth: sortThisMonthReleases(thisMonth),
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
		// Use custom statuses from the item if provided, otherwise use global defaults
		let statusNames: string[];

		if (item.customStatuses && item.customStatuses.length > 0) {
			// Item has custom statuses selected in the form
			statusNames = item.customStatuses;
		} else {
			// Fall back to visible global custom statuses
			statusNames = customStatuses
				.filter((status) => status.isVisible)
				.sort((a, b) => a.order - b.order)
				.map((status) => status.name);
		}

		// Remove customStatuses from item before passing to Redux (it's not part of the ReleaseItem structure)
		const { customStatuses: _, ...itemData } = item;

		dispatch(addReleaseItem({ eventId, item: itemData, customStatuses: statusNames }));
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

	// Get spacing based on appearance settings
	const getSpacing = () => {
		if (appearance.compactMode) {
			return {
				padding: 'p-4 md:p-6 lg:p-8',
				sectionGap: 'space-y-4',
				headerMargin: 'mb-4',
				iconSize: 'w-6 h-6',
				titleSize: 'text-4xl md:text-5xl',
			};
		} else if (appearance.cardSize === 'large') {
			return {
				padding: 'p-8 md:p-16 lg:p-20',
				sectionGap: 'space-y-10',
				headerMargin: 'mb-10',
				iconSize: 'w-10 h-10',
				titleSize: 'text-6xl md:text-7xl',
			};
		} else if (appearance.cardSize === 'small') {
			return {
				padding: 'p-4 md:p-8 lg:p-12',
				sectionGap: 'space-y-4',
				headerMargin: 'mb-6',
				iconSize: 'w-6 h-6',
				titleSize: 'text-3xl md:text-4xl',
			};
		}
		return {
			padding: 'p-6 md:p-12 lg:p-16',
			sectionGap: 'space-y-8',
			headerMargin: 'mb-8',
			iconSize: 'w-8 h-8',
			titleSize: 'text-5xl md:text-6xl',
		};
	};

	const spacing = getSpacing();

	return (
		<>
			<PageLayout>
				<div className={`min-h-screen ${spacing.padding} flex flex-col`}>
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
							className={`${spacing.headerMargin} flex items-center justify-between`}
						>
							<div className='flex items-center gap-4'>
								{!appearance.minimalMode && (
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
										className={`${
											appearance.compactMode ? 'p-3' : 'p-4'
										} rounded-2xl bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500`}
									>
										<Rocket className={spacing.iconSize + ' text-white'} />
									</motion.div>
								)}
								<Text
									variant='h1'
									className={`${spacing.titleSize} font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent`}
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
									className={`flex items-center gap-2 ${
										appearance.compactMode ? 'px-4 py-2' : 'px-6 py-3'
									} rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium shadow-lg shadow-purple-500/30`}
								>
									<Plus className={appearance.compactMode ? 'w-4 h-4' : 'w-5 h-5'} />
									<span className={appearance.compactMode ? 'text-sm' : ''}>New Release</span>
								</Button>
							</motion.div>
						</motion.div>

						{/* Content Area */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							className={`flex-1 ${appearance.compactMode ? 'pb-4' : 'pb-8'}`}
						>
							{events.length > 0 ? (
								<div className={spacing.sectionGap}>
									{/* This Month Section */}
									{groupedReleases.thisMonth.length > 0 && (
										<CollapsibleSection
											title='This Month'
											count={groupedReleases.thisMonth.length}
											icon={<Calendar className='w-5 h-5' />}
											defaultOpen={true}
										>
											<div className={appearance.compactMode ? 'space-y-2' : 'space-y-4'}>
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
															expandItemId={expandItemId || ''}
															expandReleaseId={expandReleaseId || ''}
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
											<div className={appearance.compactMode ? 'space-y-2' : 'space-y-4'}>
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
															expandItemId={expandItemId || ''}
															expandReleaseId={expandReleaseId || ''}
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
											<div className={appearance.compactMode ? 'space-y-2' : 'space-y-4'}>
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
															expandItemId={expandItemId || ''}
															expandReleaseId={expandReleaseId || ''}
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
