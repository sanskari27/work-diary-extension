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
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface TodoFormProps {
	isOpen: boolean;
	onClose: () => void;
	todoToEdit?: Todo;
}

export default function TodoForm({ isOpen, onClose, todoToEdit }: TodoFormProps) {
	const dispatch = useDispatch();
	const releases = useSelector((state: RootState) => state.releases.events);
	const settings = useSelector((state: RootState) => state.settings);

	// Form state
	const [title, setTitle] = useState('');
	const [date, setDate] = useState(() => getDateAfterDays(5));
	const [description, setDescription] = useState('');
	const [isUrgent, setIsUrgent] = useState(false);
	const [linkedReleaseId, setLinkedReleaseId] = useState<string>('__none__');
	const [reminderEnabled, setReminderEnabled] = useState(
		settings.reminderPreferences.defaultReminderEnabled
	);
	const [reminderDelta, setReminderDelta] = useState(
		settings.reminderPreferences.defaultReminderDelta
	);

	// Initialize form with todo data if editing
	useEffect(() => {
		if (todoToEdit) {
			setTitle(todoToEdit.title);
			setDate(todoToEdit.date);
			setDescription(todoToEdit.description || '');
			setIsUrgent(todoToEdit.isUrgent);
			setLinkedReleaseId(todoToEdit.linkedReleaseId || '__none__');
			setReminderEnabled(todoToEdit.reminderEnabled);
			setReminderDelta(
				todoToEdit.reminderDelta || settings.reminderPreferences.defaultReminderDelta
			);
		} else {
			resetForm();
		}
	}, [todoToEdit, isOpen]);

	const resetForm = () => {
		setTitle('');
		setDate(getDateAfterDays(5));
		setDescription('');
		setIsUrgent(false);
		setLinkedReleaseId('__none__');
		setReminderEnabled(settings.reminderPreferences.defaultReminderEnabled);
		setReminderDelta(settings.reminderPreferences.defaultReminderDelta);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!title.trim() || !date) {
			alert('Please fill in all required fields');
			return;
		}

		const todoData = {
			title: title.trim(),
			date,
			description: description.trim(),
			isUrgent,
			linkedReleaseId:
				linkedReleaseId && linkedReleaseId !== '__none__' ? linkedReleaseId : undefined,
			reminderEnabled,
			reminderDelta: reminderEnabled ? reminderDelta : undefined,
			// Status defaults to 'pending' for new todos, preserve existing status when editing
			...(todoToEdit ? { status: todoToEdit.status } : { status: 'pending' as const }),
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
							value={title}
							onChange={(e) => setTitle(e.target.value)}
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
								value={date}
								onChange={(newDate) => setDate(newDate)}
								className='w-full bg-white/10 hover:bg-white/15 border-white/20 text-white placeholder:text-white/40'
								placeholder='Complete by...'
							/>
						</div>
						<div className='flex-1'>
							<Select value={linkedReleaseId} onValueChange={setLinkedReleaseId}>
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
								onClick={() => setIsUrgent(!isUrgent)}
								className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
									isUrgent
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
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder='Add additional notes or context...'
							rows={3}
							className='w-full bg-white/10 border-white/20 text-white placeholder:text-white/40 resize-none'
						/>
					</div>

					{/* Reminder Toggle */}
					<div className='space-y-3'>
						<ReminderToggle
							isEnable={reminderEnabled}
							onClick={() => setReminderEnabled(!reminderEnabled)}
						/>

						{/* Reminder Delta */}
						{reminderEnabled && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: 'auto' }}
								exit={{ opacity: 0, height: 0 }}
								className='space-y-2'
							>
								<Label htmlFor='reminderDelta' className='text-sm font-medium text-text-secondary'>
									Remind me before
								</Label>
								<ReminderInput value={reminderDelta} onValueChange={setReminderDelta} />
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
