import { GroupLabel } from '@/components/atoms';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Notebook } from '@/types/notebooks';
import { Edit, Trash2 } from 'lucide-react';

interface NotebookCardProps {
	notebook: Notebook;
	nodeCount: number;
	onClick?: (notebook: Notebook) => void;
	onEdit?: (notebook: Notebook) => void;
	onDelete?: (notebookId: string) => void;
	className?: string;
}

const NotebookCard = ({
	notebook,
	nodeCount,
	onClick,
	onEdit,
	onDelete,
	className,
}: NotebookCardProps) => {
	const handleClick = () => {
		onClick?.(notebook);
	};

	const handleEdit = (e: React.MouseEvent) => {
		e.stopPropagation();
		onEdit?.(notebook);
	};

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		onDelete?.(notebook.id);
	};

	return (
		<div
			className={cn(
				'glass-strong rounded-lg border p-4 cursor-pointer transition-all hover:scale-105 hover:border-primary/50',
				className
			)}
			onClick={handleClick}
		>
			<div className='flex items-start justify-between gap-2 mb-2'>
				<GroupLabel notebook={notebook} size='md' />
				<div className='flex items-center gap-1'>
					{onEdit && (
						<Button variant='ghost' size='sm' className='h-6 w-6 p-0' onClick={handleEdit}>
							<Edit className='w-3 h-3' />
						</Button>
					)}
					{onDelete && (
						<Button
							variant='ghost'
							size='sm'
							className='h-6 w-6 p-0 text-red-400 hover:text-red-300'
							onClick={handleDelete}
						>
							<Trash2 className='w-3 h-3' />
						</Button>
					)}
				</div>
			</div>
			{notebook.description && (
				<p className='text-sm text-text-secondary mb-2 line-clamp-2'>{notebook.description}</p>
			)}
			<div className='text-xs text-text-secondary'>
				{nodeCount} {nodeCount === 1 ? 'node' : 'nodes'}
			</div>
		</div>
	);
};

export default NotebookCard;
