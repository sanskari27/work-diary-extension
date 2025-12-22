import { BookmarkSearchBadge, ReleaseSearchBadge, TodoSearchBadge } from '@/components/molecules';
import { MasterSearchResult } from '@/hooks/useMasterSearch';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/store/hooks';
import { Bookmark } from '@/store/slices/bookmarksSlice';
import { ReleaseEvent, ReleaseItem } from '@/store/slices/releasesSlice';
import { Todo } from '@/store/slices/todosSlice';
import { motion } from 'framer-motion';
import { Bookmark as BookmarkIcon, Calendar, CheckSquare } from 'lucide-react';

interface MasterSearchBadgeProps {
	result: MasterSearchResult;
	index?: number;
	className?: string;
	onClick?: () => void;
}

const MasterSearchBadge = ({
	result,
	index = 0,
	className,
	onClick = () => {},
}: MasterSearchBadgeProps) => {
	const { type, result: data } = result;
	const compactMode = useAppSelector((state) => state.settings.appearanceSettings.compactMode);

	// Type badge configuration
	const typeConfig = {
		bookmark: {
			label: 'BOOKMARK',
			icon: BookmarkIcon,
			color: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
			source: 'From bookmarks',
		},
		release: {
			label: 'RELEASE',
			icon: Calendar,
			color: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
			source: 'From releases',
		},
		todo: {
			label: 'TODO',
			icon: CheckSquare,
			color: 'bg-green-500/20 text-green-300 border-green-400/30',
			source: 'From todos',
		},
	};

	const config = typeConfig[type];
	const Icon = config.icon;

	// Render based on type
	const renderContent = () => {
		switch (type) {
			case 'bookmark':
				return <BookmarkSearchBadge bookmark={data as Bookmark} />;
			case 'release':
				return <ReleaseSearchBadge release={data as ReleaseEvent | ReleaseItem} />;
			case 'todo':
				return <TodoSearchBadge todo={data as Todo} />;
			default:
				return null;
		}
	};

	return (
		<motion.button
			initial={{ opacity: 0, scale: 0.8 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.2, delay: index * 0.05 }}
			className={cn(
				'glass rounded-full border border-white/20 hover:border-glass-border-strong hover:bg-white/5 cursor-pointer transition-all inline-flex items-center gap-2 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary',
				compactMode ? 'px-2 py-1.5 max-w-[18rem]' : 'px-3 py-2 max-w-[20rem]',
				className
			)}
			type='button'
			onClick={onClick}
			title={config.source}
		>
			{/* Type Badge */}
			<div
				className={cn(
					'flex items-center gap-1 rounded-full border px-1.5 py-0.5 flex-shrink-0',
					config.color,
					compactMode ? 'text-[8px]' : 'text-[9px]'
				)}
			>
				<Icon className={compactMode ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
				{/* <span className='font-semibold uppercase tracking-tight'>{config.label}</span> */}
			</div>

			{/* Content */}
			<div className='flex-1 min-w-0'>{renderContent()}</div>
		</motion.button>
	);
};

export default MasterSearchBadge;
