import { ReleaseItemForm, ReleaseItemList } from '@/components/organisms';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatDate, formatReminderDelta, isDateInCurrentMonth } from '@/lib/dateUtils';
import { getReleaseTodoStats } from '@/lib/todoUtils';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/store/hooks';
import { ReleaseEvent } from '@/store/slices/releasesSlice';
import { AnimatePresence, motion } from 'framer-motion';
import { isEmpty } from 'lodash';
import {
	Bell,
	Calendar,
	CheckSquare,
	ChevronDown,
	ChevronUp,
	Package,
	Plus,
	Trash2,
} from 'lucide-react';
import { useState } from 'react';

interface ReleaseCardProps {
	event: ReleaseEvent;
	onDelete: (id: string) => void;
	onAddItem: (eventId: string, item: any) => void;
	onUpdateItem: (eventId: string, itemId: string, updates: any) => void;
	onDeleteItem: (eventId: string, itemId: string) => void;
	onToggleStatus: (eventId: string, itemId: string, statusName: string) => void;
	expandItemId?: string;
	expandReleaseId?: string;
}

const ReleaseCard = ({
	event,
	onDelete,
	onAddItem,
	onUpdateItem,
	onDeleteItem,
	onToggleStatus,
	expandItemId,
	expandReleaseId,
}: ReleaseCardProps) => {
	const appearance = useAppSelector((state) => state.settings.appearanceSettings);
	const todos = useAppSelector((state) => state.todos.todos);

	// Auto-expand if the event is in the current month, or if expanded prop is true
	const [isExpanded, setIsExpanded] = useState(() =>
		!isEmpty(expandReleaseId) ? expandReleaseId === event.id : isDateInCurrentMonth(event.date)
	);
	const [showItemForm, setShowItemForm] = useState(false);

	// Get todo stats for this release
	const todoStats = getReleaseTodoStats(todos, event.id);

	// Get size-based styles
	const getSizeStyles = () => {
		switch (appearance.cardSize) {
			case 'small':
				return {
					padding: appearance.compactMode ? 'p-3' : 'p-4',
					titleSize: 'text-lg',
					metaSize: 'text-xs',
					iconSize: 'w-3.5 h-3.5',
					spacing: 'space-y-2',
					buttonPadding: 'p-1.5',
				};
			case 'large':
				return {
					padding: appearance.compactMode ? 'p-6' : 'p-8',
					titleSize: 'text-3xl',
					metaSize: 'text-base',
					iconSize: 'w-5 h-5',
					spacing: 'space-y-4',
					buttonPadding: 'p-3',
				};
			default: // medium
				return {
					padding: appearance.compactMode ? 'p-4' : 'p-6',
					titleSize: 'text-2xl',
					metaSize: 'text-sm',
					iconSize: 'w-4 h-4',
					spacing: 'space-y-3',
					buttonPadding: 'p-2',
				};
		}
	};

	const sizeStyles = getSizeStyles();

	const completedStatuses = event.items.reduce(
		(acc, item) => acc + item.statuses.filter((s) => s.checked).length,
		0
	);
	const totalStatuses = event.items.reduce((acc, item) => acc + item.statuses.length, 0);
	const progress = totalStatuses > 0 ? (completedStatuses / totalStatuses) * 100 : 0;

	return (
		<>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className={`glass-strong rounded-2xl overflow-hidden border border-white/20 flex flex-col ${
					appearance.minimalMode ? 'shadow-sm' : 'shadow-lg'
				}`}
			>
				{/* Card Header */}
				<div className={sizeStyles.padding}>
					<div className='flex items-start justify-between gap-4'>
						<div className={`flex-1 ${sizeStyles.spacing}`}>
							{/* Title */}
							<h3 className={`${sizeStyles.titleSize} font-bold text-white`}>{event.title}</h3>

							{/* Meta Info */}
							{!appearance.minimalMode && (
								<div
									className={`flex flex-wrap gap-${appearance.compactMode ? '2' : '4'} ${
										sizeStyles.metaSize
									}`}
								>
									<div className='flex items-center gap-2 text-white/70'>
										<Calendar className={sizeStyles.iconSize} />
										<span>{formatDate(event.date)}</span>
									</div>

									{event.reminderEnabled && event.reminderDelta && (
										<div className='flex items-center gap-2 text-purple-400'>
											<Bell className={sizeStyles.iconSize} />
											<span>{formatReminderDelta(event.reminderDelta)} before</span>
										</div>
									)}

									<div className='flex items-center gap-2 text-white/70'>
										<Package className={sizeStyles.iconSize} />
										<span>
											{event.items.length} {event.items.length === 1 ? 'item' : 'items'}
										</span>
									</div>

									{todoStats.total > 0 && (
										<div className='flex items-center gap-2 text-blue-400'>
											<CheckSquare className={sizeStyles.iconSize} />
											<span>
												{todoStats.pending} task{todoStats.pending !== 1 ? 's' : ''} pending
											</span>
										</div>
									)}
								</div>
							)}
						</div>

						{/* Actions */}
						<div className='flex gap-2'>
							<Button
								variant='ghost'
								size='icon'
								onClick={() => setIsExpanded(!isExpanded)}
								className={`${sizeStyles.buttonPadding} rounded-xl hover:bg-white/10`}
							>
								{isExpanded ? (
									<ChevronUp className={`${sizeStyles.iconSize} text-white/70`} />
								) : (
									<ChevronDown className={`${sizeStyles.iconSize} text-white/70`} />
								)}
							</Button>
							{!appearance.minimalMode && (
								<Button
									variant='ghost'
									size='icon'
									onClick={() => onDelete(event.id)}
									className={`${sizeStyles.buttonPadding} rounded-xl hover:bg-red-500/20 group`}
								>
									<Trash2
										className={`${sizeStyles.iconSize} text-white/70 group-hover:text-red-400`}
									/>
								</Button>
							)}
						</div>
					</div>
				</div>

				{/* Expanded Content */}
				<AnimatePresence>
					{isExpanded && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: 'auto', opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.2 }}
							className='border-t border-white/20'
						>
							<div
								className={`${sizeStyles.padding} ${
									appearance.compactMode ? 'space-y-2' : 'space-y-4'
								}`}
							>
								{/* Add Item Button */}
								<Button
									onClick={() => setShowItemForm(true)}
									variant='ghost'
									className={`w-full flex items-center justify-center gap-2 ${
										appearance.compactMode ? 'p-3' : 'p-4'
									} rounded-xl bg-white/10 hover:bg-white/15 border border-dashed border-white/30 group`}
								>
									<Plus
										className={`${sizeStyles.iconSize} text-purple-400 group-hover:scale-110 transition-transform`}
									/>
									<span className={`text-white/80 font-medium ${sizeStyles.metaSize}`}>
										Add Item
									</span>
								</Button>

								{/* Items List */}
								{event.items.length > 0 && (
									<ReleaseItemList
										items={event.items}
										eventId={event.id}
										onUpdate={onUpdateItem}
										onDelete={onDeleteItem}
										onToggleStatus={onToggleStatus}
										expandItemId={expandItemId}
									/>
								)}

								{event.items.length === 0 && !appearance.minimalMode && (
									<div
										className={`text-center ${
											appearance.compactMode ? 'py-4' : 'py-8'
										} text-white/40`}
									>
										<Package
											className={`${
												appearance.compactMode ? 'w-8 h-8' : 'w-12 h-12'
											} mx-auto mb-2 opacity-50`}
										/>
										<p className={sizeStyles.metaSize}>
											No items yet. Add your first item to get started.
										</p>
									</div>
								)}

								{/* Linked Todos Section */}
								{todoStats.total > 0 && (
									<div
										className={cn(
											`border-t border-white/20`,
											appearance.compactMode ? 'pt-2 mt-2' : 'pt-4 mt-4'
										)}
									>
										<div className='flex items-center justify-between mb-2'>
											<div className='flex items-center gap-2'>
												<CheckSquare className={`${sizeStyles.iconSize} text-blue-400`} />
												<span className={`${sizeStyles.metaSize} font-medium text-white/80`}>
													Linked Todos
												</span>
											</div>
											<div className='flex gap-2'>
												{todoStats.pending > 0 && (
													<Badge variant='secondary' className='bg-yellow-500/20 text-yellow-300'>
														{todoStats.pending} pending
													</Badge>
												)}
												{todoStats.completed > 0 && (
													<Badge variant='secondary' className='bg-green-500/20 text-green-300'>
														{todoStats.completed} completed
													</Badge>
												)}
											</div>
										</div>
										<p className={`${sizeStyles.metaSize} text-white/60`}>
											{todoStats.total} todo{todoStats.total !== 1 ? 's' : ''} linked to this
											release
										</p>
									</div>
								)}
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Progress Bar - Full Width at Bottom */}
				{totalStatuses > 0 && (
					<div className='mt-auto border-t border-white/20 bg-white/5'>
						<div
							className={`px-${appearance.compactMode ? '4' : '6'} py-${
								appearance.compactMode ? '2' : '3'
							} space-y-${appearance.compactMode ? '1' : '2'}`}
						>
							<div className={`flex items-center justify-between text-xs text-white/60`}>
								<span>Progress</span>
								<span>
									{completedStatuses} / {totalStatuses} completed
								</span>
							</div>
							<div
								className={`w-full ${
									appearance.compactMode ? 'h-1.5' : 'h-2'
								} bg-white/10 rounded-full overflow-hidden`}
							>
								<motion.div
									initial={{ width: 0 }}
									animate={{ width: `${progress}%` }}
									transition={{ duration: 0.5 }}
									className='h-full bg-gradient-to-r from-purple-500 to-pink-500'
								/>
							</div>
						</div>
					</div>
				)}
			</motion.div>

			{/* Item Form Dialog */}
			<Dialog open={showItemForm} onOpenChange={setShowItemForm}>
				<DialogContent className='glass-strong border-white/30 text-white max-w-2xl max-h-[90vh] overflow-y-auto'>
					<DialogHeader>
						<DialogTitle className='text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent'>
							Add New Item
						</DialogTitle>
					</DialogHeader>
					<ReleaseItemForm
						onSubmit={(item) => {
							onAddItem(event.id, item);
							setShowItemForm(false);
						}}
						onCancel={() => setShowItemForm(false)}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default ReleaseCard;
