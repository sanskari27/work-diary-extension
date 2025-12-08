import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/store/hooks';
import { ReleaseItem } from '@/store/slices/releasesSlice';
import { AnimatePresence, motion } from 'framer-motion';
import {
	CheckCircle2,
	ChevronDown,
	ChevronUp,
	Circle,
	ExternalLink,
	FileText,
	Github,
	Trash2,
	User,
} from 'lucide-react';
import { useState } from 'react';

interface ReleaseItemListProps {
	items: ReleaseItem[];
	eventId: string;
	onUpdate: (eventId: string, itemId: string, updates: any) => void;
	onDelete: (eventId: string, itemId: string) => void;
	onToggleStatus: (eventId: string, itemId: string, statusName: string) => void;
}

const ReleaseItemList = ({ items, eventId, onDelete, onToggleStatus }: ReleaseItemListProps) => {
	return (
		<div className='space-y-3'>
			{items.map((item, index) => (
				<ReleaseItemCard
					key={item.id}
					item={item}
					eventId={eventId}
					index={index}
					onDelete={onDelete}
					onToggleStatus={onToggleStatus}
				/>
			))}
		</div>
	);
};

interface ReleaseItemCardProps {
	item: ReleaseItem;
	eventId: string;
	index: number;
	onDelete: (eventId: string, itemId: string) => void;
	onToggleStatus: (eventId: string, itemId: string, statusName: string) => void;
}

const ReleaseItemCard = ({
	item,
	eventId,
	index,
	onDelete,
	onToggleStatus,
}: ReleaseItemCardProps) => {
	// Get appearance settings from Redux store
	const appearance = useAppSelector((state) => state.settings.appearanceSettings);
	const customStatuses = useAppSelector((state) => state.settings.customStatuses);

	const [isExpanded, setIsExpanded] = useState(false);

	// Filter statuses to only show visible ones based on settings
	const visibleStatuses = item.statuses.filter((status) => {
		const customStatus = customStatuses.find((cs) => cs.name === status.name);
		return customStatus ? customStatus.isVisible : true;
	});

	const completedStatuses = visibleStatuses.filter((s) => s.checked).length;
	const totalStatuses = visibleStatuses.length;
	const progress = totalStatuses > 0 ? (completedStatuses / totalStatuses) * 100 : 0;

	return (
		<motion.div
			initial={{ opacity: 0, x: -20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ delay: index * 0.05 }}
			className='bg-white/5 rounded-xl border border-white/10 overflow-hidden hover:border-white/20 transition-colors'
		>
			{/* Item Header */}
			<div className='p-4'>
				<div className='flex items-start justify-between gap-4'>
					<div className='flex-1 space-y-2'>
						{/* Repo Name */}
						<div className='flex items-center gap-2'>
							<Github className='w-4 h-4 text-purple-400' />
							<h4 className='text-lg font-semibold text-white'>{item.repoName}</h4>
						</div>

						{/* Links */}
						<div className='flex flex-wrap gap-3 text-sm'>
							<a
								href={item.repoLink}
								target='_blank'
								rel='noopener noreferrer'
								className='flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors'
							>
								<ExternalLink className='w-3 h-3' />
								<span>Repository</span>
							</a>
							{appearance.showPRLinkField && item.prLink && (
								<a
									href={item.prLink}
									target='_blank'
									rel='noopener noreferrer'
									className='flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors'
								>
									<ExternalLink className='w-3 h-3' />
									<span>Pull Request</span>
								</a>
							)}
						</div>

						{/* Lead Name */}
						{appearance.showLeadSection && item.leadName && (
							<div className='flex items-center gap-2 text-sm text-white/60'>
								<User className='w-3 h-3' />
								<span>{item.leadName}</span>
							</div>
						)}

						{/* Progress */}
						<div className='space-y-1'>
							<div className='flex items-center justify-between text-xs text-white/50'>
								<span>
									{completedStatuses} / {totalStatuses} completed
								</span>
								<span>{Math.round(progress)}%</span>
							</div>
							<div className='w-full h-1.5 bg-white/10 rounded-full overflow-hidden'>
								<motion.div
									initial={{ width: 0 }}
									animate={{ width: `${progress}%` }}
									transition={{ duration: 0.5 }}
									className={`h-full ${
										progress === 100
											? 'bg-gradient-to-r from-green-500 to-emerald-500'
											: 'bg-gradient-to-r from-purple-500 to-pink-500'
									}`}
								/>
							</div>
						</div>
					</div>

					{/* Actions */}
					<div className='flex gap-2'>
						<Button
							variant='ghost'
							size='icon'
							onClick={() => setIsExpanded(!isExpanded)}
							className='p-2 rounded-lg hover:bg-white/10'
						>
							{isExpanded ? (
								<ChevronUp className='w-4 h-4 text-white/70' />
							) : (
								<ChevronDown className='w-4 h-4 text-white/70' />
							)}
						</Button>
						<Button
							variant='ghost'
							size='icon'
							onClick={() => onDelete(eventId, item.id)}
							className='p-2 rounded-lg hover:bg-red-500/20 group'
						>
							<Trash2 className='w-4 h-4 text-white/70 group-hover:text-red-400' />
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
						className='border-t border-white/10'
					>
						<div className='p-4 space-y-4'>
							{/* Description */}
							{appearance.showDescriptionSection && item.description && (
								<div className='space-y-2'>
									<div className='flex items-center gap-2 text-sm text-white/60'>
										<FileText className='w-4 h-4' />
										<span className='font-medium'>Notes</span>
									</div>
									<p className='text-sm text-white/70 pl-6 whitespace-pre-wrap'>
										{item.description}
									</p>
								</div>
							)}

							{/* Statuses */}
							{appearance.showStatusCheckboxes && visibleStatuses.length > 0 && (
								<div className='space-y-2'>
									<div className='text-sm text-white/60 font-medium'>Status Checklist</div>
									<div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
										{visibleStatuses.map((status) => (
											<Button
												key={status.name}
												onClick={() => onToggleStatus(eventId, item.id, status.name)}
												variant='ghost'
												className={`flex items-center gap-3 p-3 rounded-lg justify-start h-auto ${
													status.checked
														? 'bg-green-500/20 border border-green-500/30 hover:bg-green-500/30'
														: 'bg-white/5 border border-white/10 hover:bg-white/10'
												}`}
											>
												{status.checked ? (
													<CheckCircle2 className='w-5 h-5 text-green-400 flex-shrink-0' />
												) : (
													<Circle className='w-5 h-5 text-white/40 flex-shrink-0' />
												)}
												<span
													className={`text-sm ${
														status.checked ? 'text-green-300 font-medium' : 'text-white/70'
													}`}
												>
													{status.name}
												</span>
											</Button>
										))}
									</div>
								</div>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
};

export default ReleaseItemList;
