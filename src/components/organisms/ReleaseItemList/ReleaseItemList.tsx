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
import { useEffect, useState } from 'react';

interface ReleaseItemListProps {
	items: ReleaseItem[];
	eventId: string;
	onUpdate: (eventId: string, itemId: string, updates: any) => void;
	onDelete: (eventId: string, itemId: string) => void;
	onToggleStatus: (eventId: string, itemId: string, statusName: string) => void;
	expandItemId?: string;
}

const ReleaseItemList = ({
	items,
	eventId,
	onDelete,
	onToggleStatus,
	expandItemId,
}: ReleaseItemListProps) => {
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
					expanded={expandItemId === item.id}
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
	expanded?: boolean;
}

const ReleaseItemCard = ({
	item,
	eventId,
	index,
	onDelete,
	onToggleStatus,
	expanded,
}: ReleaseItemCardProps) => {
	// Get appearance settings from Redux store
	const appearance = useAppSelector((state) => state.settings.appearanceSettings);
	const customStatuses = useAppSelector((state) => state.settings.customStatuses);

	const [isExpanded, setIsExpanded] = useState(expanded || false);

	// Update expanded state when prop changes
	useEffect(() => {
		if (expanded !== undefined) {
			setIsExpanded(expanded);
		}
	}, [expanded]);

	// Filter statuses to only show visible ones based on settings
	const visibleStatuses = item.statuses.filter((status) => {
		const customStatus = customStatuses.find((cs) => cs.name === status.name);
		return customStatus ? customStatus.isVisible : true;
	});

	const completedStatuses = visibleStatuses.filter((s) => s.checked).length;
	const totalStatuses = visibleStatuses.length;
	const progress = totalStatuses > 0 ? (completedStatuses / totalStatuses) * 100 : 0;

	// Get size-based styles
	const getSizeStyles = () => {
		switch (appearance.cardSize) {
			case 'small':
				return {
					padding: appearance.compactMode ? 'p-2' : 'p-3',
					titleSize: 'text-base',
					textSize: 'text-xs',
					iconSize: 'w-3 h-3',
					spacing: 'space-y-1.5',
					gap: 'gap-2',
				};
			case 'large':
				return {
					padding: appearance.compactMode ? 'p-5' : 'p-6',
					titleSize: 'text-xl',
					textSize: 'text-base',
					iconSize: 'w-5 h-5',
					spacing: 'space-y-3',
					gap: 'gap-4',
				};
			default: // medium
				return {
					padding: appearance.compactMode ? 'p-3' : 'p-4',
					titleSize: 'text-lg',
					textSize: 'text-sm',
					iconSize: 'w-4 h-4',
					spacing: 'space-y-2',
					gap: 'gap-3',
				};
		}
	};

	const sizeStyles = getSizeStyles();

	return (
		<motion.div
			initial={{ opacity: 0, x: -20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ delay: index * 0.05 }}
			className={`bg-white/5 rounded-xl border border-white/10 overflow-hidden hover:border-white/20 transition-colors flex flex-col ${
				appearance.minimalMode ? 'shadow-none' : ''
			}`}
		>
			{/* Item Header */}
			<div className={sizeStyles.padding}>
				<div className={`flex items-start justify-between ${sizeStyles.gap}`}>
					<div className={`flex-1 ${sizeStyles.spacing}`}>
						{/* Repo Name */}
						<div className='flex items-center gap-2'>
							<Github className={`${sizeStyles.iconSize} text-text-accent`} />
							<h4 className={`${sizeStyles.titleSize} font-semibold text-white`}>
								{item.repoName}
							</h4>
						</div>

						{/* Links */}
						{!appearance.minimalMode && (
							<div className={`flex flex-wrap ${sizeStyles.gap} ${sizeStyles.textSize}`}>
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
						)}

						{/* Lead Name */}
						{appearance.showLeadSection && item.leadName && !appearance.minimalMode && (
							<div className={`flex items-center gap-2 ${sizeStyles.textSize} text-white/60`}>
								<User className='w-3 h-3' />
								<span>{item.leadName}</span>
							</div>
						)}
					</div>

					{/* Actions */}
					<div className='flex gap-2'>
						<Button
							variant='ghost'
							size='icon'
							onClick={() => setIsExpanded(!isExpanded)}
							className={`${appearance.compactMode ? 'p-1.5' : 'p-2'} rounded-lg hover:bg-white/10`}
						>
							{isExpanded ? (
								<ChevronUp className={`${sizeStyles.iconSize} text-text-secondary`} />
							) : (
								<ChevronDown className={`${sizeStyles.iconSize} text-text-secondary`} />
							)}
						</Button>
						{!appearance.minimalMode && (
							<Button
								variant='ghost'
								size='icon'
								onClick={() => onDelete(eventId, item.id)}
								className={`${
									appearance.compactMode ? 'p-1.5' : 'p-2'
								} rounded-lg hover:bg-red-500/20 group`}
							>
								<Trash2
									className={`${sizeStyles.iconSize} text-text-secondary group-hover:text-red-400`}
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
						className='border-t border-white/10'
					>
						<div
							className={`${sizeStyles.padding} ${
								appearance.compactMode ? 'space-y-2' : 'space-y-4'
							}`}
						>
							{/* Description */}
							{appearance.showDescriptionSection && item.description && (
								<div className={appearance.compactMode ? 'space-y-1' : 'space-y-2'}>
									<div className={`flex items-center gap-2 ${sizeStyles.textSize} text-white/60`}>
										<FileText className={sizeStyles.iconSize} />
										<span className='font-medium'>Notes</span>
									</div>
									<p
										className={`${sizeStyles.textSize} text-text-secondary pl-6 whitespace-pre-wrap`}
									>
										{item.description}
									</p>
								</div>
							)}

							{/* Statuses */}
							{appearance.showStatusCheckboxes && visibleStatuses.length > 0 && (
								<div className={appearance.compactMode ? 'space-y-1.5' : 'space-y-2'}>
									<div className={`${sizeStyles.textSize} text-white/60 font-medium`}>
										Status Checklist
									</div>
									<div
										className={`grid grid-cols-1 sm:grid-cols-2 ${
											appearance.compactMode ? 'gap-1.5' : 'gap-2'
										}`}
									>
										{visibleStatuses.map((status) => (
											<Button
												key={status.name}
												onClick={() => onToggleStatus(eventId, item.id, status.name)}
												variant='ghost'
												className={`flex items-center gap-${appearance.compactMode ? '2' : '3'} ${
													appearance.compactMode ? 'p-2' : 'p-3'
												} rounded-lg justify-start h-auto ${
													status.checked
														? 'bg-green-500/20 border border-green-500/30 hover:bg-green-500/30'
														: 'bg-white/5 border border-white/10 hover:bg-white/10'
												}`}
											>
												{status.checked ? (
													<CheckCircle2
														className={`${
															appearance.compactMode ? 'w-4 h-4' : 'w-5 h-5'
														} text-green-400 flex-shrink-0`}
													/>
												) : (
													<Circle
														className={`${
															appearance.compactMode ? 'w-4 h-4' : 'w-5 h-5'
														} text-white/40 flex-shrink-0`}
													/>
												)}
												<span
													className={`${sizeStyles.textSize} ${
														status.checked
															? 'text-green-300 font-medium'
															: 'text-text-secondary'
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

			{/* Progress Bar - Full Width at Bottom */}
			{totalStatuses > 0 && (
				<div className='mt-auto border-t border-white/10 bg-white/5'>
					<div
						className={`px-${appearance.compactMode ? '3' : '4'} py-${
							appearance.compactMode ? '2' : '2.5'
						} space-y-${appearance.compactMode ? '1' : '1.5'}`}
					>
						<div className='flex items-center justify-between text-xs text-white/50'>
							<span>Progress</span>
							<span>
								{completedStatuses} / {totalStatuses} ({Math.round(progress)}%)
							</span>
						</div>
						<div
							className={`w-full ${
								appearance.compactMode ? 'h-1' : 'h-1.5'
							} bg-white/10 rounded-full overflow-hidden`}
						>
							<motion.div
								initial={{ width: 0 }}
								animate={{ width: `${progress}%` }}
								transition={{ duration: 0.5 }}
								className={`h-full ${
									progress === 100
										? 'bg-gradient-to-r from-green-500 to-emerald-500'
										: 'bg-progress-gradient'
								}`}
							/>
						</div>
					</div>
				</div>
			)}
		</motion.div>
	);
};

export default ReleaseItemList;
