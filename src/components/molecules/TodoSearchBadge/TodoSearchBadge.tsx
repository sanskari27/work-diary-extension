import { cn } from '@/lib/utils';
import { useAppSelector } from '@/store/hooks';
import { Todo } from '@/store/slices/todosSlice';
import { Calendar } from 'lucide-react';

interface TodoSearchBadgeProps {
	todo: Todo;
	className?: string;
}

const TodoSearchBadge = ({ todo, className }: TodoSearchBadgeProps) => {
	const compactMode = useAppSelector((state) => state.settings.appearanceSettings.compactMode);
	return (
		<div className={cn('flex items-center', compactMode ? 'gap-1.5' : 'gap-2', className)}>
			<div className='flex-shrink-0'>
				<Calendar
					className={cn('text-text-accent', compactMode ? 'w-3.5 h-3.5' : 'w-4 h-4')}
				/>
			</div>
			<div className='flex-1 min-w-0'>
				<div
					className={cn('font-medium text-white truncate', compactMode ? 'text-[10px]' : 'text-xs')}
					title={todo.title}
				>
					{todo.title}
				</div>
				<div
					className={cn('text-text-secondary/60', compactMode ? 'text-[9px]' : 'text-[10px]')}
				>
					Todo • {todo.status}
					{todo.description &&
						` • ${todo.description.substring(0, 25)}${todo.description.length > 25 ? '...' : ''}`}
				</div>
			</div>
		</div>
	);
};

export default TodoSearchBadge;
