import { NodeToken } from '@/components/atoms';
import { TagBadge } from '@/components/molecules';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Node, TagType } from '@/types/notebooks';
import { Edit, Pin, PinOff, Trash2 } from 'lucide-react';
import { memo } from 'react';

interface NodeCardProps {
	node: Node;
	onEdit?: (node: Node) => void;
	onDelete?: (nodeId: string) => void;
	onTogglePin?: (nodeId: string) => void;
	className?: string;
	showActions?: boolean;
}

const NodeCard = ({
	node,
	onEdit,
	onDelete,
	onTogglePin,
	className,
	showActions = true,
}: NodeCardProps) => {
	const tagColors: Record<TagType, string> = {
		idea: 'border-green-500/30 bg-green-500/10',
		bug: 'border-red-500/30 bg-red-500/10',
		followup: 'border-blue-500/30 bg-blue-500/10',
		decision: 'border-yellow-500/30 bg-yellow-500/10',
		neutral: 'border-gray-500/30 bg-gray-500/10',
	};

	return (
		<div
			className={cn(
				'glass-strong rounded-lg border p-3 transition-all',
				node.pinned && 'ring-2 ring-primary/50',
				node.tag && tagColors[node.tag],
				className
			)}
		>
			<div className='flex items-start justify-between gap-2 mb-2'>
				<div className='flex-1 flex items-center gap-2 flex-wrap'>
					{node.tag && <TagBadge tag={node.tag} />}
					{node.pinned && (
						<span className='text-xs text-text-secondary flex items-center gap-1'>
							<Pin className='w-3 h-3' />
							Pinned
						</span>
					)}
				</div>
				{showActions && (
					<div className='flex items-center gap-1'>
						{onTogglePin && (
							<Button
								variant='ghost'
								size='sm'
								className='h-6 w-6 p-0'
								onClick={() => onTogglePin(node.id)}
							>
								{node.pinned ? <PinOff className='w-3 h-3' /> : <Pin className='w-3 h-3' />}
							</Button>
						)}
						{onEdit && (
							<Button
								variant='ghost'
								size='sm'
								className='h-6 w-6 p-0'
								onClick={() => onEdit(node)}
							>
								<Edit className='w-3 h-3' />
							</Button>
						)}
						{onDelete && (
							<Button
								variant='ghost'
								size='sm'
								className='h-6 w-6 p-0 text-red-400 hover:text-red-300'
								onClick={() => onDelete(node.id)}
							>
								<Trash2 className='w-3 h-3' />
							</Button>
						)}
					</div>
				)}
			</div>
			<div className='text-sm'>
				<NodeToken node={node} />
			</div>
		</div>
	);
};

export default memo(NodeCard);
