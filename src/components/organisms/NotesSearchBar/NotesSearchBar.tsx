import { NodeToken } from '@/components/atoms';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { SearchFilters, searchNodes } from '@/lib/notebookSearch';
import { cn } from '@/lib/utils';
import { Node, NodeType, Notebook, TagType } from '@/types/notebooks';
import { Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';

interface NotesSearchBarProps {
	nodes: Node[];
	notebooks: Notebook[];
	connections: any[];
	onNodeClick?: (node: Node) => void;
	className?: string;
}

const NotesSearchBar = ({
	nodes,
	notebooks,
	connections,
	onNodeClick,
	className,
}: NotesSearchBarProps) => {
	const [query, setQuery] = useState('');
	const [tagFilter, setTagFilter] = useState<TagType | 'all'>('all');
	const [notebookFilter, setNotebookFilter] = useState<string>('all');
	const [nodeTypeFilter, setNodeTypeFilter] = useState<NodeType | 'all'>('all');
	const [isOpen, setIsOpen] = useState(false);

	const filters: SearchFilters = {
		query: query.trim() || undefined,
		tag: tagFilter !== 'all' ? tagFilter : undefined,
		notebookId: notebookFilter !== 'all' ? notebookFilter : undefined,
		nodeType: nodeTypeFilter !== 'all' ? nodeTypeFilter : undefined,
	};

	const results = useMemo(() => {
		if (!isOpen) return [];
		return searchNodes(nodes, notebooks, connections, filters);
	}, [nodes, notebooks, connections, filters, isOpen]);

	const handleNodeClick = (node: Node) => {
		onNodeClick?.(node);
		setIsOpen(false);
		setQuery('');
	};

	return (
		<div className={cn('relative', className)}>
			<div className='flex items-center gap-2'>
				<div className='relative flex-1'>
					<Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary' />
					<Input
						type='text'
						placeholder='Search nodes...'
						value={query}
						onChange={(e) => {
							setQuery(e.target.value);
							setIsOpen(true);
						}}
						onFocus={() => setIsOpen(true)}
						className='pl-10 pr-10 glass-strong text-white placeholder:text-text-secondary/50'
					/>
					{query && (
						<button
							onClick={() => {
								setQuery('');
								setIsOpen(false);
							}}
							className='absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary'
						>
							<X className='w-4 h-4' />
						</button>
					)}
				</div>
				<Select value={tagFilter} onValueChange={(v) => setTagFilter(v as TagType | 'all')}>
					<SelectTrigger className='w-32 glass-strong text-white'>
						<SelectValue placeholder='Tag' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='all'>All Tags</SelectItem>
						<SelectItem value='idea'>Idea</SelectItem>
						<SelectItem value='bug'>Bug</SelectItem>
						<SelectItem value='followup'>Follow-up</SelectItem>
						<SelectItem value='decision'>Decision</SelectItem>
						<SelectItem value='neutral'>Neutral</SelectItem>
					</SelectContent>
				</Select>
				<Select value={notebookFilter} onValueChange={(v) => setNotebookFilter(v)}>
					<SelectTrigger className='w-40 glass-strong text-white'>
						<SelectValue placeholder='Notebook' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='all'>All Notebooks</SelectItem>
						{notebooks.map((notebook) => (
							<SelectItem key={notebook.id} value={notebook.id}>
								{notebook.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select
					value={nodeTypeFilter}
					onValueChange={(v) => setNodeTypeFilter(v as NodeType | 'all')}
				>
					<SelectTrigger className='w-32 glass-strong text-white'>
						<SelectValue placeholder='Type' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='all'>All Types</SelectItem>
						<SelectItem value='text'>Text</SelectItem>
						<SelectItem value='code'>Code</SelectItem>
						<SelectItem value='link'>Link</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{isOpen && results.length > 0 && (
				<div className='absolute top-full left-0 right-0 mt-2 max-h-96 overflow-y-auto glass-strong rounded-lg border p-2 z-50'>
					<div className='space-y-2'>
						{results.map((result) => (
							<div
								key={result.node.id}
								onClick={() => handleNodeClick(result.node)}
								className='p-2 rounded hover:bg-white/5 cursor-pointer transition-colors'
							>
								<div className='flex items-start justify-between gap-2 mb-1'>
									<span className='text-xs text-text-secondary'>
										{result.notebook.label || 'Unknown'}
									</span>
									{result.node.tag && (
										<span className='text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary'>
											{result.node.tag}
										</span>
									)}
								</div>
								<div className='text-sm'>
									<NodeToken node={result.node} truncate maxLength={150} />
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{isOpen && query && results.length === 0 && (
				<div className='absolute top-full left-0 right-0 mt-2 glass-strong rounded-lg border p-4 z-50 text-center text-text-secondary'>
					No results found
				</div>
			)}
		</div>
	);
};

export default NotesSearchBar;
