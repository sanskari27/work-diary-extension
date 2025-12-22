import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useAppDispatch } from '@/store/hooks';
import { deleteNodeFromNote, updateNodeInNote } from '@/store/slices/visualNotesSlice';
import { CodeNodeData, VisualNode } from '@/types/visualNotes';
import { java } from '@codemirror/lang-java';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import CodeMirror from '@uiw/react-codemirror';
import { Handle, NodeProps, Position } from '@xyflow/react';
import { X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

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
	const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const editorContainerRef = useRef<HTMLDivElement>(null);
	const [isEditorFocused, setIsEditorFocused] = useState(false);

	useEffect(() => {
		setContent(nodeData.content);
		setLanguage(nodeData.language || 'javascript');
	}, [nodeData.content, nodeData.language]);

	// Expose focus state to parent via data attribute for React Flow to check
	useEffect(() => {
		const nodeElement = document.querySelector(`[data-id="${node.id}"]`);
		if (nodeElement) {
			if (isEditorFocused) {
				nodeElement.setAttribute('data-editor-focused', 'true');
			} else {
				nodeElement.removeAttribute('data-editor-focused');
			}
		}
	}, [isEditorFocused, node.id]);

	// Add native event listeners to prevent React Flow from capturing events
	useEffect(() => {
		const container = editorContainerRef.current;
		if (!container) return;

		const stopPropagation = (e: Event) => {
			e.stopPropagation();
			e.stopImmediatePropagation();
		};

		// Use capture phase to catch events before React Flow
		const options = { capture: true, passive: false };

		container.addEventListener('mousedown', stopPropagation, options);
		container.addEventListener('mouseup', stopPropagation, options);
		container.addEventListener('mousemove', stopPropagation, options);
		container.addEventListener('wheel', stopPropagation, options);
		container.addEventListener('keydown', stopPropagation, options);
		container.addEventListener('keyup', stopPropagation, options);
		container.addEventListener('pointerdown', stopPropagation, options);
		container.addEventListener('pointermove', stopPropagation, options);
		container.addEventListener('pointerup', stopPropagation, options);
		container.addEventListener('touchstart', stopPropagation, options);
		container.addEventListener('touchmove', stopPropagation, options);
		container.addEventListener('touchend', stopPropagation, options);

		return () => {
			container.removeEventListener('mousedown', stopPropagation, options);
			container.removeEventListener('mouseup', stopPropagation, options);
			container.removeEventListener('mousemove', stopPropagation, options);
			container.removeEventListener('wheel', stopPropagation, options);
			container.removeEventListener('keydown', stopPropagation, options);
			container.removeEventListener('keyup', stopPropagation, options);
			container.removeEventListener('pointerdown', stopPropagation, options);
			container.removeEventListener('pointermove', stopPropagation, options);
			container.removeEventListener('pointerup', stopPropagation, options);
			container.removeEventListener('touchstart', stopPropagation, options);
			container.removeEventListener('touchmove', stopPropagation, options);
			container.removeEventListener('touchend', stopPropagation, options);
		};
	}, []);

	const handleEditorChange = (value: string) => {
		setContent(value);
		// Clear previous timeout
		if (saveTimeoutRef.current) {
			clearTimeout(saveTimeoutRef.current);
		}
		// Debounce the save
		saveTimeoutRef.current = setTimeout(() => {
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
	};

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (saveTimeoutRef.current) {
				clearTimeout(saveTimeoutRef.current);
			}
		};
	}, []);

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

	const commonLanguages = ['javascript', 'jsx', 'java', 'python', 'markdown', 'json'];

	// Map language to CodeMirror extension
	const languageExtension = useMemo(() => {
		switch (language) {
			case 'java':
				return java();
			case 'javascript':
			case 'jsx':
				return javascript({ jsx: true });
			case 'python':
				return python();
			case 'markdown':
				return markdown();
			case 'json':
				return json();
			default:
				return javascript({ jsx: true });
		}
	}, [language]);

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (confirm('Delete this node?')) {
			dispatch(deleteNodeFromNote({ noteId: data.noteId, nodeId: node.id }));
		}
	};

	// Stop event propagation for CodeMirror interactions to prevent React Flow from capturing them
	const handleEditorInteraction = (e: React.SyntheticEvent) => {
		e.stopPropagation();
	};

	return (
		<div
			className={cn(
				'glass-strong rounded-lg border border-white/20 min-w-[300px] min-h-[300px] max-h-[800px] flex flex-col relative group',
				selected && 'ring-2 ring-primary'
			)}
			data-no-drag
			onMouseDown={(e) => {
				// Only stop propagation if clicking inside the editor area
				const target = e.target as HTMLElement;
				if (
					target.closest('.cm-editor') ||
					target.closest('.cm-scroller') ||
					target.closest('[data-no-drag]')
				) {
					e.stopPropagation();
					if (e.nativeEvent && 'stopImmediatePropagation' in e.nativeEvent) {
						e.nativeEvent.stopImmediatePropagation();
					}
				}
			}}
		>
			<div className='flex items-center justify-between p-2 border-b border-white/10'>
				<Select value={language} onValueChange={(value) => handleLanguageChange(value)}>
					<SelectTrigger className='bg-transparent text-white text-[0.6rem] outline-none border border-white/20 rounded px-2 py-1 h-6'>
						<SelectValue placeholder='Language' />
					</SelectTrigger>
					<SelectContent>
						{commonLanguages.map((lang) => (
							<SelectItem key={lang} value={lang}>
								{lang}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<button
					onClick={handleDelete}
					onMouseDown={(e) => e.stopPropagation()}
					className='p-1 bg-black/50 rounded hover:bg-red-500/50 transition-colors opacity-0 group-hover:opacity-100'
					title='Delete node'
				>
					<X className='w-3 h-3 text-white' />
				</button>
			</div>
			<div
				ref={editorContainerRef}
				className='flex-1 overflow-auto text-[0.5rem]'
				data-no-drag
				onFocus={() => setIsEditorFocused(true)}
				onBlur={() => setIsEditorFocused(false)}
				onMouseDown={handleEditorInteraction}
				onMouseUp={handleEditorInteraction}
				onMouseMove={handleEditorInteraction}
				onWheel={handleEditorInteraction}
				onKeyDown={handleEditorInteraction}
				onKeyUp={handleEditorInteraction}
				onPointerDown={handleEditorInteraction}
				onPointerMove={handleEditorInteraction}
				onPointerUp={handleEditorInteraction}
				onTouchStart={handleEditorInteraction}
				onTouchMove={handleEditorInteraction}
				onTouchEnd={handleEditorInteraction}
			>
				<CodeMirror
					value={content}
					theme={oneDark}
					extensions={[languageExtension]}
					onChange={(value) => handleEditorChange(value)}
					basicSetup={{
						lineNumbers: true,
						foldGutter: true,
						dropCursor: false,
						allowMultipleSelections: false,
					}}
				/>
			</div>
			<Handle type='target' position={Position.Left} className='h-4 w-4 bg-red-500' />
			<Handle type='source' position={Position.Right} className='h-4 w-4 bg-green-500' />
		</div>
	);
};

export default CodeNode;
