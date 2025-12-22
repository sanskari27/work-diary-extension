import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppearanceStyles } from '@/hooks/useAppearanceStyles';
import { formatRelativeTime } from '@/lib/dateUtils';
import { formatTodoDueDate, getTodoUrgencyLevel, isTodoOverdue } from '@/lib/todoUtils';
import { cn } from '@/lib/utils';
import { Todo, toggleTodoStatus, updateTodoStatus } from '@/store/slices/todosSlice';
import { RootState } from '@/store/store';
import { motion } from 'framer-motion';
import { Calendar, FileText, Flag, Link2, Search } from 'lucide-react';
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
	const { styles } = useAppearanceStyles();
	const cardStyles = styles.card();

	const linkedRelease = todo.linkedReleaseId
		? releases.find((r) => r.id === todo.linkedReleaseId)
		: null;

	const isOverdue = isTodoOverdue(todo);
	const isCompleted = todo.status === 'completed';
	const urgencyLevel = getTodoUrgencyLevel(todo);

	// Urgency styling based on level
	const urgencyStyles = {
		overdue: 'border-red-400/40 bg-red-500/10 shadow-red-500/20',
		'due-today': 'border-amber-400/40 bg-amber-500/10 shadow-amber-500/20',
		upcoming: 'border-white/20',
	};

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

	const badgeStyles = styles.badge();
	const buttonStyles = styles.button();

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, scale: 0.95 }}
			whileHover={{ scale: 1.02, y: -2 }}
			whileTap={{ scale: 0.98 }}
			transition={{
				duration: 0.2,
				hover: { duration: 0.15 },
				tap: { duration: 0.1 },
			}}
			className={cn(
				'group relative rounded-2xl border glass-strong shadow-lg transition-all hover:shadow-xl',
				cardStyles.padding,
				isCompleted && 'opacity-60',
				!isCompleted && urgencyStyles[urgencyLevel]
			)}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<div className={cn('flex items-start gap-3', cardStyles.spacing)}>
				{/* Checkbox */}
				<motion.div
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.9 }}
					transition={{ duration: 0.15 }}
				>
					<Checkbox
						checked={isCompleted}
						onClick={(e) => e.stopPropagation()}
						onCheckedChange={handleCheckboxChange}
						className='mt-1'
					/>
				</motion.div>

				{/* Content */}
				<div className='flex-1 cursor-pointer' onClick={() => onClick(todo)}>
					{/* Title */}
					<div className='flex items-center gap-2'>
						<h3
							className={cn(
								cardStyles.titleSize,
								'font-semibold text-white',
								isCompleted && 'line-through'
							)}
						>
							{todo.title}
						</h3>
						<div className='flex flex-wrap items-center gap-2'>
							{/* Status Badge */}
							<Badge
								variant='secondary'
								className={cn(badgeStyles.textSize, badgeStyles.padding, statusColors[todo.status])}
							>
								{todo.status === 'in-progress' ? 'In Progress' : todo.status}
							</Badge>

							{/* Urgent Badge */}
							{todo.isUrgent && (
								<Badge
									variant='destructive'
									className={cn(
										'flex items-center gap-1',
										badgeStyles.textSize,
										badgeStyles.padding
									)}
								>
									<Flag className={badgeStyles.iconSize} />
									Urgent
								</Badge>
							)}

							{/* Linked Release Badge */}
							{linkedRelease && (
								<Badge
									variant='outline'
									className={cn(
										'flex items-center gap-1',
										badgeStyles.textSize,
										badgeStyles.padding
									)}
								>
									<Link2 className={badgeStyles.iconSize} />
									{linkedRelease.title}
								</Badge>
							)}

							{/* Origin Badge */}
							{todo.origin && (
								<Badge
									variant='outline'
									className={cn(
										'flex items-center gap-1 text-text-secondary/70 border-text-secondary/30',
										badgeStyles.textSize,
										badgeStyles.padding
									)}
									title={`Created from ${todo.origin}`}
								>
									{todo.origin === 'search' && <Search className={badgeStyles.iconSize} />}
									{todo.origin === 'release' && <Calendar className={badgeStyles.iconSize} />}
									{todo.origin === 'brain-dump' && <FileText className={badgeStyles.iconSize} />}
									{todo.origin === 'manual' && null}
									<span className='capitalize'>
										{todo.origin === 'brain-dump' ? 'Brain dump' : todo.origin}
									</span>
								</Badge>
							)}
						</div>
					</div>

					{/* Due Date */}
					<p
						className={cn(
							'mt-1 gap-1 inline-flex items-center',
							cardStyles.textSize,
							isOverdue && !isCompleted ? 'font-medium text-red-400' : 'text-text-secondary'
						)}
					>
						<span>{formatTodoDueDate(todo.date)}</span>
						<span>[{formatRelativeTime(todo.date)}]</span>
					</p>

					{/* Badges */}
				</div>

				{/* Quick Status Actions */}
				{availableActions.length > 0 && (
					<div className={cn('flex flex-col items-end', cardStyles.spacing)}>
						<div className='flex flex-wrap justify-end gap-2'>
							{availableActions.map(({ label, value }) => (
								<Button
									key={value}
									size='sm'
									variant='ghost'
									className={cn(
										buttonStyles.padding,
										buttonStyles.textSize,
										'transition-colors border border-white/10 text-text-secondary hover:text-white hover:bg-white/10',
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
		</motion.div>
	);
}
