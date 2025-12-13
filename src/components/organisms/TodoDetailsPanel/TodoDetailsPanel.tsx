import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/lib/dateUtils';
import { formatTodoDueDate, isTodoOverdue } from '@/lib/todoUtils';
import { cn } from '@/lib/utils';
import { Todo } from '@/store/slices/todosSlice';
import { RootState } from '@/store/store';
import { Calendar, Clock, Flag, Link2, Trash2, X } from 'lucide-react';
import { useSelector } from 'react-redux';

interface TodoDetailsPanelProps {
	todo: Todo | null;
	onClose: () => void;
	onEdit: (todo: Todo) => void;
	onDelete: (todoId: string) => void;
}

export default function TodoDetailsPanel({
	todo,
	onClose,
	onEdit,
	onDelete,
}: TodoDetailsPanelProps) {
	const releases = useSelector((state: RootState) => state.releases.events);

	if (!todo) return null;

	const linkedRelease = todo.linkedReleaseId
		? releases.find((r) => r.id === todo.linkedReleaseId)
		: null;

	const isOverdue = isTodoOverdue(todo);
	const isCompleted = todo.status === 'completed';

	const statusColors = {
		pending: 'bg-gray-200 text-gray-800',
		'in-progress': 'bg-blue-200 text-blue-800',
		completed: 'bg-green-200 text-green-800',
	};

	const handleDelete = () => {
		if (window.confirm('Are you sure you want to delete this todo?')) {
			onDelete(todo.id);
			onClose();
		}
	};

	return (
		<div className='fixed inset-0 z-50 flex items-start justify-end bg-black/50'>
			<div className='h-full w-full max-w-lg overflow-y-auto bg-white shadow-xl glass-strong bg-background-gradient'>
				{/* Header */}
				<div className='sticky top-0 z-10 flex items-center justify-between border-b glass-week p-4'>
					<h2 className='text-lg font-semibold text-text-primary'>Todo Details</h2>
					<Button variant='ghost' size='sm' onClick={onClose} className='hover:bg-white/10'>
						<X className='h-5 w-5 text-text-primary' />
					</Button>
				</div>

				{/* Content */}
				<div className='space-y-6 p-6'>
					{/* Title */}
					<div>
						<h1
							className={cn(
								'text-2xl font-bold text-text-primary',
								isCompleted && 'line-through opacity-60'
							)}
						>
							{todo.title}
						</h1>
					</div>

					{/* Status & Urgent Badges */}
					<div className='flex flex-wrap gap-2'>
						<Badge variant='secondary' className={cn('text-sm', statusColors[todo.status])}>
							{todo.status === 'in-progress' ? 'In Progress' : todo.status}
						</Badge>
						{todo.isUrgent && (
							<Badge variant='destructive' className='flex items-center gap-1 text-sm'>
								<Flag className='h-4 w-4' />
								Urgent
							</Badge>
						)}
					</div>

					{/* Due Date & Time */}
					<div className='space-y-2'>
						<div className='flex items-center gap-2 text-gray-700'>
							<Calendar className='h-5 w-5 text-gray-200' />
							<div>
								<p className='text-sm font-medium text-text-secondary'>Due Date</p>
								<p
									className={cn(
										'text-base inline-flex gap-1',
										isOverdue && !isCompleted
											? 'font-semibold text-red-600'
											: 'text-text-primary'
									)}
								>
									<span>{formatTodoDueDate(todo.date)} </span>
									<span>[{formatRelativeTime(todo.date)}]</span>
								</p>
							</div>
						</div>

						{/* Reminder Info */}
						{todo.reminderEnabled && (
							<div className='flex items-center gap-2 text-gray-700'>
								<Clock className='h-5 w-5 text-gray-200' />
								<div>
									<p className='text-sm font-medium text-text-secondary'>Reminder</p>
									<p className='text-base text-text-primary'>
										{todo.reminderDelta
											? `${todo.reminderDelta
													.replace('m', ' minutes')
													.replace('h', ' hours')
													.replace('d', ' days')} before`
											: 'Enabled'}
									</p>
								</div>
							</div>
						)}
					</div>

					{/* Description */}
					{todo.description && (
						<div>
							<h3 className='mb-2 text-sm font-semibold text-text-secondary'>Description</h3>
							<p className='whitespace-pre-wrap text-text-primary'>{todo.description}</p>
						</div>
					)}

					{/* Linked Release */}
					{linkedRelease && (
						<div>
							<h3 className='mb-2 flex items-center gap-2 text-sm font-semibold text-text-secondary'>
								<Link2 className='h-4 w-4 text-gray-200' />
								Linked to Release
							</h3>
							<div className='rounded-lg border bg-gray-50 p-3'>
								<p className='font-medium text-gray-900'>{linkedRelease.title}</p>
								<p className='text-sm text-gray-600'>
									{new Date(linkedRelease.date).toLocaleDateString('en-US', {
										weekday: 'long',
										year: 'numeric',
										month: 'long',
										day: 'numeric',
									})}
								</p>
							</div>
						</div>
					)}

					{/* Metadata */}
					<div className='border-t pt-4 text-xs text-text-secondary'>
						<p>Created: {new Date(todo.createdAt).toLocaleString()}</p>
						{todo.completedAt && <p>Completed: {new Date(todo.completedAt).toLocaleString()}</p>}
					</div>
				</div>

				{/* Actions */}
				<div className='sticky bottom-0 border-t glass-week p-4'>
					<div className='flex gap-2'>
						<Button
							variant='outline'
							className='flex-1 bg-white/10 hover:bg-white/15 border-white/20 text-text-primary'
							onClick={() => {
								onEdit(todo);
								onClose();
							}}
						>
							Edit Todo
						</Button>
						<Button variant='destructive' onClick={handleDelete}>
							<Trash2 className='h-4 w-4' />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
