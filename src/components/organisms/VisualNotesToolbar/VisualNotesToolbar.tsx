import { SearchBar } from '@/components/atoms';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addNodeToNote, updateNote } from '@/store/slices/visualNotesSlice';
import { CodeNodeData, TextNodeData } from '@/types/visualNotes';
import { useReactFlow } from '@xyflow/react';
import { Code, Edit, Maximize2, Plus, Type, ZoomIn, ZoomOut } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface VisualNotesToolbarProps {
	noteId: string;
}

interface SearchResult {
	nodeId: string;
	nodeType: string;
	preview: string;
}

const VisualNotesToolbar = ({ noteId }: VisualNotesToolbarProps) => {
	const dispatch = useAppDispatch();
	const { zoomIn, zoomOut, fitView, getNode } = useReactFlow();
	const notes = useAppSelector((state) => state.visualNotes.notes);
	const note = useMemo(() => notes.find((n) => n.id === noteId), [notes, noteId]);
	const [query, setQuery] = useState('');
	const [results, setResults] = useState<SearchResult[]>([]);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const resultsRef = useRef<HTMLDivElement>(null);
	const [isEditNoteOpen, setIsEditNoteOpen] = useState(false);
	const [noteTitle, setNoteTitle] = useState('');

	const handleAddNode = (type: 'text' | 'code') => {
		const centerX = window.innerWidth / 2 - 100;
		const centerY = window.innerHeight / 2 - 100;

		let nodeData: TextNodeData | CodeNodeData;

		switch (type) {
			case 'text':
				nodeData = { type: 'text', content: '' };
				break;
			case 'code':
				nodeData = { type: 'code', content: '', language: 'javascript' };
				break;
		}

		dispatch(
			addNodeToNote({
				noteId,
				node: {
					type,
					position: { x: centerX, y: centerY },
					width: type === 'code' ? 400 : 250,
					height: type === 'code' ? 300 : 150,
					data: nodeData,
				},
			})
		);
	};

	// Search functionality
	const searchResults = useMemo(() => {
		if (!note || !query.trim()) return [];

		const lowerQuery = query.toLowerCase().trim();
		const matches: SearchResult[] = [];

		note.nodes.forEach((node) => {
			let matchText = '';
			let preview = '';

			switch (node.data.type) {
				case 'text': {
					const data = node.data as TextNodeData;
					matchText = data.content.toLowerCase();
					preview = data.content.substring(0, 50) + (data.content.length > 50 ? '...' : '');
					break;
				}
				case 'code': {
					const data = node.data as CodeNodeData;
					matchText = data.content.toLowerCase();
					preview = data.content.substring(0, 50) + (data.content.length > 50 ? '...' : '');
					break;
				}
			}

			if (matchText.includes(lowerQuery)) {
				matches.push({
					nodeId: node.id,
					nodeType: node.data.type,
					preview,
				});
			}
		});

		return matches;
	}, [note, query]);

	useEffect(() => {
		setResults(searchResults);
		setSelectedIndex(0);
	}, [searchResults]);

	useEffect(() => {
		if (results.length > 0 && selectedIndex >= 0 && selectedIndex < results.length) {
			const selectedResult = results[selectedIndex];
			const node = getNode(selectedResult.nodeId);
			if (node) {
				fitView({
					nodes: [node],
					padding: 0.3,
					duration: 300,
				});
			}
		}
	}, [selectedIndex, results, getNode, fitView]);

	const handleSearchKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			setSelectedIndex((prev) => (prev + 1) % results.length);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
		} else if (e.key === 'Enter' && results.length > 0) {
			e.preventDefault();
			const selectedResult = results[selectedIndex];
			const node = getNode(selectedResult.nodeId);
			if (node) {
				fitView({
					nodes: [node],
					padding: 0.3,
					duration: 300,
				});
				setQuery('');
				setIsSearchOpen(false);
			}
		} else if (e.key === 'Escape') {
			setQuery('');
			setIsSearchOpen(false);
		}
	};

	const handleResultClick = (result: SearchResult) => {
		const node = getNode(result.nodeId);
		if (node) {
			fitView({
				nodes: [node],
				padding: 0.3,
				duration: 300,
			});
			setQuery('');
			setIsSearchOpen(false);
		}
	};

	const handleEditNote = () => {
		if (note) {
			setNoteTitle(note.title);
			setIsEditNoteOpen(true);
		}
	};

	const handleSaveNote = () => {
		if (noteTitle.trim() && note) {
			dispatch(
				updateNote({
					id: note.id,
					updates: { title: noteTitle.trim() },
				})
			);
			setIsEditNoteOpen(false);
			setNoteTitle('');
		}
	};

	return (
		<div className='flex items-center gap-2 glass-strong rounded-lg p-2 border border-white/20 relative'>
			{/* Search Bar */}
			<div className='relative flex-1'>
				<div className='relative'>
					<SearchBar
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						onFocus={() => setIsSearchOpen(true)}
						onKeyDown={handleSearchKeyDown}
					/>
				</div>

				{/* Results Dropdown */}
				{isSearchOpen && query.trim() && results.length > 0 && (
					<div
						ref={resultsRef}
						className='absolute top-full mt-2 w-full glass-strong border border-white/20 rounded-lg overflow-hidden z-50 max-h-64 overflow-y-auto'
					>
						{results.map((result, index) => (
							<button
								key={result.nodeId}
								onClick={() => handleResultClick(result)}
								className={cn(
									'w-full px-4 py-3 text-left hover:bg-white/10 transition-colors',
									index === selectedIndex && 'bg-primary/20'
								)}
							>
								<div className='flex items-center gap-2 mb-1'>
									<span className='text-xs text-text-secondary uppercase'>{result.nodeType}</span>
								</div>
								<div className='text-sm text-white truncate'>{result.preview}</div>
							</button>
						))}
					</div>
				)}

				{isSearchOpen && query.trim() && results.length === 0 && (
					<div className='absolute top-full mt-2 w-full glass-strong border border-white/20 rounded-lg p-4 text-center text-text-secondary text-sm'>
						No results found
					</div>
				)}
			</div>

			{/* Separator */}
			<div className='w-px h-6 bg-white/20' />
			{/* Add Node Popover */}
			<Popover>
				<PopoverTrigger asChild>
					<Button variant='outline' size='sm' className='hover:bg-white/10 border-white/20'>
						<Plus className='w-4 h-4 mr-2' />
						Add Node
					</Button>
				</PopoverTrigger>
				<PopoverContent className='glass-strong border-white/20 w-fit p-2'>
					<div className='space-y-1'>
						<Button className='w-full' variant={'ghost'} onClick={() => handleAddNode('text')}>
							<Type className='w-4 h-4' />
							Text
						</Button>
						<Button className='w-full' variant={'ghost'} onClick={() => handleAddNode('code')}>
							<Code className='w-4 h-4' />
							Code
						</Button>
					</div>
				</PopoverContent>
			</Popover>

			{/* Separator */}
			<div className='w-px h-6 bg-white/20' />

			{/* Edit Note Button */}
			<Button
				variant='outline'
				size='sm'
				onClick={handleEditNote}
				className='glass-strong hover:bg-white/10 border-white/20'
				title='Edit Note'
			>
				<Edit className='w-4 h-4' />
			</Button>

			{/* Separator */}
			<div className='w-px h-6 bg-white/20' />

			{/* Zoom Controls */}
			<Button
				variant='outline'
				size='sm'
				onClick={() => zoomIn()}
				className='glass-strong hover:bg-white/10 border-white/20'
				title='Zoom In'
			>
				<ZoomIn className='w-4 h-4' />
			</Button>
			<Button
				variant='outline'
				size='sm'
				onClick={() => zoomOut()}
				className='glass-strong hover:bg-white/10 border-white/20'
				title='Zoom Out'
			>
				<ZoomOut className='w-4 h-4' />
			</Button>
			<Button
				variant='outline'
				size='sm'
				onClick={() => fitView({ padding: 0.2 })}
				className='glass-strong hover:bg-white/10 border-white/20'
				title='Fit View'
			>
				<Maximize2 className='w-4 h-4' />
			</Button>

			{/* Edit Note Dialog */}
			<Dialog open={isEditNoteOpen} onOpenChange={setIsEditNoteOpen}>
				<DialogContent className='glass-strong border-white/20'>
					<DialogHeader>
						<DialogTitle className='text-white'>Edit Note</DialogTitle>
					</DialogHeader>
					<div className='space-y-4 mt-4'>
						<Input
							placeholder='Note title'
							value={noteTitle}
							onChange={(e) => setNoteTitle(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									handleSaveNote();
								}
							}}
							className='glass-strong'
							autoFocus
						/>
						<div className='flex gap-2'>
							<Button onClick={handleSaveNote} className='flex-1'>
								Save
							</Button>
							<Button
								variant='outline'
								onClick={() => {
									setIsEditNoteOpen(false);
									setNoteTitle('');
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

export default VisualNotesToolbar;
