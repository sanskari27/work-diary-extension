import { DatePicker, ReminderInput, ReminderToggle } from '@/components/atoms';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { getDateAfterDays } from '@/lib/dateUtils';
import { addTodo, Todo, updateTodo } from '@/store/slices/todosSlice';
import { RootState } from '@/store/store';
import { motion } from 'framer-motion';
import { AlignLeft, CheckSquare } from 'lucide-react';
import { useEffect, useReducer } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface TodoFormProps {
	isOpen: boolean;
	onClose: () => void;
	todoToEdit?: Todo;
}

interface TodoFormState {
	title: string;
	date: string;
	description: string;
	isUrgent: boolean;
	linkedReleaseId: string;
	reminderEnabled: boolean;
	reminderDelta: string;
}

type TodoFormAction =
	| { type: 'SET_TITLE'; payload: string }
	| { type: 'SET_DATE'; payload: string }
	| { type: 'SET_DESCRIPTION'; payload: string }
	| { type: 'SET_IS_URGENT'; payload: boolean }
	| { type: 'SET_LINKED_RELEASE_ID'; payload: string }
	| { type: 'SET_REMINDER_ENABLED'; payload: boolean }
	| { type: 'SET_REMINDER_DELTA'; payload: string }
	| { type: 'RESET'; payload: { defaultReminderEnabled: boolean; defaultReminderDelta: string } }
	| { type: 'INIT_FROM_TODO'; payload: { todo: Todo; defaultReminderDelta: string } };

const initialState = (
	defaultReminderEnabled: boolean,
	defaultReminderDelta: string
): TodoFormState => ({
	title: '',
	date: getDateAfterDays(5),
	description: '',
	isUrgent: false,
	linkedReleaseId: '__none__',
	reminderEnabled: defaultReminderEnabled,
	reminderDelta: defaultReminderDelta,
});

const todoFormReducer = (state: TodoFormState, action: TodoFormAction): TodoFormState => {
	switch (action.type) {
		case 'SET_TITLE':
			return { ...state, title: action.payload };
		case 'SET_DATE':
			return { ...state, date: action.payload };
		case 'SET_DESCRIPTION':
			return { ...state, description: action.payload };
		case 'SET_IS_URGENT':
			return { ...state, isUrgent: action.payload };
		case 'SET_LINKED_RELEASE_ID':
			return { ...state, linkedReleaseId: action.payload };
		case 'SET_REMINDER_ENABLED':
			return { ...state, reminderEnabled: action.payload };
		case 'SET_REMINDER_DELTA':
			return { ...state, reminderDelta: action.payload };
		case 'RESET':
			return initialState(
				action.payload.defaultReminderEnabled,
				action.payload.defaultReminderDelta
			);
		case 'INIT_FROM_TODO':
			return {
				title: action.payload.todo.title,
				date: action.payload.todo.date,
				description: action.payload.todo.description || '',
				isUrgent: action.payload.todo.isUrgent,
				linkedReleaseId: action.payload.todo.linkedReleaseId || '__none__',
				reminderEnabled: action.payload.todo.reminderEnabled,
				reminderDelta: action.payload.todo.reminderDelta || action.payload.defaultReminderDelta,
			};
		default:
			return state;
	}
};

export default function TodoForm({ isOpen, onClose, todoToEdit }: TodoFormProps) {
	const dispatch = useDispatch();
	const releases = useSelector((state: RootState) => state.releases.events);
	const settings = useSelector((state: RootState) => state.settings);

	const [formState, formDispatch] = useReducer(
		todoFormReducer,
		initialState(
			settings.reminderPreferences.defaultReminderEnabled,
			settings.reminderPreferences.defaultReminderDelta
		)
	);

	// Initialize form with todo data if editing
	useEffect(() => {
		if (todoToEdit) {
			formDispatch({
				type: 'INIT_FROM_TODO',
				payload: {
					todo: todoToEdit,
					defaultReminderDelta: settings.reminderPreferences.defaultReminderDelta,
				},
			});
		} else {
			formDispatch({
				type: 'RESET',
				payload: {
					defaultReminderEnabled: settings.reminderPreferences.defaultReminderEnabled,
					defaultReminderDelta: settings.reminderPreferences.defaultReminderDelta,
				},
			});
		}
	}, [
		todoToEdit,
		isOpen,
		settings.reminderPreferences.defaultReminderEnabled,
		settings.reminderPreferences.defaultReminderDelta,
	]);

	const resetForm = () => {
		formDispatch({
			type: 'RESET',
			payload: {
				defaultReminderEnabled: settings.reminderPreferences.defaultReminderEnabled,
				defaultReminderDelta: settings.reminderPreferences.defaultReminderDelta,
			},
		});
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!formState.title.trim() || !formState.date) {
			alert('Please fill in all required fields');
			return;
		}

		const todoData = {
			title: formState.title.trim(),
			date: formState.date,
			description: formState.description.trim(),
			isUrgent: formState.isUrgent,
			linkedReleaseId:
				formState.linkedReleaseId && formState.linkedReleaseId !== '__none__'
					? formState.linkedReleaseId
					: undefined,
			reminderEnabled: formState.reminderEnabled,
			reminderDelta: formState.reminderEnabled ? formState.reminderDelta : undefined,
			// Status defaults to 'pending' for new todos, preserve existing status when editing
			...(todoToEdit ? { status: todoToEdit.status } : { status: 'pending' as const }),
			// Origin: if linked to release, set to 'release', otherwise preserve existing or default to 'manual'
			origin:
				todoToEdit?.origin ||
				(formState.linkedReleaseId && formState.linkedReleaseId !== '__none__'
					? ('release' as const)
					: ('manual' as const)),
		};

		if (todoToEdit) {
			dispatch(updateTodo({ id: todoToEdit.id, updates: todoData }));
		} else {
			dispatch(addTodo(todoData));
		}

		onClose();
		resetForm();
	};

	// Get active releases (not archived)
	const activeReleases = releases.filter((r) => !r.isArchived);

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='glass-strong border-white/30 text-white max-w-2xl max-h-[90vh] overflow-y-auto bg-background-gradient'>
				<DialogHeader>
					<DialogTitle className='text-2xl font-bold bg-clip-text text-transparent bg-gradient-text'>
						{todoToEdit ? 'Edit Todo' : 'Create New Todo'}
					</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className='space-y-6'>
					{/* Title */}
					<div className='space-y-2'>
						<Label
							htmlFor='title'
							className='text-sm font-medium text-text-secondary flex items-center gap-2'
						>
							<CheckSquare className='w-4 h-4' />
							Title *
						</Label>
						<Input
							id='title'
							value={formState.title}
							onChange={(e) => formDispatch({ type: 'SET_TITLE', payload: e.target.value })}
							placeholder='Enter your task...'
							className='w-full bg-white/10 border-white/20 text-white placeholder:text-white/40'
							required
						/>
					</div>

					{/* Date + Priority in same row */}
					<div className='flex gap-4 justify-between items-end'>
						{/* Date */}
						<div className='flex-1'>
							<DatePicker
								value={formState.date}
								onChange={(newDate) => formDispatch({ type: 'SET_DATE', payload: newDate })}
								className='w-full bg-white/10 hover:bg-white/15 border-white/20 text-white placeholder:text-white/40'
								placeholder='Complete by...'
							/>
						</div>
						<div className='flex-1'>
							<Select
								value={formState.linkedReleaseId}
								onValueChange={(value) =>
									formDispatch({ type: 'SET_LINKED_RELEASE_ID', payload: value })
								}
							>
								<SelectTrigger className='w-full bg-white/10 border-white/20 text-white'>
									<SelectValue placeholder='Select a release...' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='__none__'>Link to release (optional)</SelectItem>
									{activeReleases.map((release) => (
										<SelectItem key={release.id} value={release.id}>
											{release.title} - {new Date(release.date).toLocaleDateString()}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Priority Toggle */}
						<div className='space-y-2'>
							<button
								type='button'
								onClick={() =>
									formDispatch({ type: 'SET_IS_URGENT', payload: !formState.isUrgent })
								}
								className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
									formState.isUrgent
										? 'bg-primary/80 text-white border border-accent-border'
										: 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
								}`}
							>
								Urgent
							</button>
						</div>
					</div>

					{/* Description */}
					<div className='space-y-2'>
						<Label
							htmlFor='description'
							className='text-sm font-medium text-text-secondary flex items-center gap-2'
						>
							<AlignLeft className='w-4 h-4' />
							Description (Optional)
						</Label>
						<Textarea
							id='description'
							value={formState.description}
							onChange={(e) => formDispatch({ type: 'SET_DESCRIPTION', payload: e.target.value })}
							placeholder='Add additional notes or context...'
							rows={3}
							className='w-full bg-white/10 border-white/20 text-white placeholder:text-white/40 resize-none'
						/>
					</div>

					{/* Reminder Toggle */}
					<div className='space-y-3'>
						<ReminderToggle
							isEnable={formState.reminderEnabled}
							onClick={() =>
								formDispatch({ type: 'SET_REMINDER_ENABLED', payload: !formState.reminderEnabled })
							}
						/>

						{/* Reminder Delta */}
						{formState.reminderEnabled && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: 'auto' }}
								exit={{ opacity: 0, height: 0 }}
								className='space-y-2'
							>
								<Label htmlFor='reminderDelta' className='text-sm font-medium text-text-secondary'>
									Remind me before
								</Label>
								<ReminderInput
									value={formState.reminderDelta}
									onValueChange={(value) =>
										formDispatch({ type: 'SET_REMINDER_DELTA', payload: value })
									}
								/>
							</motion.div>
						)}
					</div>

					{/* Action Buttons */}
					<div className='flex gap-3 pt-4'>
						<Button
							type='button'
							onClick={onClose}
							variant='outline'
							className='flex-1 bg-white/10 hover:bg-white/15 border-white/20 text-white'
						>
							Cancel
						</Button>
						<Button type='submit' variant='gradient' className='flex-1'>
							{todoToEdit ? 'Update Todo' : 'Create Todo'}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
