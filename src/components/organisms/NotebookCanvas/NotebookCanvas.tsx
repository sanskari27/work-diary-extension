import { NodeToken } from '@/components/atoms';
import { cn } from '@/lib/utils';
import { useAppDispatch } from '@/store/hooks';
import { addConnection, moveNode, resizeNode } from '@/store/slices/notebooksSlice';
import { Connection, Node } from '@/types/notebooks';
import {
	addEdge,
	Background,
	Controls,
	MiniMap,
	NodeProps,
	ReactFlow,
	Connection as RFConnection,
	useEdgesState,
	useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Pin } from 'lucide-react';
import { useCallback, useEffect, useMemo } from 'react';

interface NotebookCanvasProps {
	nodes: Node[];
	connections: Connection[];
	notebookId: string;
	onNodeEdit?: (node: Node) => void;
	className?: string;
}

// Custom node component for text nodes
const TextNode = ({ data, selected }: NodeProps) => {
	const node = data.node as Node;

	return (
		<div
			className={cn(
				'glass-strong rounded-lg border p-3 min-w-[200px] min-h-[100px]',
				node.pinned && 'ring-2 ring-primary/50',
				node.tag === 'idea' && 'border-green-500/30 bg-green-500/10',
				node.tag === 'bug' && 'border-red-500/30 bg-red-500/10',
				node.tag === 'followup' && 'border-blue-500/30 bg-blue-500/10',
				node.tag === 'decision' && 'border-yellow-500/30 bg-yellow-500/10',
				selected && 'ring-2 ring-primary'
			)}
		>
			<div className='flex items-start justify-between gap-2 mb-2'>
				<span className='text-xs text-text-secondary'>{node.type}</span>
				{node.pinned && <Pin className='w-3 h-3 text-primary' />}
			</div>
			<NodeToken node={node} />
		</div>
	);
};

// Custom node component for code nodes
const CodeNode = ({ data, selected }: NodeProps) => {
	const node = data.node as Node;

	return (
		<div
			className={cn(
				'glass-strong rounded-lg border p-3 min-w-[300px] min-h-[150px]',
				node.pinned && 'ring-2 ring-primary/50',
				selected && 'ring-2 ring-primary'
			)}
		>
			<div className='flex items-start justify-between gap-2 mb-2'>
				<span className='text-xs text-text-secondary font-mono'>code</span>
				{node.pinned && <Pin className='w-3 h-3 text-primary' />}
			</div>
			<NodeToken node={node} />
		</div>
	);
};

// Custom node component for link nodes
const LinkNode = ({ data, selected }: NodeProps) => {
	const node = data.node as Node;

	return (
		<div
			className={cn(
				'glass-strong rounded-lg border p-3 min-w-[200px] min-h-[80px]',
				node.pinned && 'ring-2 ring-primary/50',
				selected && 'ring-2 ring-primary'
			)}
		>
			<div className='flex items-start justify-between gap-2 mb-2'>
				<span className='text-xs text-text-secondary'>link</span>
				{node.pinned && <Pin className='w-3 h-3 text-primary' />}
			</div>
			<NodeToken node={node} />
		</div>
	);
};

const nodeTypes = {
	text: TextNode,
	code: CodeNode,
	link: LinkNode,
};

const NotebookCanvas = ({
	nodes,
	connections,
	notebookId,
	className,
}: NotebookCanvasProps) => {
	// onNodeEdit reserved for future use
	const dispatch = useAppDispatch();

	// Convert nodes to ReactFlow format
	const rfNodes = useMemo(
		() =>
			nodes
				.filter((n) => n.notebookId === notebookId)
				.map((node) => ({
					id: node.id,
					type: node.type,
					position: node.position,
					data: { node },
					style: {
						width: node.size.width,
						height: node.size.height,
					},
				})),
		[nodes, notebookId]
	);

	// Convert connections to ReactFlow format
	const rfEdges = useMemo(
		() =>
			connections
				.filter((c) => c.notebookId === notebookId)
				.map((conn) => ({
					id: conn.id,
					source: conn.sourceNodeId,
					target: conn.targetNodeId,
					type: 'smoothstep',
					animated: true,
					style: { stroke: 'rgba(255, 255, 255, 0.3)' },
				})),
		[connections, notebookId]
	);

	const [reactFlowNodes, setNodes, onNodesChange] = useNodesState(rfNodes);
	const [reactFlowEdges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

	// Sync ReactFlow nodes with Redux nodes
	useEffect(() => {
		setNodes(rfNodes);
	}, [rfNodes, setNodes]);

	useEffect(() => {
		setEdges(rfEdges);
	}, [rfEdges, setEdges]);

	const onConnect = useCallback(
		(params: RFConnection) => {
			if (params.source && params.target && params.source !== params.target) {
				setEdges((eds: any[]) => addEdge(params, eds));
				// Add connection to Redux
				dispatch(
					addConnection({
						sourceNodeId: params.source!,
						targetNodeId: params.target!,
						notebookId,
					})
				);
			}
		},
		[setEdges, dispatch, notebookId]
	);

	const onNodeDrag = useCallback(
		(_: any, node: any) => {
			const originalNode = nodes.find((n) => n.id === node.id);
			if (originalNode) {
				dispatch(moveNode({ id: node.id, position: node.position }));
			}
		},
		[dispatch, nodes]
	);

	// Note: Resizing requires react-flow-resizable plugin or custom implementation
	// For now, we'll handle it via node style updates
	const onNodesChangeHandler = useCallback(
		(changes: any[]) => {
			onNodesChange(changes);
			// Handle resize changes
			changes.forEach((change) => {
				if (change.type === 'resize' && change.dimensions) {
					dispatch(
						resizeNode({
							id: change.id,
							size: {
								width: change.dimensions.width,
								height: change.dimensions.height,
							},
						})
					);
				}
			});
		},
		[dispatch, onNodesChange]
	);

	return (
		<div className={cn('w-full h-full', className)}>
			<ReactFlow
				nodes={reactFlowNodes}
				edges={reactFlowEdges}
				onNodesChange={onNodesChangeHandler}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				onNodeDrag={onNodeDrag}
				nodeTypes={nodeTypes}
				fitView
				className='bg-transparent'
			>
				<Background color='rgba(255, 255, 255, 0.05)' gap={20} />
				<Controls className='glass-strong border border-white/20' />
				<MiniMap
					className='glass-strong border border-white/20'
					nodeColor={(node: { data?: { node?: Node } }) => {
						const nodeData = node.data?.node as Node | undefined;
						if (nodeData?.tag === 'idea') return '#10b981';
						if (nodeData?.tag === 'bug') return '#ef4444';
						if (nodeData?.tag === 'followup') return '#3b82f6';
						if (nodeData?.tag === 'decision') return '#eab308';
						return '#6b7280';
					}}
					maskColor='rgba(0, 0, 0, 0.5)'
				/>
			</ReactFlow>
		</div>
	);
};

export default NotebookCanvas;
