import { Button } from '@/components/ui/button';
import { Collapsible } from '@/components/ui/custom-collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
	addNote,
	addNotebook,
	setSelectedNote,
	updateNotebook,
} from '@/store/slices/visualNotesSlice';
import { motion } from 'framer-motion';
import { Edit, FileText, Folder, Home, Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const VisualNotesSidebar = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const notebooks = useAppSelector((state) => state.visualNotes.notebooks);
	const notes = useAppSelector((state) => state.visualNotes.notes);
	const selectedNoteId = useAppSelector((state) => state.visualNotes.selectedNoteId);
	const [expandedNotebooks, setExpandedNotebooks] = useState<Set<string>>(new Set());
	const [createNotebookOpen, setCreateNotebookOpen] = useState(false);
	const [createNoteOpen, setCreateNoteOpen] = useState(false);
	const [editNotebookOpen, setEditNotebookOpen] = useState(false);
	const [notebookTitle, setNotebookTitle] = useState('');
	const [noteTitle, setNoteTitle] = useState('');
	const [selectedNotebookForNote, setSelectedNotebookForNote] = useState<string | null>(null);
	const [editingNotebookId, setEditingNotebookId] = useState<string | null>(null);

	const handleCreateNotebook = () => {
		if (notebookTitle.trim()) {
			dispatch(addNotebook({ title: notebookTitle.trim() }));
			setNotebookTitle('');
			setCreateNotebookOpen(false);
		}
	};

	const handleCreateNote = (notebookId: string) => {
		if (noteTitle.trim()) {
			dispatch(
				addNote({
					notebookId,
					title: noteTitle.trim(),
				})
			);
			setNoteTitle('');
			setCreateNoteOpen(false);
			setSelectedNotebookForNote(null);
		}
	};

	const handleNoteClick = (noteId: string) => {
		dispatch(setSelectedNote(noteId));
	};

	const openCreateNoteDialog = (notebookId: string) => {
		setSelectedNotebookForNote(notebookId);
		setCreateNoteOpen(true);
	};

	const handleEditNotebook = (notebookId: string) => {
		const notebook = notebooks.find((n) => n.id === notebookId);
		if (notebook) {
			setEditingNotebookId(notebookId);
			setNotebookTitle(notebook.title);
			setEditNotebookOpen(true);
		}
	};

	const handleSaveNotebook = () => {
		if (notebookTitle.trim() && editingNotebookId) {
			dispatch(
				updateNotebook({
					id: editingNotebookId,
					updates: { title: notebookTitle.trim() },
				})
			);
			setEditNotebookOpen(false);
			setNotebookTitle('');
			setEditingNotebookId(null);
		}
	};

	const sortedNotebooks = [...notebooks].sort((a, b) => b.createdAt - a.createdAt);

	return (
		<div className='p-4 space-y-2 h-full flex flex-col'>
			{/* Back to Home Button */}
			<motion.button
				onClick={() => navigate('/')}
				className={cn(
					'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all mb-4',
					'text-sm font-semibold text-white',
					'bg-white/5 border border-white/10',
					'hover:bg-white/10 hover:border-white/20 hover:text-text-accent',
					'backdrop-blur-sm shadow-sm'
				)}
				whileHover={{ x: 4, scale: 1.02 }}
				whileTap={{ scale: 0.98 }}
			>
				<Home className='w-5 h-5 flex-shrink-0 text-current' />
				<span className='truncate flex-1'>Back to Home</span>
			</motion.button>

			{/* Notebooks List */}
			<div className='flex-1 overflow-y-auto space-y-2'>
				{sortedNotebooks.map((notebook) => {
					const notebookNotes = notes
						.filter((n) => n.notebookId === notebook.id)
						.sort((a, b) => b.updatedAt - a.updatedAt);
					const isExpanded = expandedNotebooks.has(notebook.id);
					// Auto-expand if a note from this notebook is selected
					if (!isExpanded && notebookNotes.some((n) => n.id === selectedNoteId)) {
						setExpandedNotebooks((prev) => new Set(prev).add(notebook.id));
					}

					return (
						<Collapsible
							key={notebook.id}
							defaultOpen={isExpanded}
							hideCollapseButton
							header={
								<div className='flex items-center gap-2 w-full'>
									<Folder className='w-4 h-4 text-text-accent flex-shrink-0' />
									<span className='font-semibold text-sm text-white truncate flex-1 text-left'>
										{notebook.title}
									</span>
									<span className='text-xs text-text-secondary bg-white/5 px-2 py-0.5 rounded-full'>
										{notebookNotes.length}
									</span>
									<button
										onClick={(e) => {
											e.stopPropagation();
											handleEditNotebook(notebook.id);
										}}
										className='p-1 hover:bg-white/10 rounded transition-colors'
										title='Edit Notebook'
									>
										<Edit className='w-4 h-4 text-text-accent' />
									</button>
									<button
										onClick={(e) => {
											e.stopPropagation();
											openCreateNoteDialog(notebook.id);
										}}
										className='p-1 hover:bg-white/10 rounded transition-colors'
										title='Create Note'
									>
										<Plus className='w-4 h-4 text-text-accent' />
									</button>
								</div>
							}
							contentClassName='p-2 pl-6'
							headerClassName='p-2'
							className='mb-2'
						>
							<div className='space-y-1'>
								{notebookNotes.map((note) => {
									const isActive = selectedNoteId === note.id;

									return (
										<motion.button
											key={note.id}
											onClick={() => handleNoteClick(note.id)}
											className={cn(
												'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all',
												'text-sm text-text-secondary hover:text-text-accent hover:bg-white/5',
												isActive && 'bg-primary/20 text-text-accent border border-primary/50'
											)}
											whileHover={{ x: 4 }}
											whileTap={{ scale: 0.98 }}
										>
											<FileText className='w-4 h-4 flex-shrink-0 text-current' />
											<span className='truncate flex-1'>{note.title}</span>
										</motion.button>
									);
								})}
								{notebookNotes.length === 0 && (
									<p className='text-xs text-text-secondary px-3 py-2'>No notes yet</p>
								)}
							</div>
						</Collapsible>
					);
				})}
				{notebooks.length === 0 && (
					<div className='text-center py-8 text-text-secondary text-sm'>
						<p>No notebooks yet</p>
						<p className='text-xs mt-1'>Create one to get started</p>
					</div>
				)}
			</div>

			{/* Create Notebook Button */}
			<div className='pt-4 border-t border-white/10'>
				<Button
					onClick={() => setCreateNotebookOpen(true)}
					className='w-full glass-strong hover:bg-white/10'
					variant='outline'
				>
					<Plus className='w-4 h-4 mr-2' />
					Create Notebook
				</Button>
			</div>

			{/* Create Notebook Dialog */}
			<Dialog open={createNotebookOpen} onOpenChange={setCreateNotebookOpen}>
				<DialogContent className='glass-strong border-white/20'>
					<DialogHeader>
						<DialogTitle className='text-white'>Create Notebook</DialogTitle>
					</DialogHeader>
					<div className='space-y-4 mt-4'>
						<Input
							placeholder='Notebook title'
							value={notebookTitle}
							onChange={(e) => setNotebookTitle(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									handleCreateNotebook();
								}
							}}
							className='glass-strong'
							autoFocus
						/>
						<div className='flex gap-2'>
							<Button onClick={handleCreateNotebook} className='flex-1'>
								Create
							</Button>
							<Button
								variant='outline'
								onClick={() => {
									setCreateNotebookOpen(false);
									setNotebookTitle('');
								}}
								className='flex-1'
							>
								Cancel
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Create Note Dialog */}
			<Dialog open={createNoteOpen} onOpenChange={setCreateNoteOpen}>
				<DialogContent className='glass-strong border-white/20'>
					<DialogHeader>
						<DialogTitle className='text-white'>Create Note</DialogTitle>
					</DialogHeader>
					<div className='space-y-4 mt-4'>
						<Input
							placeholder='Note title'
							value={noteTitle}
							onChange={(e) => setNoteTitle(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter' && selectedNotebookForNote) {
									handleCreateNote(selectedNotebookForNote);
								}
							}}
							className='glass-strong'
							autoFocus
						/>
						<div className='flex gap-2'>
							<Button
								onClick={() => {
									if (selectedNotebookForNote) {
										handleCreateNote(selectedNotebookForNote);
									}
								}}
								className='flex-1'
							>
								Create
							</Button>
							<Button
								variant='outline'
								onClick={() => {
									setCreateNoteOpen(false);
									setNoteTitle('');
									setSelectedNotebookForNote(null);
								}}
								className='flex-1'
							>
								Cancel
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Edit Notebook Dialog */}
			<Dialog open={editNotebookOpen} onOpenChange={setEditNotebookOpen}>
				<DialogContent className='glass-strong border-white/20'>
					<DialogHeader>
						<DialogTitle className='text-white'>Edit Notebook</DialogTitle>
					</DialogHeader>
					<div className='space-y-4 mt-4'>
						<Input
							placeholder='Notebook title'
							value={notebookTitle}
							onChange={(e) => setNotebookTitle(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									handleSaveNotebook();
								}
							}}
							className='glass-strong'
							autoFocus
						/>
						<div className='flex gap-2'>
							<Button onClick={handleSaveNotebook} className='flex-1'>
								Save
							</Button>
							<Button
								variant='outline'
								onClick={() => {
									setEditNotebookOpen(false);
									setNotebookTitle('');
									setEditingNotebookId(null);
								}}
								className='flex-1'
							>
								Cancel
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default VisualNotesSidebar;
