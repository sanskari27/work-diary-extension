import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/store/hooks';
import { CodeNodeData, LinkNodeData, TextNodeData } from '@/types/visualNotes';
import { useReactFlow } from '@xyflow/react';
import { Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface VisualNotesSearchProps {
	noteId: string;
}

interface SearchResult {
	nodeId: string;
	nodeType: string;
	preview: string;
}

const VisualNotesSearch = ({ noteId }: VisualNotesSearchProps) => {
	const notes = useAppSelector((state) => state.visualNotes.notes);
	const note = useMemo(() => notes.find((n) => n.id === noteId), [notes, noteId]);
	const [query, setQuery] = useState('');
	const [results, setResults] = useState<SearchResult[]>([]);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [isOpen, setIsOpen] = useState(false);
	const { getNode, fitView } = useReactFlow();
	const resultsRef = useRef<HTMLDivElement>(null);

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
				case 'link': {
					const data = node.data as LinkNodeData;
					matchText = `${data.url} ${data.title || ''}`.toLowerCase();
					preview = data.title || data.url;
					break;
				}
				case 'image': {
					// Images don't have searchable text content
					return;
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
				// Zoom to node
				fitView({
					nodes: [node],
					padding: 0.3,
					duration: 300,
				});

				// Highlight node briefly (this would require additional state management)
			}
		}
	}, [selectedIndex, results, getNode, fitView]);

	const handleKeyDown = (e: React.KeyboardEvent) => {
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
				setIsOpen(false);
			}
		} else if (e.key === 'Escape') {
			setQuery('');
			setIsOpen(false);
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
			setIsOpen(false);
		}
	};

	return (
		<div className='relative w-full max-w-md'>
			<div className='relative'>
				<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary' />
				<Input
					type='text'
					placeholder='Search in note...'
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
						setIsOpen(true);
					}}
					onFocus={() => setIsOpen(true)}
					onKeyDown={handleKeyDown}
					className='pl-10 pr-10 glass-strong border-white/20'
				/>
				{query && (
					<button
						onClick={() => {
							setQuery('');
							setIsOpen(false);
						}}
						className='absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary'
					>
						<X className='w-4 h-4' />
					</button>
				)}
			</div>

			{/* Results Dropdown */}
			{isOpen && query.trim() && results.length > 0 && (
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

			{isOpen && query.trim() && results.length === 0 && (
				<div className='absolute top-full mt-2 w-full glass-strong border border-white/20 rounded-lg p-4 text-center text-text-secondary text-sm'>
					No results found
				</div>
			)}
		</div>
	);
};

export default VisualNotesSearch;
