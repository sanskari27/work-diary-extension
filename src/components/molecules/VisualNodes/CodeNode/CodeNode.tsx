import { cn } from '@/lib/utils';
import { useAppDispatch } from '@/store/hooks';
import { deleteNodeFromNote, updateNodeInNote } from '@/store/slices/visualNotesSlice';
import { CodeNodeData, VisualNode } from '@/types/visualNotes';
import { loader } from '@monaco-editor/react';
import { Handle, NodeProps, Position } from '@xyflow/react';
import { X } from 'lucide-react';
import * as monaco from 'monaco-editor';
import { Suspense, lazy, useEffect, useState } from 'react';
// Import Monaco workers using Vite's worker syntax
// These are used in the getWorker function below
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

// Configure loader to use local monaco-editor package (prevents CDN loading)
// This must be done before @monaco-editor/react initializes
loader.config({ monaco });

// Configure Monaco Environment at module level (before @monaco-editor/react loads)
// This must be done before the Editor component is imported
// @monaco-editor/react will use this environment configuration
if (typeof window !== 'undefined') {
	// Set up MonacoEnvironment with getWorker to use Vite-bundled workers
	// This prevents @monaco-editor/react from trying to load from CDN
	(window as any).MonacoEnvironment = {
		getWorker: function (_moduleId: string, label: string) {
			// Use Vite-bundled workers (imported with ?worker suffix)
			// This ensures workers are bundled locally and comply with CSP
			if (label === 'json') {
				return new jsonWorker();
			}
			if (label === 'css' || label === 'scss' || label === 'less') {
				return new cssWorker();
			}
			if (label === 'html' || label === 'handlebars' || label === 'razor') {
				return new htmlWorker();
			}
			if (label === 'typescript' || label === 'javascript') {
				return new tsWorker();
			}
			// Default editor worker
			return new editorWorker();
		},
	};
}

const Editor = lazy(() => import('@monaco-editor/react'));

interface CodeNodeProps extends NodeProps {
	data: {
		node: VisualNode;
		noteId: string;
	};
}

const CodeNode = ({ data, selected }: CodeNodeProps) => {
	const dispatch = useAppDispatch();
	const node = data.node;
	const nodeData = node.data as CodeNodeData;
	const [content, setContent] = useState(nodeData.content);
	const [language, setLanguage] = useState(nodeData.language || 'javascript');

	useEffect(() => {
		setContent(nodeData.content);
		setLanguage(nodeData.language || 'javascript');
	}, [nodeData.content, nodeData.language]);

	const handleEditorChange = (value: string | undefined) => {
		if (value !== undefined) {
			setContent(value);
			// Debounce the save
			const timeoutId = setTimeout(() => {
				dispatch(
					updateNodeInNote({
						noteId: data.noteId,
						nodeId: node.id,
						updates: {
							data: {
								...nodeData,
								content: value,
								language,
							},
						},
					})
				);
			}, 500);
			return () => clearTimeout(timeoutId);
		}
	};

	const handleLanguageChange = (newLanguage: string) => {
		setLanguage(newLanguage);
		dispatch(
			updateNodeInNote({
				noteId: data.noteId,
				nodeId: node.id,
				updates: {
					data: {
						...nodeData,
						language: newLanguage,
					},
				},
			})
		);
	};

	const commonLanguages = [
		'javascript',
		'typescript',
		'python',
		'java',
		'cpp',
		'csharp',
		'go',
		'rust',
		'html',
		'css',
		'json',
		'markdown',
		'sql',
	];

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (confirm('Delete this node?')) {
			dispatch(deleteNodeFromNote({ noteId: data.noteId, nodeId: node.id }));
		}
	};

	return (
		<div
			className={cn(
				'glass-strong rounded-lg border border-white/20 min-w-[300px] min-h-[200px] flex flex-col relative group',
				selected && 'ring-2 ring-primary'
			)}
		>
			<Handle type='target' position={Position.Top} />
			<div className='flex items-center justify-between p-2 border-b border-white/10'>
				<select
					value={language}
					onChange={(e) => handleLanguageChange(e.target.value)}
					className='bg-transparent text-white text-xs outline-none border border-white/20 rounded px-2 py-1'
					onClick={(e) => e.stopPropagation()}
				>
					{commonLanguages.map((lang) => (
						<option key={lang} value={lang} className='bg-gray-800'>
							{lang}
						</option>
					))}
				</select>
				<button
					onClick={handleDelete}
					className='p-1 bg-black/50 rounded hover:bg-red-500/50 transition-colors opacity-0 group-hover:opacity-100'
					title='Delete node'
				>
					<X className='w-3 h-3 text-white' />
				</button>
			</div>
			<div className='h-[500px]'>
				<Suspense fallback={<div className='p-4 text-white/40 text-sm'>Loading editor...</div>}>
					<Editor
						height='500px'
						language={language}
						value={content}
						onChange={handleEditorChange}
						theme='vs-dark'
						options={{
							minimap: { enabled: false },
							scrollBeyondLastLine: false,
							fontSize: 12,
							lineNumbers: 'on',
							wordWrap: 'on',
							automaticLayout: true,
							padding: { top: 8, bottom: 8 },
						}}
					/>
				</Suspense>
			</div>
			<Handle type='source' position={Position.Bottom} />
		</div>
	);
};

export default CodeNode;
