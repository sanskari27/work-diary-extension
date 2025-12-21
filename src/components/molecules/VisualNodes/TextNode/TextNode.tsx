import { cn } from '@/lib/utils';
import { useAppDispatch } from '@/store/hooks';
import { deleteNodeFromNote, updateNodeInNote } from '@/store/slices/visualNotesSlice';
import { TextNodeData, VisualNode } from '@/types/visualNotes';
import { Handle, NodeProps, Position } from '@xyflow/react';
import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface TextNodeProps extends NodeProps {
	data: {
		node: VisualNode;
		noteId: string;
	};
}

const TextNode = ({ data, selected }: TextNodeProps) => {
	const dispatch = useAppDispatch();
	const node = data.node;
	const nodeData = node.data as TextNodeData;
	const [isEditing, setIsEditing] = useState(false);
	const [content, setContent] = useState(nodeData.content);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		setContent(nodeData.content);
	}, [nodeData.content]);

	useEffect(() => {
		if (isEditing && textareaRef.current) {
			textareaRef.current.focus();
			textareaRef.current.select();
		}
	}, [isEditing]);

	const handleSave = () => {
		dispatch(
			updateNodeInNote({
				noteId: data.noteId,
				nodeId: node.id,
				updates: {
					data: {
						...nodeData,
						content: content.trim(),
					},
				},
			})
		);
		setIsEditing(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
			handleSave();
		} else if (e.key === 'Escape') {
			setContent(nodeData.content);
			setIsEditing(false);
		}
	};

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (confirm('Delete this node?')) {
			dispatch(deleteNodeFromNote({ noteId: data.noteId, nodeId: node.id }));
		}
	};

	return (
		<div
			className={cn(
				'glass-strong rounded-lg border border-white/20 p-3 min-w-[200px] min-h-[100px] relative group',
				selected && 'ring-2 ring-primary'
			)}
		>
			<Handle type='target' position={Position.Top} />
			{!isEditing && (
				<button
					onClick={handleDelete}
					className='absolute top-2 right-2 p-1 bg-black/50 rounded hover:bg-red-500/50 transition-colors opacity-0 group-hover:opacity-100 z-10'
					title='Delete node'
				>
					<X className='w-3 h-3 text-white' />
				</button>
			)}
			{isEditing ? (
				<textarea
					ref={textareaRef}
					value={content}
					onChange={(e) => setContent(e.target.value)}
					onBlur={handleSave}
					onKeyDown={handleKeyDown}
					className='w-full h-full bg-transparent text-white placeholder:text-white/40 resize-none outline-none'
					style={{ minHeight: '80px' }}
				/>
			) : (
				<div
					onClick={() => setIsEditing(true)}
					className='w-full h-full cursor-text text-white whitespace-pre-wrap break-words'
				>
					{nodeData.content || <span className='text-white/40'>Click to edit</span>}
				</div>
			)}
			<Handle type='source' position={Position.Bottom} />
		</div>
	);
};

export default TextNode;
