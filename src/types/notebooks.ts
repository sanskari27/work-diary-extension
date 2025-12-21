export type NodeType = 'text' | 'code' | 'link';
export type TagType = 'idea' | 'bug' | 'followup' | 'decision' | 'neutral';

export interface Notebook {
	id: string;
	label: string;
	color?: string;
	description?: string;
	createdAt: number;
	updatedAt: number;
}

export interface Node {
	id: string;
	type: NodeType;
	content: string;
	position: { x: number; y: number };
	size: { width: number; height: number };
	tag?: TagType;
	pinned: boolean;
	notebookId: string;
	createdAt: number;
	updatedAt: number;
}

export interface Connection {
	id: string;
	sourceNodeId: string;
	targetNodeId: string;
	notebookId: string;
	createdAt: number;
}

export interface NotebookState {
	notebooks: Notebook[];
	nodes: Node[];
	connections: Connection[];
	selectedNotebookId: string | null;
	undoStacks: Record<string, ActionStackItem[]>; // notebookId -> action stack
	redoStacks: Record<string, ActionStackItem[]>; // notebookId -> action stack
}

export interface ActionStackItem {
	type: 'moveNode' | 'editNode' | 'deleteNode' | 'addNode' | 'connectNodes' | 'disconnectNodes';
	timestamp: number;
	data: any; // Action-specific data for undo
}

// Type guards
export function isNodeType(value: string): value is NodeType {
	return ['text', 'code', 'link'].includes(value);
}

export function isTagType(value: string): value is TagType {
	return ['idea', 'bug', 'followup', 'decision', 'neutral'].includes(value);
}

// Validation helpers
export function validateNode(node: Partial<Node>): node is Node {
	return (
		!!node.id &&
		!!node.type &&
		isNodeType(node.type) &&
		typeof node.content === 'string' &&
		!!node.position &&
		typeof node.position.x === 'number' &&
		typeof node.position.y === 'number' &&
		!!node.size &&
		typeof node.size.width === 'number' &&
		typeof node.size.height === 'number' &&
		!!node.notebookId &&
		typeof node.createdAt === 'number' &&
		typeof node.updatedAt === 'number'
	);
}

export function validateNotebook(notebook: Partial<Notebook>): notebook is Notebook {
	return (
		!!notebook.id &&
		!!notebook.label &&
		typeof notebook.createdAt === 'number' &&
		typeof notebook.updatedAt === 'number'
	);
}

export function validateConnection(connection: Partial<Connection>): connection is Connection {
	return (
		!!connection.id &&
		!!connection.sourceNodeId &&
		!!connection.targetNodeId &&
		!!connection.notebookId &&
		typeof connection.createdAt === 'number'
	);
}
