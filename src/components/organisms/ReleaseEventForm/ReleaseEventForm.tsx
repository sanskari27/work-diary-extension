import { ReminderInput, ReminderToggle } from '@/components/atoms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppSelector } from '@/store/hooks';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ReleaseEventFormProps {
	onSubmit: (data: {
		title: string;
		date: string;
		reminderEnabled: boolean;
		reminderDelta?: string;
	}) => void;
	onCancel: () => void;
}

const ReleaseEventForm = ({ onSubmit, onCancel }: ReleaseEventFormProps) => {
	// Get settings from Redux store
	const settings = useAppSelector((state) => state.settings.releaseEventDefaults);

	const [title, setTitle] = useState('');
	const [date, setDate] = useState('');
	const [reminderEnabled, setReminderEnabled] = useState(settings.defaultReminderEnabled);
	const [reminderDelta, setReminderDelta] = useState(settings.defaultDelta);

	// Update defaults when settings change
	useEffect(() => {
		setReminderEnabled(settings.defaultReminderEnabled);
		setReminderDelta(settings.defaultDelta);
	}, [settings.defaultReminderEnabled, settings.defaultDelta]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (title.trim() && date) {
			// Apply title prefix if not already present
			const finalTitle = title.trim().startsWith(settings.titlePrefix)
				? title.trim()
				: `${settings.titlePrefix}${title.trim()}`;

			onSubmit({
				title: finalTitle,
				date,
				reminderEnabled,
				reminderDelta: reminderEnabled ? reminderDelta : undefined,
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
					value={title}
					onChange={(e) => setTitle(e.target.value)}
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
					value={date}
					onChange={(e) => setDate(e.target.value)}
					className='w-full bg-white/10 border-white/20 text-white'
					required
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
						<Label className='text-sm font-medium text-text-secondary'>
							Remind me before
						</Label>
						<ReminderInput
							value={reminderDelta}
							onValueChange={setReminderDelta}
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
