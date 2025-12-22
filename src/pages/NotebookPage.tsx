import { NotebookCanvas, NotebookToolbar, NotesSearchBar } from '@/components/organisms';
import { PageLayout } from '@/components/templates';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { deleteNode, setSelectedNotebook, updateNode } from '@/store/slices/notebooksSlice';
import { Connection, Node, Notebook, TagType } from '@/types/notebooks';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const NotebookPage = () => {
	const { notebookId } = useParams<{ notebookId: string }>();
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const notebooks = useAppSelector((state) => state.notebooks.notebooks);
	const nodes = useAppSelector((state) => state.notebooks.nodes);
	const connections = useAppSelector((state) => state.notebooks.connections);
	const [editingNode, setEditingNode] = useState<Node | null>(null);
	const [editContent, setEditContent] = useState('');
	const [editTag, setEditTag] = useState<string>('none');

	const currentNotebook = notebooks.find((n: Notebook) => n.id === notebookId);
	const notebookConnections = connections.filter((c: Connection) => c.notebookId === notebookId);

	useEffect(() => {
		if (notebookId) {
			dispatch(setSelectedNotebook(notebookId));
		}
		return () => {
			dispatch(setSelectedNotebook(null));
		};
	}, [notebookId, dispatch]);

	useEffect(() => {
		if (!currentNotebook && notebooks.length > 0) {
			navigate('/notebooks');
		}
	}, [currentNotebook, notebooks, navigate]);

	const handleNodeEdit = (node: Node) => {
		setEditingNode(node);
		setEditContent(node.content);
		setEditTag(node.tag || 'none');
	};

	const handleSaveEdit = () => {
		if (editingNode) {
			dispatch(
				updateNode({
					id: editingNode.id,
					updates: {
						content: editContent.trim(),
						tag: editTag !== 'none' ? (editTag as TagType) : undefined,
					},
				})
			);
			setEditingNode(null);
			setEditContent('');
			setEditTag('none');
		}
	};

	// handleNodeDelete reserved for future use
	const _handleNodeDelete = (nodeId: string) => {
		if (confirm('Are you sure you want to delete this node?')) {
			dispatch(deleteNode(nodeId));
		}
	};
	void _handleNodeDelete;

	const handleNodeClick = (node: Node) => {
		// Focus on node in canvas (could implement scroll/zoom to node)
		console.log('Node clicked:', node.id);
	};

	if (!currentNotebook) {
		return (
			<PageLayout>
				<div className='min-h-screen p-6 md:p-12 lg:p-16 flex items-center justify-center'>
					<div className='text-center'>
						<h2 className='text-2xl font-bold text-text-primary mb-2'>Notebook not found</h2>
						<Button onClick={() => navigate('/notebooks')}>Back to Notebooks</Button>
					</div>
				</div>
			</PageLayout>
		);
	}

	return (
		<PageLayout>
			<div className='min-h-screen p-6 md:p-12 lg:p-16 flex flex-col'>
				<div className='max-w-[1920px] mx-auto w-full flex-1 flex flex-col'>
					{/* Header */}
					<div className='mb-4'>
						<h1 className='text-3xl font-bold text-text-primary mb-2'>{currentNotebook.label}</h1>
						{currentNotebook.description && (
							<p className='text-text-secondary'>{currentNotebook.description}</p>
						)}
					</div>

					{/* Toolbar */}
					<div className='mb-4'>
						<NotebookToolbar notebookId={notebookId!} />
					</div>

					{/* Search Bar */}
					<div className='mb-4'>
						<NotesSearchBar
							nodes={nodes}
							notebooks={notebooks}
							connections={notebookConnections}
							onNodeClick={handleNodeClick}
						/>
					</div>

					{/* Canvas */}
					<div className='flex-1 min-h-0 border rounded-lg glass-strong overflow-hidden'>
						<NotebookCanvas
							nodes={nodes}
							connections={connections}
							notebookId={notebookId!}
							onNodeEdit={handleNodeEdit}
							className='h-full'
						/>
					</div>
				</div>
			</div>

			{/* Edit Node Dialog */}
			<Dialog open={!!editingNode} onOpenChange={(open) => !open && setEditingNode(null)}>
				<DialogContent className='glass-strong border-white/20'>
					<DialogHeader>
						<DialogTitle>Edit Node</DialogTitle>
					</DialogHeader>
					{editingNode && (
						<div className='space-y-4 mt-4'>
							<div>
								<Label>Type</Label>
								<Input value={editingNode.type} disabled className='glass-strong' />
							</div>
							<div>
								<Label htmlFor='edit-content'>Content</Label>
								{editingNode.type === 'text' ? (
									<Textarea
										id='edit-content'
										value={editContent}
										onChange={(e) => setEditContent(e.target.value)}
										className='glass-strong min-h-[100px]'
									/>
								) : editingNode.type === 'code' ? (
									<Textarea
										id='edit-content'
										value={editContent}
										onChange={(e) => setEditContent(e.target.value)}
										className='glass-strong font-mono min-h-[150px]'
									/>
								) : (
									<Input
										id='edit-content'
										type='url'
										value={editContent}
										onChange={(e) => setEditContent(e.target.value)}
										className='glass-strong'
									/>
								)}
							</div>
							<div>
								<Label htmlFor='edit-tag'>Tag</Label>
								<Select value={editTag} onValueChange={(v) => setEditTag(v)}>
									<SelectTrigger id='edit-tag' className='glass-strong'>
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
							<div className='flex gap-2'>
								<Button onClick={handleSaveEdit} className='flex-1'>
									Save
								</Button>
								<Button
									variant='outline'
									onClick={() => {
										setEditingNode(null);
										setEditContent('');
										setEditTag('none');
									}}
									className='flex-1'
								>
									Cancel
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</PageLayout>
	);
};

export default NotebookPage;
