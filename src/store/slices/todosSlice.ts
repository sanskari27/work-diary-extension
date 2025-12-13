import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { nanoid } from 'nanoid';

export type TodoStatus = 'pending' | 'in-progress' | 'completed';
export type TodoCategory = 'near-future' | 'this-month' | 'later';

export interface Todo {
	id: string;
	title: string;
	date: string; // ISO date string (YYYY-MM-DD)
	description?: string;
	isUrgent: boolean;
	status: TodoStatus;
	linkedReleaseId?: string; // Link to a release event
	reminderEnabled: boolean;
	reminderDelta?: string; // e.g., "1h", "30m", "1d" - overrides release reminder if linked
	repeat?: 'daily' | 'weekly' | 'monthly'; // Future feature
	createdAt: number;
	completedAt?: number;
}

interface TodosState {
	todos: Todo[];
}

const initialState: TodosState = {
	todos: [],
};

const todosSlice = createSlice({
	name: 'todos',
	initialState,
	reducers: {
		addTodo: (state, action: PayloadAction<Omit<Todo, 'id' | 'createdAt'>>) => {
			const newTodo: Todo = {
				...action.payload,
				id: nanoid(),
				createdAt: Date.now(),
			};
			state.todos.unshift(newTodo);
		},

		updateTodo: (state, action: PayloadAction<{ id: string; updates: Partial<Todo> }>) => {
			const index = state.todos.findIndex((t) => t.id === action.payload.id);
			if (index !== -1) {
				state.todos[index] = {
					...state.todos[index],
					...action.payload.updates,
				};
			}
		},

		deleteTodo: (state, action: PayloadAction<string>) => {
			state.todos = state.todos.filter((t) => t.id !== action.payload);
		},

		toggleTodoStatus: (state, action: PayloadAction<string>) => {
			const todo = state.todos.find((t) => t.id === action.payload);
			if (todo) {
				if (todo.status === 'completed') {
					todo.status = 'pending';
					todo.completedAt = undefined;
				} else {
					todo.status = 'completed';
					todo.completedAt = Date.now();
				}
			}
		},

		updateTodoStatus: (state, action: PayloadAction<{ id: string; status: TodoStatus }>) => {
			const todo = state.todos.find((t) => t.id === action.payload.id);
			if (todo) {
				todo.status = action.payload.status;
				if (action.payload.status === 'completed') {
					todo.completedAt = Date.now();
				} else {
					todo.completedAt = undefined;
				}
			}
		},

		linkTodoToRelease: (state, action: PayloadAction<{ todoId: string; releaseId: string }>) => {
			const todo = state.todos.find((t) => t.id === action.payload.todoId);
			if (todo) {
				todo.linkedReleaseId = action.payload.releaseId;
			}
		},

		unlinkTodoFromRelease: (state, action: PayloadAction<string>) => {
			const todo = state.todos.find((t) => t.id === action.payload);
			if (todo) {
				todo.linkedReleaseId = undefined;
			}
		},

		toggleTodoUrgent: (state, action: PayloadAction<string>) => {
			const todo = state.todos.find((t) => t.id === action.payload);
			if (todo) {
				todo.isUrgent = !todo.isUrgent;
			}
		},

		setTodos: (state, action: PayloadAction<Todo[]>) => {
			state.todos = action.payload;
		},
	},
});

export const {
	addTodo,
	updateTodo,
	deleteTodo,
	toggleTodoStatus,
	updateTodoStatus,
	linkTodoToRelease,
	unlinkTodoFromRelease,
	toggleTodoUrgent,
	setTodos,
} = todosSlice.actions;

export default todosSlice.reducer;
