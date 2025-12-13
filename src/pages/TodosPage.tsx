import Text from '@/components/atoms/Text/Text';
import CollapsibleSection from '@/components/molecules/CollapsibleSection/CollapsibleSection';
import TodoCard from '@/components/organisms/TodoCard/TodoCard';
import TodoDetailsPanel from '@/components/organisms/TodoDetailsPanel/TodoDetailsPanel';
import TodoForm from '@/components/organisms/TodoForm/TodoForm';
import PageLayout from '@/components/templates/PageLayout/PageLayout';
import { Button } from '@/components/ui/button';
import {
	getActiveTodos,
	getCompletedTodos,
	isTodoOverdue,
	sortTodosByCompletedDate,
	sortTodosByDueDate,
} from '@/lib/todoUtils';
import { useAppSelector } from '@/store/hooks';
import { deleteTodo, Todo } from '@/store/slices/todosSlice';
import { RootState } from '@/store/store';
import { motion } from 'framer-motion';
import {
	AlertCircle,
	Calendar,
	CheckCircle,
	CheckSquare,
	Clock,
	Link2,
	Package,
	Plus,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default function TodosPage() {
	const dispatch = useDispatch();
	const todos = useSelector((state: RootState) => state.todos.todos);
	const appearance = useAppSelector((state) => state.settings.appearanceSettings);

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [todoToEdit, setTodoToEdit] = useState<Todo | undefined>(undefined);
	const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

	// Get spacing based on appearance settings
	const getSpacing = () => {
		if (appearance.compactMode) {
			return {
				padding: 'p-4 md:p-6 lg:p-8',
				sectionGap: 'space-y-4',
				headerMargin: 'mb-4',
				iconSize: 'w-6 h-6',
				titleSize: 'text-4xl md:text-5xl',
			};
		} else if (appearance.cardSize === 'large') {
			return {
				padding: 'p-8 md:p-16 lg:p-20',
				sectionGap: 'space-y-10',
				headerMargin: 'mb-10',
				iconSize: 'w-10 h-10',
				titleSize: 'text-6xl md:text-7xl',
			};
		} else if (appearance.cardSize === 'small') {
			return {
				padding: 'p-4 md:p-8 lg:p-12',
				sectionGap: 'space-y-4',
				headerMargin: 'mb-6',
				iconSize: 'w-6 h-6',
				titleSize: 'text-3xl md:text-4xl',
			};
		}
		return {
			padding: 'p-6 md:p-12 lg:p-16',
			sectionGap: 'space-y-8',
			headerMargin: 'mb-8',
			iconSize: 'w-8 h-8',
			titleSize: 'text-5xl md:text-6xl',
		};
	};

	const spacing = getSpacing();

	// Helper function to get todo category
	const getTodoCategory = (todo: Todo): 'near-future' | 'this-month' | 'later' => {
		const now = new Date();
		now.setHours(0, 0, 0, 0); // Start of today

		const todoDate = new Date(todo.date);
		todoDate.setHours(0, 0, 0, 0); // Start of todo date

		const diffTime = todoDate.getTime() - now.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays <= 7 && diffDays >= 0) {
			return 'near-future';
		}

		const todoMonth = todoDate.getMonth();
		const todoYear = todoDate.getFullYear();
		const currentMonth = now.getMonth();
		const currentYear = now.getFullYear();

		if (todoYear === currentYear && todoMonth === currentMonth && diffDays > 7) {
			return 'this-month';
		}

		return 'later';
	};

	// Group todos similar to releases page
	const groupedTodos = useMemo(() => {
		const activeTodos = getActiveTodos(todos);

		// Urgent & Overdue
		const urgentAndOverdue: Todo[] = [];
		const nearFuture: Todo[] = [];
		const thisMonth: Todo[] = [];
		const upcoming: Todo[] = [];
		const linked: Todo[] = [];
		const completed: Todo[] = [];

		activeTodos.forEach((todo) => {
			// Check if urgent or overdue
			const isOverdue = isTodoOverdue(todo);

			if (todo.isUrgent || isOverdue) {
				urgentAndOverdue.push(todo);
			} else {
				// Categorize by time
				const category = todo.linkedReleaseId ? 'linked' : getTodoCategory(todo);

				if (todo.linkedReleaseId) {
					linked.push(todo);
				} else if (category === 'near-future') {
					nearFuture.push(todo);
				} else if (category === 'this-month') {
					thisMonth.push(todo);
				} else {
					upcoming.push(todo);
				}
			}
		});

		// Get completed todos
		getCompletedTodos(todos).forEach((todo) => {
			completed.push(todo);
		});

		return {
			urgentAndOverdue: sortTodosByDueDate(urgentAndOverdue),
			nearFuture: sortTodosByDueDate(nearFuture),
			thisMonth: sortTodosByDueDate(thisMonth),
			upcoming: sortTodosByDueDate(upcoming),
			linked: sortTodosByDueDate(linked),
			completed: sortTodosByCompletedDate(completed),
		};
	}, [todos]);

	// Get total counts
	const activeTodos = getActiveTodos(todos);
	const urgentCount = groupedTodos.urgentAndOverdue.length;
	const completedCount = groupedTodos.completed.length;

	const handleEdit = (todo: Todo) => {
		setTodoToEdit(todo);
		setIsFormOpen(true);
	};

	const handleDelete = (todoId: string) => {
		if (window.confirm('Are you sure you want to delete this todo?')) {
			dispatch(deleteTodo(todoId));
		}
	};

	const handleAddNew = () => {
		setTodoToEdit(undefined);
		setIsFormOpen(true);
	};

	const handleTodoClick = (todo: Todo) => {
		setSelectedTodo(todo);
	};

	return (
		<>
			<PageLayout>
				<div className={`min-h-screen ${spacing.padding} flex flex-col`}>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.5 }}
						className='max-w-7xl mx-auto w-full flex-1 flex flex-col'
					>
						{/* Page Header */}
						<motion.div
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className={`${spacing.headerMargin} flex items-center justify-between`}
						>
							<div className='flex items-center gap-4'>
								{!appearance.minimalMode && (
									<motion.div
										animate={{
											scale: [1, 1.05, 1],
											rotate: [0, 5, 0],
										}}
										transition={{
											duration: 3,
											repeat: Infinity,
											ease: 'easeInOut',
										}}
										className={`${
											appearance.compactMode ? 'p-3' : 'p-4'
										} rounded-2xl bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500`}
									>
										<CheckSquare className={spacing.iconSize + ' text-white'} />
									</motion.div>
								)}
								<Text
									variant='h1'
									className={`${spacing.titleSize} font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent`}
								>
									Todos
								</Text>
							</div>

							{/* New Todo Button */}
							<motion.div
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.4, delay: 0.2 }}
							>
								<Button
									onClick={handleAddNew}
									className={`flex items-center gap-2 ${
										appearance.compactMode ? 'px-4 py-2' : 'px-6 py-3'
									} rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium shadow-lg shadow-purple-500/30`}
								>
									<Plus className={appearance.compactMode ? 'w-4 h-4' : 'w-5 h-5'} />
									<span className={appearance.compactMode ? 'text-sm' : ''}>New Todo</span>
								</Button>
							</motion.div>
						</motion.div>

						{/* Stats */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							className={`${spacing.headerMargin} flex flex-wrap gap-${
								appearance.compactMode ? '4' : '6'
							} items-center`}
						>
							<div className='flex items-center gap-2'>
								<span className='text-sm text-white/70'>Active:</span>
								<span className='text-2xl font-bold text-white'>{activeTodos.length}</span>
							</div>
							<div className='flex items-center gap-2'>
								<span className='text-sm text-red-300'>Urgent:</span>
								<span className='text-2xl font-bold text-red-200'>{urgentCount}</span>
							</div>
							<div className='flex items-center gap-2'>
								<span className='text-sm text-green-300'>Completed:</span>
								<span className='text-2xl font-bold text-green-200'>{completedCount}</span>
							</div>
						</motion.div>

						{/* Content Area */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.3 }}
							className={`flex-1 ${appearance.compactMode ? 'pb-4' : 'pb-8'}`}
						>
							{todos.length > 0 ? (
								<div className={spacing.sectionGap}>
									{/* Urgent & Overdue Section */}
									{groupedTodos.urgentAndOverdue.length > 0 && (
										<CollapsibleSection
											title='Urgent & Overdue'
											count={groupedTodos.urgentAndOverdue.length}
											icon={<AlertCircle className='w-5 h-5' />}
											defaultOpen={true}
										>
											<div className={appearance.compactMode ? 'space-y-2' : 'space-y-4'}>
												{groupedTodos.urgentAndOverdue.map((todo, index) => (
													<motion.div
														key={todo.id}
														initial={{ opacity: 0, y: 20 }}
														animate={{ opacity: 1, y: 0 }}
														transition={{ delay: index * 0.05 }}
													>
														<TodoCard
															todo={todo}
															onEdit={handleEdit}
															onDelete={handleDelete}
															onClick={handleTodoClick}
														/>
													</motion.div>
												))}
											</div>
										</CollapsibleSection>
									)}

									{/* Near Future Section (Next 7 days) */}
									{groupedTodos.nearFuture.length > 0 && (
										<CollapsibleSection
											title='Near Future'
											count={groupedTodos.nearFuture.length}
											icon={<Clock className='w-5 h-5' />}
											defaultOpen={true}
										>
											<div className={appearance.compactMode ? 'space-y-2' : 'space-y-4'}>
												{groupedTodos.nearFuture.map((todo, index) => (
													<motion.div
														key={todo.id}
														initial={{ opacity: 0, y: 20 }}
														animate={{ opacity: 1, y: 0 }}
														transition={{ delay: index * 0.05 }}
													>
														<TodoCard
															todo={todo}
															onEdit={handleEdit}
															onDelete={handleDelete}
															onClick={handleTodoClick}
														/>
													</motion.div>
												))}
											</div>
										</CollapsibleSection>
									)}

									{/* This Month Section */}
									{groupedTodos.thisMonth.length > 0 && (
										<CollapsibleSection
											title='This Month'
											count={groupedTodos.thisMonth.length}
											icon={<Calendar className='w-5 h-5' />}
											defaultOpen={true}
										>
											<div className={appearance.compactMode ? 'space-y-2' : 'space-y-4'}>
												{groupedTodos.thisMonth.map((todo, index) => (
													<motion.div
														key={todo.id}
														initial={{ opacity: 0, y: 20 }}
														animate={{ opacity: 1, y: 0 }}
														transition={{ delay: index * 0.05 }}
													>
														<TodoCard
															todo={todo}
															onEdit={handleEdit}
															onDelete={handleDelete}
															onClick={handleTodoClick}
														/>
													</motion.div>
												))}
											</div>
										</CollapsibleSection>
									)}

									{/* Upcoming Section */}
									{groupedTodos.upcoming.length > 0 && (
										<CollapsibleSection
											title='Upcoming'
											count={groupedTodos.upcoming.length}
											icon={<Package className='w-5 h-5' />}
											defaultOpen={false}
										>
											<div className={appearance.compactMode ? 'space-y-2' : 'space-y-4'}>
												{groupedTodos.upcoming.map((todo, index) => (
													<motion.div
														key={todo.id}
														initial={{ opacity: 0, y: 20 }}
														animate={{ opacity: 1, y: 0 }}
														transition={{ delay: index * 0.05 }}
													>
														<TodoCard
															todo={todo}
															onEdit={handleEdit}
															onDelete={handleDelete}
															onClick={handleTodoClick}
														/>
													</motion.div>
												))}
											</div>
										</CollapsibleSection>
									)}

									{/* Linked to Releases Section */}
									{groupedTodos.linked.length > 0 && (
										<CollapsibleSection
											title='Linked to Releases'
											count={groupedTodos.linked.length}
											icon={<Link2 className='w-5 h-5' />}
											defaultOpen={true}
										>
											<div className={appearance.compactMode ? 'space-y-2' : 'space-y-4'}>
												{groupedTodos.linked.map((todo, index) => (
													<motion.div
														key={todo.id}
														initial={{ opacity: 0, y: 20 }}
														animate={{ opacity: 1, y: 0 }}
														transition={{ delay: index * 0.05 }}
													>
														<TodoCard
															todo={todo}
															onEdit={handleEdit}
															onDelete={handleDelete}
															onClick={handleTodoClick}
														/>
													</motion.div>
												))}
											</div>
										</CollapsibleSection>
									)}

									{/* Completed Section */}
									{groupedTodos.completed.length > 0 && (
										<CollapsibleSection
											title='Completed'
											count={groupedTodos.completed.length}
											icon={<CheckCircle className='w-5 h-5' />}
											defaultOpen={false}
										>
											<div className={appearance.compactMode ? 'space-y-2' : 'space-y-4'}>
												{groupedTodos.completed.map((todo, index) => (
													<motion.div
														key={todo.id}
														initial={{ opacity: 0, y: 20 }}
														animate={{ opacity: 1, y: 0 }}
														transition={{ delay: index * 0.05 }}
													>
														<TodoCard
															todo={todo}
															onEdit={handleEdit}
															onDelete={handleDelete}
															onClick={handleTodoClick}
														/>
													</motion.div>
												))}
											</div>
										</CollapsibleSection>
									)}
								</div>
							) : (
								<div className='glass-strong rounded-3xl p-12 w-full min-h-[500px] flex items-center justify-center border border-white/20'>
									<div className='text-center space-y-6'>
										<motion.div
											animate={{
												scale: [1, 1.05, 1],
												opacity: [0.5, 0.8, 0.5],
											}}
											transition={{
												duration: 3,
												repeat: Infinity,
												ease: 'easeInOut',
											}}
										>
											<CheckSquare className='w-24 h-24 mx-auto text-blue-400/40' />
										</motion.div>
										<div className='space-y-2'>
											<h3 className='text-2xl font-bold text-white/60'>No Todos Yet</h3>
											<p className='text-blue-300/40 text-sm max-w-md mx-auto'>
												Create your first todo to start tracking your tasks and staying organized.
											</p>
										</div>
										<Button
											onClick={handleAddNew}
											className='inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium shadow-lg shadow-blue-500/30'
										>
											<Plus className='w-5 h-5' />
											<span>Create First Todo</span>
										</Button>
									</div>
								</div>
							)}
						</motion.div>
					</motion.div>
				</div>
			</PageLayout>

			{/* Todo Form Modal */}
			<TodoForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} todoToEdit={todoToEdit} />

			{/* Todo Details Panel */}
			{selectedTodo && (
				<TodoDetailsPanel
					todo={selectedTodo}
					onClose={() => setSelectedTodo(null)}
					onEdit={handleEdit}
					onDelete={handleDelete}
				/>
			)}
		</>
	);
}
