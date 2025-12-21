import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addNode, redo, undo } from '@/store/slices/notebooksSlice';
import { NodeType, TagType } from '@/types/notebooks';
import { FilePlus, RotateCcw, RotateCw, Search } from 'lucide-react';
import { useState } from 'react';

interface NotebookToolbarProps {
	notebookId: string;
	onAddNode?: (nodeType: NodeType) => void;
	onSearchToggle?: () => void;
	className?: string;
}

const NotebookToolbar = ({
	notebookId,
	onAddNode,
	onSearchToggle,
	className,
}: NotebookToolbarProps) => {
	const dispatch = useAppDispatch();
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [newNodeType, setNewNodeType] = useState<NodeType>('text');
	const [newNodeContent, setNewNodeContent] = useState('');
	const [newNodeTag, setNewNodeTag] = useState<string>('none');
	const undoStack = useAppSelector((state) => state.notebooks.undoStacks[notebookId] || []);
	const redoStack = useAppSelector((state) => state.notebooks.redoStacks[notebookId] || []);

	const handleAddNode = () => {
		if (!newNodeContent.trim()) return;

		const newNode = {
			type: newNodeType,
			content: newNodeContent.trim(),
			position: { x: Math.random() * 400, y: Math.random() * 400 },
			size: { width: 250, height: 150 },
			tag: newNodeTag !== 'none' ? (newNodeTag as TagType) : undefined,
			pinned: false,
			notebookId,
		};

		dispatch(addNode(newNode));
		setNewNodeContent('');
		setNewNodeTag('none');
		setIsAddDialogOpen(false);
		onAddNode?.(newNodeType);
	};

	const handleUndo = () => {
		if (undoStack.length > 0) {
			dispatch(undo(notebookId));
		}
	};

	const handleRedo = () => {
		if (redoStack.length > 0) {
			dispatch(redo(notebookId));
		}
	};

	return (
		<div className={cn('flex items-center gap-2 p-2 glass-strong rounded-lg border', className)}>
			<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
				<DialogTrigger asChild>
					<Button variant='outline' size='sm' className='glass-strong'>
						<FilePlus className='w-4 h-4 mr-2' />
						Add Node
					</Button>
				</DialogTrigger>
				<DialogContent className='glass-strong border-white/20'>
					<DialogHeader>
						<DialogTitle>Add New Node</DialogTitle>
					</DialogHeader>
					<div className='space-y-4 mt-4'>
						<div>
							<Label htmlFor='node-type'>Node Type</Label>
							<Select value={newNodeType} onValueChange={(v) => setNewNodeType(v as NodeType)}>
								<SelectTrigger id='node-type' className='glass-strong'>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='text'>Text</SelectItem>
									<SelectItem value='code'>Code</SelectItem>
									<SelectItem value='link'>Link</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label htmlFor='node-content'>Content</Label>
							{newNodeType === 'text' ? (
								<Textarea
									id='node-content'
									value={newNodeContent}
									onChange={(e) => setNewNodeContent(e.target.value)}
									placeholder='Enter text content...'
									className='glass-strong min-h-[100px]'
								/>
							) : newNodeType === 'code' ? (
								<Textarea
									id='node-content'
									value={newNodeContent}
									onChange={(e) => setNewNodeContent(e.target.value)}
									placeholder='Enter code...'
									className='glass-strong font-mono min-h-[150px]'
								/>
							) : (
								<Input
									id='node-content'
									type='url'
									value={newNodeContent}
									onChange={(e) => setNewNodeContent(e.target.value)}
									placeholder='Enter URL...'
									className='glass-strong'
								/>
							)}
						</div>
						<div>
							<Label htmlFor='node-tag'>Tag (Optional)</Label>
							<Select value={newNodeTag} onValueChange={(v) => setNewNodeTag(v)}>
								<SelectTrigger id='node-tag' className='glass-strong'>
									<SelectValue placeholder='No tag' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='none'>No tag</SelectItem>
									<SelectItem value='idea'>Idea</SelectItem>
									<SelectItem value='bug'>Bug</SelectItem>
									<SelectItem value='followup'>Follow-up</SelectItem>
									<SelectItem value='decision'>Decision</SelectItem>
									<SelectItem value='neutral'>Neutral</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<Button onClick={handleAddNode} className='w-full' disabled={!newNodeContent.trim()}>
							Add Node
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			<Button
				variant='outline'
				size='sm'
				className='glass-strong'
				onClick={handleUndo}
				disabled={undoStack.length === 0}
			>
				<RotateCcw className='w-4 h-4' />
			</Button>
			<Button
				variant='outline'
				size='sm'
				className='glass-strong'
				onClick={handleRedo}
				disabled={redoStack.length === 0}
			>
				<RotateCw className='w-4 h-4' />
			</Button>

			{onSearchToggle && (
				<Button variant='outline' size='sm' className='glass-strong' onClick={onSearchToggle}>
					<Search className='w-4 h-4' />
				</Button>
			)}
		</div>
	);
};

export default NotebookToolbar;
