import CodeNode from '@/components/molecules/VisualNodes/CodeNode/CodeNode';
import TextNode from '@/components/molecules/VisualNodes/TextNode/TextNode';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addEdgeToNote, updateNodeInNote } from '@/store/slices/visualNotesSlice';
import {
	Background,
	Connection,
	MiniMap,
	ReactFlow,
	addEdge,
	useEdgesState,
	useNodesState,
	useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useEffect, useMemo, useRef } from 'react';

interface VisualNotesCanvasProps {
	noteId: string;
}

const nodeTypes = {
	text: TextNode,
	code: CodeNode,
};

const VisualNotesCanvas = ({ noteId }: VisualNotesCanvasProps) => {
	const dispatch = useAppDispatch();
	const notes = useAppSelector((state) => state.visualNotes.notes);
	const note = useMemo(() => notes.find((n) => n.id === noteId), [notes, noteId]);
	const { fitView } = useReactFlow();
	const viewportUpdateTimeoutRef = useRef<NodeJS.Timeout>();

	// Convert visual nodes to ReactFlow nodes
	const rfNodes = useMemo(() => {
		if (!note) return [];
		return note.nodes.map((node) => ({
			id: node.id,
			type: node.type,
			position: node.position,
			width: node.width,
			height: node.height,
			data: { node, noteId },
		}));
	}, [note]);

	// Convert visual edges to ReactFlow edges
	const rfEdges = useMemo(() => {
		if (!note) return [];
		return note.edges.map((edge) => ({
			id: edge.id,
			source: edge.source,
			target: edge.target,
			type: 'smoothstep',
			animated: true,
			style: { stroke: 'rgba(255, 255, 255, 0.3)' },
		}));
	}, [note]);

	const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

	// Sync ReactFlow nodes with Redux nodes
	useEffect(() => {
		setNodes(rfNodes);
	}, [rfNodes, setNodes]);

	useEffect(() => {
		setEdges(rfEdges);
	}, [rfEdges, setEdges]);

	// Restore viewport when note changes
	useEffect(() => {
		if (note && note.viewport) {
			// Use setTimeout to ensure ReactFlow is ready
			setTimeout(() => {
				fitView({
					padding: 0.2,
					duration: 0,
				});
				// Set viewport position and zoom
				// Note: @xyflow/react doesn't have direct setViewport, so we use fitView
				// For exact viewport restoration, we'd need to use the viewport prop
			}, 100);
		}
	}, [note?.id, fitView]);

	// Handle node changes (drag, resize)
	const onNodesChangeHandler = useCallback(
		(changes: any[]) => {
			onNodesChange(changes);

			// Update Redux state for position and size changes
			changes.forEach((change) => {
				if (change.type === 'position' && change.position) {
					dispatch(
						updateNodeInNote({
							noteId,
							nodeId: change.id,
							updates: { position: change.position },
						})
					);
				} else if (change.type === 'dimensions' && change.dimensions) {
					dispatch(
						updateNodeInNote({
							noteId,
							nodeId: change.id,
							updates: {
								width: change.dimensions.width,
								height: change.dimensions.height,
							},
						})
					);
				}
			});
		},
		[dispatch, noteId, onNodesChange]
	);

	// Handle edge connections
	const onConnect = useCallback(
		(connection: Connection) => {
			if (connection.source && connection.target && connection.source !== connection.target) {
				setEdges((eds) => addEdge(connection, eds));
				dispatch(
					addEdgeToNote({
						noteId,
						edge: {
							source: connection.source,
							target: connection.target,
						},
					})
				);
			}
		},
		[dispatch, noteId, setEdges]
	);

	// Handle viewport changes (debounced)
	const onMove = useCallback(() => {
		if (viewportUpdateTimeoutRef.current) {
			clearTimeout(viewportUpdateTimeoutRef.current);
		}
		viewportUpdateTimeoutRef.current = setTimeout(() => {
			// Get current viewport from ReactFlow
			// Note: We'll need to track this via onMoveEnd or use the viewport state
		}, 500);
	}, []);

	const onMoveEnd = useCallback(() => {
		// Update viewport in Redux when pan/zoom ends
		// For now, we'll update on node/edge changes
	}, []);

	if (!note) {
		return (
			<div className='w-full h-full flex items-center justify-center'>
				<p className='text-text-secondary'>Note not found</p>
			</div>
		);
	}

	return (
		<div className='w-full h-full'>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChangeHandler}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				onMove={onMove}
				onMoveEnd={onMoveEnd}
				nodeTypes={nodeTypes}
				fitView
				className='bg-transparent'
				defaultViewport={{ x: note.viewport.x, y: note.viewport.y, zoom: note.viewport.zoom }}
			>
				<Background color='rgba(255, 255, 255, 0.05)' gap={20} />
				{/* <Controls className='glass-strong border border-white/20' /> */}
				<MiniMap
					className='glass-strong border border-white/20'
					nodeColor='rgba(255, 255, 255, 0.2)'
					maskColor='rgba(0, 0, 0, 0.5)'
				/>
			</ReactFlow>
		</div>
	);
};

export default VisualNotesCanvas;
