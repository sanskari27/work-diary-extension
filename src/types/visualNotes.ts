export type VisualNodeType = 'text' | 'code' | 'link' | 'image';

export interface VisualNotebook {
	id: string;
	title: string;
	createdAt: number;
}

export interface VisualNoteViewport {
	x: number;
	y: number;
	zoom: number;
}

export interface VisualNote {
	id: string;
	notebookId: string;
	title: string;
	nodes: VisualNode[];
	edges: VisualEdge[];
	viewport: VisualNoteViewport;
	createdAt: number;
	updatedAt: number;
}

export interface VisualNode {
	id: string;
	type: VisualNodeType;
	position: { x: number; y: number };
	width: number;
	height: number;
	data: VisualNodeData;
}

export type VisualNodeData = TextNodeData | CodeNodeData | LinkNodeData | ImageNodeData;

export interface TextNodeData {
	type: 'text';
	content: string;
}

export interface CodeNodeData {
	type: 'code';
	content: string;
	language?: string;
}

export interface LinkNodeData {
	type: 'link';
	url: string;
	title?: string;
}

export interface ImageNodeData {
	type: 'image';
	url: string;
	alt?: string;
}

export interface VisualEdge {
	id: string;
	source: string;
	target: string;
}

export interface VisualNotesState {
	notebooks: VisualNotebook[];
	notes: VisualNote[];
	selectedNoteId: string | null;
}

// Type guards
export function isVisualNodeType(value: string): value is VisualNodeType {
	return ['text', 'code'].includes(value);
}

export function isTextNodeData(data: VisualNodeData): data is TextNodeData {
	return data.type === 'text';
}

export function isCodeNodeData(data: VisualNodeData): data is CodeNodeData {
	return data.type === 'code';
}
