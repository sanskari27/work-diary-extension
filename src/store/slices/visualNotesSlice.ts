import {
	VisualEdge,
	VisualNode,
	VisualNote,
	VisualNotebook,
	VisualNotesState,
} from '@/types/visualNotes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { nanoid } from 'nanoid';

const initialState: VisualNotesState = {
	notebooks: [],
	notes: [],
	selectedNoteId: null,
};

const visualNotesSlice = createSlice({
	name: 'visualNotes',
	initialState,
	reducers: {
		// Notebook CRUD
		addNotebook: (state, action: PayloadAction<Omit<VisualNotebook, 'id' | 'createdAt'>>) => {
			const newNotebook: VisualNotebook = {
				...action.payload,
				id: nanoid(),
				createdAt: Date.now(),
			};
			state.notebooks.push(newNotebook);
		},

		updateNotebook: (
			state,
			action: PayloadAction<{
				id: string;
				updates: Partial<Omit<VisualNotebook, 'id' | 'createdAt'>>;
			}>
		) => {
			const index = state.notebooks.findIndex((n) => n.id === action.payload.id);
			if (index !== -1) {
				state.notebooks[index] = {
					...state.notebooks[index],
					...action.payload.updates,
				};
			}
		},

		deleteNotebook: (state, action: PayloadAction<string>) => {
			const notebookId = action.payload;
			state.notebooks = state.notebooks.filter((n) => n.id !== notebookId);
			state.notes = state.notes.filter((n) => n.notebookId !== notebookId);
			if (state.selectedNoteId) {
				const selectedNote = state.notes.find((n) => n.id === state.selectedNoteId);
				if (selectedNote?.notebookId === notebookId) {
					state.selectedNoteId = null;
				}
			}
		},

		setNotebooks: (state, action: PayloadAction<VisualNotebook[]>) => {
			state.notebooks = action.payload;
		},

		// Note CRUD
		addNote: (
			state,
			action: PayloadAction<
				Omit<VisualNote, 'id' | 'createdAt' | 'updatedAt' | 'nodes' | 'edges' | 'viewport'>
			>
		) => {
			const newNote: VisualNote = {
				...action.payload,
				id: nanoid(),
				nodes: [],
				edges: [],
				viewport: { x: 0, y: 0, zoom: 1 },
				createdAt: Date.now(),
				updatedAt: Date.now(),
			};
			state.notes.push(newNote);
		},

		updateNote: (
			state,
			action: PayloadAction<{ id: string; updates: Partial<Omit<VisualNote, 'id' | 'createdAt'>> }>
		) => {
			const index = state.notes.findIndex((n) => n.id === action.payload.id);
			if (index !== -1) {
				state.notes[index] = {
					...state.notes[index],
					...action.payload.updates,
					updatedAt: Date.now(),
				};
			}
		},

		deleteNote: (state, action: PayloadAction<string>) => {
			const noteId = action.payload;
			state.notes = state.notes.filter((n) => n.id !== noteId);
			if (state.selectedNoteId === noteId) {
				state.selectedNoteId = null;
			}
		},

		setNotes: (state, action: PayloadAction<VisualNote[]>) => {
			state.notes = action.payload;
		},

		setSelectedNote: (state, action: PayloadAction<string | null>) => {
			state.selectedNoteId = action.payload;
		},

		// Node CRUD
		addNodeToNote: (
			state,
			action: PayloadAction<{ noteId: string; node: Omit<VisualNode, 'id'> }>
		) => {
			const noteIndex = state.notes.findIndex((n) => n.id === action.payload.noteId);
			if (noteIndex !== -1) {
				const newNode: VisualNode = {
					...action.payload.node,
					id: nanoid(),
				};
				state.notes[noteIndex].nodes.push(newNode);
				state.notes[noteIndex].updatedAt = Date.now();
			}
		},

		updateNodeInNote: (
			state,
			action: PayloadAction<{ noteId: string; nodeId: string; updates: Partial<VisualNode> }>
		) => {
			const noteIndex = state.notes.findIndex((n) => n.id === action.payload.noteId);
			if (noteIndex === -1) {
				return;
			}
			// only update if updates are different or values are different
			const nodeIndex = state.notes[noteIndex].nodes.findIndex(
				(n) => n.id === action.payload.nodeId
			);
			if (nodeIndex === -1) {
				return;
			}
			const currentNode = state.notes[noteIndex].nodes[nodeIndex];
			const updates = action.payload.updates;
			const areDifferent = Object.keys(updates).some(
				(key) => currentNode[key as keyof VisualNode] !== updates[key as keyof VisualNode]
			);
			if (areDifferent) {
				state.notes[noteIndex].nodes[nodeIndex] = {
					...state.notes[noteIndex].nodes[nodeIndex],
					...action.payload.updates,
				};
				state.notes[noteIndex].updatedAt = Date.now();
			}
		},

		deleteNodeFromNote: (state, action: PayloadAction<{ noteId: string; nodeId: string }>) => {
			const noteIndex = state.notes.findIndex((n) => n.id === action.payload.noteId);
			if (noteIndex === -1) {
				return;
			}
			state.notes[noteIndex].nodes = state.notes[noteIndex].nodes.filter(
				(n) => n.id !== action.payload.nodeId
			);
			// Remove edges connected to this node
			state.notes[noteIndex].edges = state.notes[noteIndex].edges.filter(
				(e) => e.source !== action.payload.nodeId && e.target !== action.payload.nodeId
			);
			state.notes[noteIndex].updatedAt = Date.now();
		},

		// Edge CRUD
		addEdgeToNote: (
			state,
			action: PayloadAction<{ noteId: string; edge: Omit<VisualEdge, 'id'> }>
		) => {
			const noteIndex = state.notes.findIndex((n) => n.id === action.payload.noteId);
			if (noteIndex !== -1) {
				const newEdge: VisualEdge = {
					...action.payload.edge,
					id: nanoid(),
				};
				state.notes[noteIndex].edges.push(newEdge);
				state.notes[noteIndex].updatedAt = Date.now();
			}
		},

		deleteEdgeFromNote: (state, action: PayloadAction<{ noteId: string; edgeId: string }>) => {
			const noteIndex = state.notes.findIndex((n) => n.id === action.payload.noteId);
			if (noteIndex !== -1) {
				state.notes[noteIndex].edges = state.notes[noteIndex].edges.filter(
					(e) => e.id !== action.payload.edgeId
				);
				state.notes[noteIndex].updatedAt = Date.now();
			}
		},

		// Viewport updates
		updateNoteViewport: (
			state,
			action: PayloadAction<{ noteId: string; viewport: Partial<VisualNote['viewport']> }>
		) => {
			const noteIndex = state.notes.findIndex((n) => n.id === action.payload.noteId);
			if (noteIndex !== -1) {
				state.notes[noteIndex].viewport = {
					...state.notes[noteIndex].viewport,
					...action.payload.viewport,
				};
			}
		},
	},
});

export const {
	addNotebook,
	updateNotebook,
	deleteNotebook,
	setNotebooks,
	addNote,
	updateNote,
	deleteNote,
	setNotes,
	setSelectedNote,
	addNodeToNote,
	updateNodeInNote,
	deleteNodeFromNote,
	addEdgeToNote,
	deleteEdgeFromNote,
	updateNoteViewport,
} = visualNotesSlice.actions;

export default visualNotesSlice.reducer;
