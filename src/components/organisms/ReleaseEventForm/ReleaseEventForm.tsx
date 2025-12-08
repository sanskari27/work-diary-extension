import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { useAppSelector } from '@/store/hooks';
import { motion } from 'framer-motion';
import { Bell, BellOff, Calendar } from 'lucide-react';
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
				<Label className='text-sm font-medium text-white/80 flex items-center gap-2'>
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
				<Label className='text-sm font-medium text-white/80 flex items-center gap-2'>
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
				<Button
					type='button'
					onClick={() => setReminderEnabled(!reminderEnabled)}
					variant='ghost'
					className='w-full flex items-center justify-between p-4 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15'
				>
					<span className='text-sm font-medium text-white/80 flex items-center gap-2'>
						{reminderEnabled ? (
							<Bell className='w-4 h-4 text-purple-400' />
						) : (
							<BellOff className='w-4 h-4 text-white/40' />
						)}
						Enable Reminder
					</span>
					<div
						className={`w-12 h-6 rounded-full transition-all ${
							reminderEnabled ? 'bg-purple-500' : 'bg-white/20'
						}`}
					>
						<motion.div
							className='w-5 h-5 bg-white rounded-full shadow-lg'
							animate={{ x: reminderEnabled ? 26 : 2, y: 2 }}
							transition={{ type: 'spring', stiffness: 500, damping: 30 }}
						/>
					</div>
				</Button>

				{/* Reminder Delta */}
				{reminderEnabled && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 'auto' }}
						exit={{ opacity: 0, height: 0 }}
						className='space-y-2'
					>
						<Label className='text-sm font-medium text-white/80'>Remind me before</Label>
						<Select value={reminderDelta} onValueChange={setReminderDelta}>
							<SelectTrigger className='w-full bg-white/10 border-white/20 text-white'>
								<SelectValue placeholder='Select days' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='1d'>1 day before</SelectItem>
								<SelectItem value='2d'>2 days before</SelectItem>
								<SelectItem value='3d'>3 days before</SelectItem>
								<SelectItem value='4d'>4 days before</SelectItem>
								<SelectItem value='5d'>5 days before</SelectItem>
								<SelectItem value='6d'>6 days before</SelectItem>
								<SelectItem value='7d'>7 days before</SelectItem>
							</SelectContent>
						</Select>
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
				<Button
					type='submit'
					className='flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/30'
				>
					Create Release
				</Button>
			</div>
		</form>
	);
};

export default ReleaseEventForm;
