import { ReminderInput, ReminderToggle } from '@/components/atoms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppSelector } from '@/store/hooks';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { useEffect, useReducer } from 'react';

interface ReleaseEventFormProps {
	onSubmit: (data: {
		title: string;
		date: string;
		reminderEnabled: boolean;
		reminderDelta?: string;
	}) => void;
	onCancel: () => void;
}

interface ReleaseEventFormState {
	title: string;
	date: string;
	reminderEnabled: boolean;
	reminderDelta: string;
}

type ReleaseEventFormAction =
	| { type: 'SET_TITLE'; payload: string }
	| { type: 'SET_DATE'; payload: string }
	| { type: 'SET_REMINDER_ENABLED'; payload: boolean }
	| { type: 'SET_REMINDER_DELTA'; payload: string }
	| { type: 'UPDATE_DEFAULTS'; payload: { defaultReminderEnabled: boolean; defaultDelta: string } };

const createInitialState = (
	defaultReminderEnabled: boolean,
	defaultDelta: string
): ReleaseEventFormState => ({
	title: '',
	date: '',
	reminderEnabled: defaultReminderEnabled,
	reminderDelta: defaultDelta,
});

const releaseEventFormReducer = (
	state: ReleaseEventFormState,
	action: ReleaseEventFormAction
): ReleaseEventFormState => {
	switch (action.type) {
		case 'SET_TITLE':
			return { ...state, title: action.payload };
		case 'SET_DATE':
			return { ...state, date: action.payload };
		case 'SET_REMINDER_ENABLED':
			return { ...state, reminderEnabled: action.payload };
		case 'SET_REMINDER_DELTA':
			return { ...state, reminderDelta: action.payload };
		case 'UPDATE_DEFAULTS':
			return {
				...state,
				reminderEnabled: action.payload.defaultReminderEnabled,
				reminderDelta: action.payload.defaultDelta,
			};
		default:
			return state;
	}
};

const ReleaseEventForm = ({ onSubmit, onCancel }: ReleaseEventFormProps) => {
	// Get settings from Redux store
	const settings = useAppSelector((state) => state.settings.releaseEventDefaults);

	const [formState, formDispatch] = useReducer(
		releaseEventFormReducer,
		createInitialState(settings.defaultReminderEnabled, settings.defaultDelta)
	);

	// Update defaults when settings change
	useEffect(() => {
		formDispatch({
			type: 'UPDATE_DEFAULTS',
			payload: {
				defaultReminderEnabled: settings.defaultReminderEnabled,
				defaultDelta: settings.defaultDelta,
			},
		});
	}, [settings.defaultReminderEnabled, settings.defaultDelta]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (formState.title.trim() && formState.date) {
			// Apply title prefix if not already present
			const finalTitle = formState.title.trim().startsWith(settings.titlePrefix)
				? formState.title.trim()
				: `${settings.titlePrefix}${formState.title.trim()}`;

			onSubmit({
				title: finalTitle,
				date: formState.date,
				reminderEnabled: formState.reminderEnabled,
				reminderDelta: formState.reminderEnabled ? formState.reminderDelta : undefined,
			});
		}
	};

	return (
		<form onSubmit={handleSubmit} className='space-y-6'>
			{/* Title Input */}
			<div className='space-y-2'>
				<Label className='text-sm font-medium text-text-secondary flex items-center gap-2'>
					<Calendar className='w-4 h-4' />
					Release Title
				</Label>
				<Input
					type='text'
					value={formState.title}
					onChange={(e) => formDispatch({ type: 'SET_TITLE', payload: e.target.value })}
					placeholder={`e.g., ${settings.titlePrefix}Q1 2025`}
					className='w-full bg-white/10 border-white/20 text-white placeholder:text-white/40'
					required
				/>
			</div>

			{/* Date Input */}
			<div className='space-y-2'>
				<Label className='text-sm font-medium text-text-secondary flex items-center gap-2'>
					<Calendar className='w-4 h-4' />
					Release Date
				</Label>
				<Input
					type='date'
					value={formState.date}
					onChange={(e) => formDispatch({ type: 'SET_DATE', payload: e.target.value })}
					className='w-full bg-white/10 border-white/20 text-white'
					required
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
						<Label className='text-sm font-medium text-text-secondary'>Remind me before</Label>
						<ReminderInput
							value={formState.reminderDelta}
							onValueChange={(value) =>
								formDispatch({ type: 'SET_REMINDER_DELTA', payload: value })
							}
							placeholder='Select days'
						/>
					</motion.div>
				)}
			</div>

			{/* Action Buttons */}
			<div className='flex gap-3 pt-4'>
				<Button
					type='button'
					onClick={onCancel}
					variant='outline'
					className='flex-1 bg-white/10 hover:bg-white/15 border-white/20 text-white'
				>
					Cancel
				</Button>
				<Button type='submit' variant='gradient' className='flex-1'>
					Create Release
				</Button>
			</div>
		</form>
	);
};

export default ReleaseEventForm;
