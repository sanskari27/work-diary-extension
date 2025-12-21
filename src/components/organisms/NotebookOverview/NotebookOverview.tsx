import { NotebookCard } from '@/components/molecules';
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
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addNotebook, deleteNotebook, updateNotebook } from '@/store/slices/notebooksSlice';
import { Notebook } from '@/types/notebooks';
import { FilePlus } from 'lucide-react';
import { useState } from 'react';

interface NotebookOverviewProps {
	onNotebookClick?: (notebook: Notebook) => void;
	className?: string;
}

const NotebookOverview = ({ onNotebookClick, className }: NotebookOverviewProps) => {
	const dispatch = useAppDispatch();
	const notebooks = useAppSelector((state) => state.notebooks.notebooks);
	const nodes = useAppSelector((state) => state.notebooks.nodes);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [newNotebookLabel, setNewNotebookLabel] = useState('');
	const [newNotebookDescription, setNewNotebookDescription] = useState('');
	const [newNotebookColor, setNewNotebookColor] = useState('');

	const handleCreateNotebook = () => {
		if (!newNotebookLabel.trim()) return;

		dispatch(
			addNotebook({
				label: newNotebookLabel.trim(),
				description: newNotebookDescription.trim() || undefined,
				color: newNotebookColor || undefined,
			})
		);

		setNewNotebookLabel('');
		setNewNotebookDescription('');
		setNewNotebookColor('');
		setIsCreateDialogOpen(false);
	};

	const handleEditNotebook = (notebook: Notebook) => {
		const newLabel = prompt('Enter new label:', notebook.label);
		if (newLabel && newLabel.trim() && newLabel !== notebook.label) {
			dispatch(
				updateNotebook({
					id: notebook.id,
					updates: { label: newLabel.trim() },
				})
			);
		}
	};

	const handleDeleteNotebook = (notebookId: string) => {
		if (confirm('Are you sure you want to delete this notebook? This action cannot be undone.')) {
			dispatch(deleteNotebook(notebookId));
		}
	};

	const getNodeCount = (notebookId: string) => {
		return nodes.filter((n) => n.notebookId === notebookId).length;
	};

	return (
		<div className={cn('space-y-4', className)}>
			<div className='flex items-center justify-between'>
				<h2 className='text-2xl font-bold text-text-primary'>Notebooks</h2>
				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button className='glass-strong'>
							<FilePlus className='w-4 h-4 mr-2' />
							Create Notebook
						</Button>
					</DialogTrigger>
					<DialogContent className='glass-strong border-white/20'>
						<DialogHeader>
							<DialogTitle>Create New Notebook</DialogTitle>
						</DialogHeader>
						<div className='space-y-4 mt-4'>
							<div>
								<Label htmlFor='notebook-label'>Label *</Label>
								<Input
									id='notebook-label'
									value={newNotebookLabel}
									onChange={(e) => setNewNotebookLabel(e.target.value)}
									placeholder='Enter notebook label...'
									className='glass-strong'
								/>
							</div>
							<div>
								<Label htmlFor='notebook-description'>Description</Label>
								<Textarea
									id='notebook-description'
									value={newNotebookDescription}
									onChange={(e) => setNewNotebookDescription(e.target.value)}
									placeholder='Enter notebook description...'
									className='glass-strong min-h-[80px]'
								/>
							</div>
							<div>
								<Label htmlFor='notebook-color'>Color (Hex)</Label>
								<Input
									id='notebook-color'
									type='color'
									value={newNotebookColor}
									onChange={(e) => setNewNotebookColor(e.target.value)}
									className='glass-strong h-10'
								/>
							</div>
							<Button
								onClick={handleCreateNotebook}
								className='w-full'
								disabled={!newNotebookLabel.trim()}
							>
								Create
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			{notebooks.length === 0 ? (
				<div className='text-center py-12 text-text-secondary'>
					<p>No notebooks yet. Create one to get started!</p>
				</div>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
					{notebooks.map((notebook) => (
						<NotebookCard
							key={notebook.id}
							notebook={notebook}
							nodeCount={getNodeCount(notebook.id)}
							onClick={onNotebookClick}
							onEdit={handleEditNotebook}
							onDelete={handleDeleteNotebook}
						/>
					))}
				</div>
			)}
		</div>
	);
};

export default NotebookOverview;
