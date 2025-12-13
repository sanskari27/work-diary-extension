import { ReminderInput } from '@/components/atoms';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateReminderPreferences } from '@/store/slices/settingsSlice';
import { Clock } from 'lucide-react';

const ReminderPreferencesSection = () => {
	const dispatch = useAppDispatch();
	const preferences = useAppSelector((state) => state.settings.reminderPreferences);

	const handleUpdate = (updates: any) => {
		dispatch(updateReminderPreferences(updates));
	};

	return (
		<div className='space-y-6'>
			<div>
				<h3 className='text-xl font-semibold text-purple-300 mb-2'>Reminder Preferences</h3>
				<p className='text-sm text-slate-400 mb-4'>
					Configure global reminder and notification settings
				</p>
			</div>

			<div className='space-y-6'>
				{/* Default Reminder Delta */}
				<div className='glass-strong rounded-xl p-5 border border-purple-500/20'>
					<div className='flex items-start gap-3'>
						<Clock className='w-5 h-5 text-purple-400 mt-0.5' />
						<div className='flex-1 space-y-3'>
							<div>
								<Label className='text-purple-200 font-medium'>Default Reminder Time</Label>
								<p className='text-sm text-slate-400 mt-1'>
									How far in advance should reminders be triggered?
								</p>
							</div>
							<ReminderInput
								value={preferences.defaultReminderDelta}
								onValueChange={(value) => handleUpdate({ defaultReminderDelta: value })}
								className='bg-slate-800/50 border-purple-500/30 text-white w-full'
							/>
						</div>
					</div>
				</div>

				{/* Default Reminder Enabled */}
				<div className='glass-strong rounded-xl p-5 border border-purple-500/20'>
					<div className='flex items-center justify-between'>
						<div className='flex-1'>
							<Label className='text-purple-200 font-medium'>Enable Reminders by Default</Label>
							<p className='text-sm text-slate-400 mt-1'>
								Automatically enable reminders for new release events
							</p>
						</div>
						<Switch
							checked={preferences.defaultReminderEnabled}
							onCheckedChange={(checked) => handleUpdate({ defaultReminderEnabled: checked })}
						/>
					</div>
				</div>

				{/* Info Box */}
				<div className='glass-strong rounded-xl p-4 border border-blue-500/30 bg-blue-500/5'>
					<p className='text-sm text-blue-300'>
						<strong>Tip:</strong> Reminders will be displayed in-app when the release date
						approaches based on your configured delta time.
					</p>
				</div>
			</div>
		</div>
	);
};

export default ReminderPreferencesSection;
