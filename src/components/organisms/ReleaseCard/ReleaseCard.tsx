import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ReleaseEvent } from '@/store/slices/releasesSlice';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Calendar, ChevronDown, ChevronUp, Package, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ReleaseItemForm from '../ReleaseItemForm/ReleaseItemForm';
import ReleaseItemList from '../ReleaseItemList/ReleaseItemList';

interface ReleaseCardProps {
	event: ReleaseEvent;
	onDelete: (id: string) => void;
	onAddItem: (eventId: string, item: any) => void;
	onUpdateItem: (eventId: string, itemId: string, updates: any) => void;
	onDeleteItem: (eventId: string, itemId: string) => void;
	onToggleStatus: (eventId: string, itemId: string, statusName: string) => void;
}

const ReleaseCard = ({
	event,
	onDelete,
	onAddItem,
	onUpdateItem,
	onDeleteItem,
	onToggleStatus,
}: ReleaseCardProps) => {
	const [isExpanded, setIsExpanded] = useState(false);
	const [showItemForm, setShowItemForm] = useState(false);

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		});
	};

	const formatReminderDelta = (delta?: string) => {
		if (!delta) return '';
		const value = parseInt(delta.slice(0, -1));
		if (value === 1) return '1 day';
		if (value === 7) return '1 week';
		if (value === 14) return '2 weeks';
		if (value === 21) return '3 weeks';
		if (value === 30) return '1 month';
		return `${value} days`;
	};

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
				className='glass-strong rounded-2xl overflow-hidden border border-white/20'
			>
				{/* Card Header */}
				<div className='p-6'>
					<div className='flex items-start justify-between gap-4'>
						<div className='flex-1 space-y-3'>
							{/* Title */}
							<h3 className='text-2xl font-bold text-white'>{event.title}</h3>

							{/* Meta Info */}
							<div className='flex flex-wrap gap-4 text-sm'>
								<div className='flex items-center gap-2 text-white/70'>
									<Calendar className='w-4 h-4' />
									<span>{formatDate(event.date)}</span>
								</div>

								{event.reminderEnabled && event.reminderDelta && (
									<div className='flex items-center gap-2 text-purple-400'>
										<Bell className='w-4 h-4' />
										<span>{formatReminderDelta(event.reminderDelta)} before</span>
									</div>
								)}

								<div className='flex items-center gap-2 text-white/70'>
									<Package className='w-4 h-4' />
									<span>
										{event.items.length} {event.items.length === 1 ? 'item' : 'items'}
									</span>
								</div>
							</div>

							{/* Progress Bar */}
							{totalStatuses > 0 && (
								<div className='space-y-2'>
									<div className='flex items-center justify-between text-xs text-white/60'>
										<span>Progress</span>
										<span>
											{completedStatuses} / {totalStatuses} completed
										</span>
									</div>
									<div className='w-full h-2 bg-white/10 rounded-full overflow-hidden'>
										<motion.div
											initial={{ width: 0 }}
											animate={{ width: `${progress}%` }}
											transition={{ duration: 0.5 }}
											className='h-full bg-gradient-to-r from-purple-500 to-pink-500'
										/>
									</div>
								</div>
							)}
						</div>

						{/* Actions */}
						<div className='flex gap-2'>
							<Button
								variant='ghost'
								size='icon'
								onClick={() => setIsExpanded(!isExpanded)}
								className='p-2 rounded-xl hover:bg-white/10'
							>
								{isExpanded ? (
									<ChevronUp className='w-5 h-5 text-white/70' />
								) : (
									<ChevronDown className='w-5 h-5 text-white/70' />
								)}
							</Button>
							<Button
								variant='ghost'
								size='icon'
								onClick={() => onDelete(event.id)}
								className='p-2 rounded-xl hover:bg-red-500/20 group'
							>
								<Trash2 className='w-5 h-5 text-white/70 group-hover:text-red-400' />
							</Button>
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
							<div className='p-6 space-y-4'>
								{/* Add Item Button */}
								<Button
									onClick={() => setShowItemForm(true)}
									variant='ghost'
									className='w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-white/10 hover:bg-white/15 border border-dashed border-white/30 group'
								>
									<Plus className='w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform' />
									<span className='text-white/80 font-medium'>Add Item</span>
								</Button>

								{/* Items List */}
								{event.items.length > 0 && (
									<ReleaseItemList
										items={event.items}
										eventId={event.id}
										onUpdate={onUpdateItem}
										onDelete={onDeleteItem}
										onToggleStatus={onToggleStatus}
									/>
								)}

								{event.items.length === 0 && (
									<div className='text-center py-8 text-white/40'>
										<Package className='w-12 h-12 mx-auto mb-2 opacity-50' />
										<p>No items yet. Add your first item to get started.</p>
									</div>
								)}
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</motion.div>

			{/* Item Form Dialog */}
			<Dialog open={showItemForm} onOpenChange={setShowItemForm}>
				<DialogContent className='glass-strong border-white/30 text-white max-w-2xl'>
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
