import { BookmarkSearchBadge, ReleaseSearchBadge, TodoSearchBadge } from '@/components/molecules';
import { MasterSearchResult } from '@/hooks/useMasterSearch';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/store/hooks';
import { Bookmark } from '@/store/slices/bookmarksSlice';
import { ReleaseEvent, ReleaseItem } from '@/store/slices/releasesSlice';
import { Todo } from '@/store/slices/todosSlice';
import { motion } from 'framer-motion';

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
		<motion.div
			initial={{ opacity: 0, scale: 0.8 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.2, delay: index * 0.05 }}
			className={cn(
				'glass rounded-full border border-white/20 hover:border-glass-border-strong hover:bg-white/5 cursor-pointer transition-all inline-flex items-center overflow-hidden line-clamp-1',
				compactMode ? 'px-2 py-1.5 max-w-[14rem]' : 'px-3 py-2 max-w-[16rem]',
				className
			)}
			onClick={onClick}
		>
			{renderContent()}
		</motion.div>
	);
};

export default MasterSearchBadge;
