import { Todo, TodoCategory } from '@/store/slices/todosSlice';

/**
 * Determines the category of a todo based on its date
 */
export function getTodoCategory(todo: Todo): TodoCategory {
	const now = new Date();
	now.setHours(0, 0, 0, 0); // Start of today

	const todoDate = new Date(todo.date);
	todoDate.setHours(0, 0, 0, 0); // Start of todo date

	const diffTime = todoDate.getTime() - now.getTime();
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	// Within next 7 days
	if (diffDays <= 7 && diffDays >= 0) {
		return 'near-future';
	}

	// Within current month
	const todoMonth = todoDate.getMonth();
	const todoYear = todoDate.getFullYear();
	const currentMonth = now.getMonth();
	const currentYear = now.getFullYear();

	if (todoYear === currentYear && todoMonth === currentMonth && diffDays > 7) {
		return 'this-month';
	}

	// Later (next month onwards or past)
	return 'later';
}

/**
 * Filters todos by category
 */
export function filterTodosByCategory(todos: Todo[], category: TodoCategory): Todo[] {
	return todos.filter((todo) => getTodoCategory(todo) === category);
}

/**
 * Gets urgent todos
 */
export function getUrgentTodos(todos: Todo[]): Todo[] {
	return todos.filter((todo) => todo.isUrgent && todo.status !== 'completed');
}

/**
 * Gets completed todos
 */
export function getCompletedTodos(todos: Todo[]): Todo[] {
	return todos.filter((todo) => todo.status === 'completed');
}

/**
 * Gets todos linked to a specific release
 */
export function getTodosLinkedToRelease(todos: Todo[], releaseId: string): Todo[] {
	return todos.filter((todo) => todo.linkedReleaseId === releaseId);
}

/**
 * Gets active todos (not completed)
 */
export function getActiveTodos(todos: Todo[]): Todo[] {
	return todos.filter((todo) => todo.status !== 'completed');
}

/**
 * Sorts todos by due date (nearest first)
 */
export function sortTodosByDueDate(todos: Todo[]): Todo[] {
	return [...todos].sort((a, b) => {
		const dateA = new Date(a.date);
		const dateB = new Date(b.date);
		return dateA.getTime() - dateB.getTime();
	});
}

/**
 * Sorts todos by completion date (most recent first)
 */
export function sortTodosByCompletedDate(todos: Todo[]): Todo[] {
	return [...todos].sort((a, b) => {
		if (!a.completedAt || !b.completedAt) return 0;
		return b.completedAt - a.completedAt;
	});
}

/**
 * Formats a date for display
 */
export function formatTodoDueDate(date: string): string {
	const todoDate = new Date(date);
	const now = new Date();
	now.setHours(0, 0, 0, 0);
	todoDate.setHours(0, 0, 0, 0);

	const diffTime = todoDate.getTime() - now.getTime();
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays === 0) {
		return 'Today';
	} else if (diffDays === 1) {
		return 'Tomorrow';
	} else if (diffDays === -1) {
		return 'Yesterday';
	} else if (diffDays > 0 && diffDays <= 7) {
		return todoDate.toLocaleDateString('en-US', { weekday: 'long' });
	} else {
		return todoDate.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: todoDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
		});
	}
}

/**
 * Checks if a todo is overdue
 */
export function isTodoOverdue(todo: Todo): boolean {
	if (todo.status === 'completed') return false;

	const todoDate = new Date(todo.date);
	todoDate.setHours(23, 59, 59, 999); // End of the todo date

	const now = new Date();
	return todoDate.getTime() < now.getTime();
}

/**
 * Gets the urgency level of a todo
 * Returns 'overdue' | 'due-today' | 'upcoming'
 */
export function getTodoUrgencyLevel(todo: Todo): 'overdue' | 'due-today' | 'upcoming' {
	if (todo.status === 'completed') return 'upcoming';

	const now = new Date();
	now.setHours(0, 0, 0, 0);

	const todoDate = new Date(todo.date);
	todoDate.setHours(0, 0, 0, 0);

	const diffTime = todoDate.getTime() - now.getTime();
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays < 0) {
		return 'overdue';
	} else if (diffDays === 0) {
		return 'due-today';
	} else {
		return 'upcoming';
	}
}

/**
 * Gets the reminder time for a todo (considering release linkage)
 */
export function getTodoReminderTime(todo: Todo, linkedReleaseReminderDelta?: string): Date | null {
	if (!todo.reminderEnabled) return null;

	const todoDate = new Date(todo.date);
	todoDate.setHours(9, 0, 0, 0); // Default to 9 AM on the todo date

	const delta = todo.reminderDelta || linkedReleaseReminderDelta;

	if (!delta) return null;

	return calculateReminderTime(todoDate, delta);
}

/**
 * Parses a delta string (e.g., "1d", "2h", "30m") and calculates the reminder time
 */
export function calculateReminderTime(eventTime: Date, delta: string): Date {
	const match = delta.match(/^(\d+)([mhd])$/);
	if (!match) return eventTime;

	const value = parseInt(match[1]);
	const unit = match[2];

	const reminderTime = new Date(eventTime);

	switch (unit) {
		case 'm': // minutes
			reminderTime.setMinutes(reminderTime.getMinutes() - value);
			break;
		case 'h': // hours
			reminderTime.setHours(reminderTime.getHours() - value);
			break;
		case 'd': // days
			reminderTime.setDate(reminderTime.getDate() - value);
			break;
	}

	return reminderTime;
}

/**
 * Gets pending and in-progress todo counts for a release
 */
export function getReleaseTodoStats(todos: Todo[], releaseId: string) {
	const releaseTodos = getTodosLinkedToRelease(todos, releaseId);
	const pending = releaseTodos.filter(
		(t) => t.status === 'pending' || t.status === 'in-progress'
	).length;
	const completed = releaseTodos.filter((t) => t.status === 'completed').length;

	return { pending, completed, total: releaseTodos.length };
}
