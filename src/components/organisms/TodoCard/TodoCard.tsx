import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { formatRelativeTime } from '@/lib/dateUtils';
import { formatTodoDueDate, isTodoOverdue } from '@/lib/todoUtils';
import { cn } from '@/lib/utils';
import { Todo, toggleTodoStatus, updateTodoStatus } from '@/store/slices/todosSlice';
import { RootState } from '@/store/store';
import { Flag, Link2 } from 'lucide-react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface TodoCardProps {
	todo: Todo;
	onEdit: (todo: Todo) => void;
	onDelete: (todoId: string) => void;
	onClick: (todo: Todo) => void;
}

export default function TodoCard({ todo, onClick }: TodoCardProps) {
	const dispatch = useDispatch();
	const releases = useSelector((state: RootState) => state.releases.events);
	const [isHovered, setIsHovered] = useState(false);

	const linkedRelease = todo.linkedReleaseId
		? releases.find((r) => r.id === todo.linkedReleaseId)
		: null;

	const isOverdue = isTodoOverdue(todo);
	const isCompleted = todo.status === 'completed';

	const handleCheckboxChange = () => {
		dispatch(toggleTodoStatus(todo.id));
	};

	const handleStatusChange = (status: 'pending' | 'in-progress' | 'completed') => {
		dispatch(updateTodoStatus({ id: todo.id, status }));
	};

	const statusColors = {
		pending: 'bg-gray-200 text-gray-800',
		'in-progress': 'bg-blue-200 text-blue-800',
		completed: 'bg-green-200 text-green-800',
	};

	const statusActions: { label: string; value: Todo['status'] }[] = [
		{ label: 'Mark as Pending', value: 'pending' },
		{ label: 'Mark In Progress', value: 'in-progress' },
		{ label: 'Mark as Completed', value: 'completed' },
	];

	// Show only the next step in the workflow
	const getAvailableActions = () => {
		switch (todo.status) {
			case 'pending':
				return statusActions.filter((action) => action.value === 'in-progress');
			case 'in-progress':
				return statusActions.filter((action) => action.value === 'completed');
			case 'completed':
				return []; // No actions for completed todos
			default:
				return [];
		}
	};

	const availableActions = getAvailableActions();

	return (
		<div
			className={cn(
				'group relative rounded-2xl border border-white/20 glass-strong p-4 shadow-lg transition-all hover:shadow-xl',
				isCompleted && 'opacity-60',
				isOverdue && !isCompleted && 'border-red-400/40 bg-red-500/10'
			)}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<div className='flex items-start gap-3'>
				{/* Checkbox */}
				<Checkbox
					checked={isCompleted}
					onClick={(e) => e.stopPropagation()}
					onCheckedChange={handleCheckboxChange}
					className='mt-1'
				/>

				{/* Content */}
				<div className='flex-1 cursor-pointer' onClick={() => onClick(todo)}>
					{/* Title */}
					<div className='flex items-center gap-2'>
						<h3 className={cn('text-base font-semibold text-white', isCompleted && 'line-through')}>
							{todo.title}
						</h3>
						<div className='flex flex-wrap items-center gap-2'>
							{/* Status Badge */}
							<Badge variant='secondary' className={cn('text-xs', statusColors[todo.status])}>
								{todo.status === 'in-progress' ? 'In Progress' : todo.status}
							</Badge>

							{/* Urgent Badge */}
							{todo.isUrgent && (
								<Badge variant='destructive' className='flex items-center gap-1 text-xs'>
									<Flag className='h-3 w-3' />
									Urgent
								</Badge>
							)}

							{/* Linked Release Badge */}
							{linkedRelease && (
								<Badge variant='outline' className='flex items-center gap-1 text-xs'>
									<Link2 className='h-3 w-3' />
									{linkedRelease.title}
								</Badge>
							)}
						</div>
					</div>

					{/* Due Date */}
					<p
						className={cn(
							'mt-1 text-sm gap-1 inline-flex items-center',
							isOverdue && !isCompleted ? 'font-medium text-red-400' : 'text-white/70'
						)}
					>
						<span>{formatTodoDueDate(todo.date)}</span>
						<span>[{formatRelativeTime(todo.date)}]</span>
					</p>

					{/* Badges */}
				</div>

				{/* Quick Status Actions */}
				{availableActions.length > 0 && (
					<div className='flex flex-col items-end gap-2'>
						<div className='flex flex-wrap justify-end gap-2'>
							{availableActions.map(({ label, value }) => (
								<Button
									key={value}
									size='sm'
									variant='ghost'
									className={cn(
										'h-8 px-3 text-xs transition-colors border border-white/10 text-white/80 hover:text-white hover:bg-white/10',
										isHovered ? 'opacity-100' : 'opacity-80'
									)}
									onClick={(e) => {
										e.stopPropagation();
										handleStatusChange(value);
									}}
								>
									{label}
								</Button>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
