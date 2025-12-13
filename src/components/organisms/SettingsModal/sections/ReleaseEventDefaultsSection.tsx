import { ReminderInput } from '@/components/atoms';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateReleaseEventDefaults } from '@/store/slices/settingsSlice';
import { Calendar, Clock, SortAsc } from 'lucide-react';

const ReleaseEventDefaultsSection = () => {
	const dispatch = useAppDispatch();
	const defaults = useAppSelector((state) => state.settings.releaseEventDefaults);

	const handleUpdate = (updates: any) => {
		dispatch(updateReleaseEventDefaults(updates));
	};

	return (
		<div className='space-y-6'>
			<div>
				<h3 className='text-xl font-semibold text-text-primary mb-2'>
					Release Event Defaults
				</h3>
				<p className='text-sm text-text-secondary mb-4'>
					Set default values for new release events
				</p>
			</div>

			<div className='space-y-6'>
				{/* Title Prefix */}
				<div className='glass rounded-xl p-5 border border-glass-border'>
					<div className='flex items-start gap-3'>
						<Calendar className='w-5 h-5 text-text-accent mt-0.5' />
						<div className='flex-1 space-y-3'>
							<div>
								<Label htmlFor='titlePrefix' className='text-text-primary font-medium'>
									Default Title Prefix
								</Label>
								<p className='text-sm text-text-secondary mt-1'>
									Automatically prepend this text to new release event titles
								</p>
							</div>
							<Input
								id='titlePrefix'
								value={defaults.titlePrefix}
								onChange={(e) => handleUpdate({ titlePrefix: e.target.value })}
								className='bg-slate-800/50 border-glass-border text-white'
								placeholder='e.g., Sprint Release - '
							/>
						</div>
					</div>
				</div>

				{/* Default Reminder Enabled */}
				<div className='glass rounded-xl p-5 border border-glass-border'>
					<div className='flex items-center justify-between'>
						<div className='flex-1'>
							<Label className='text-text-primary font-medium'>
								Enable Reminders by Default
							</Label>
							<p className='text-sm text-text-secondary mt-1'>
								New release events will have reminders enabled
							</p>
						</div>
						<Switch
							checked={defaults.defaultReminderEnabled}
							onCheckedChange={(checked) => handleUpdate({ defaultReminderEnabled: checked })}
						/>
					</div>
				</div>

				{/* Default Delta Time */}
				<div className='glass rounded-xl p-5 border border-glass-border'>
					<div className='flex items-start gap-3'>
						<Clock className='w-5 h-5 text-text-accent mt-0.5' />
						<div className='flex-1 space-y-3'>
							<div>
								<Label className='text-text-primary font-medium'>
									Default Reminder Delta
								</Label>
								<p className='text-sm text-text-secondary mt-1'>
									How far in advance should release event reminders trigger?
								</p>
							</div>
							<ReminderInput
								value={defaults.defaultDelta}
								onValueChange={(value) => handleUpdate({ defaultDelta: value })}
								className='bg-slate-800/50 border-glass-border text-white w-full'
							/>
						</div>
					</div>
				</div>

				{/* Default Sorting */}
				<div className='glass rounded-xl p-5 border border-glass-border'>
					<div className='flex items-start gap-3'>
						<SortAsc className='w-5 h-5 text-text-accent mt-0.5' />
						<div className='flex-1 space-y-3'>
							<div>
								<Label className='text-text-primary font-medium'>
									Default Element Sorting
								</Label>
								<p className='text-sm text-text-secondary mt-1'>
									How should release items be sorted by default?
								</p>
							</div>
							<Select
								value={defaults.defaultSorting}
								onValueChange={(value: any) => handleUpdate({ defaultSorting: value })}
							>
								<SelectTrigger className='bg-slate-800/50 border-glass-border text-white w-full'>
									<SelectValue />
								</SelectTrigger>
								<SelectContent className='bg-slate-800 border-glass-border text-white'>
									<SelectItem value='a-z'>Alphabetical (A-Z)</SelectItem>
									<SelectItem value='newest-first'>Newest First</SelectItem>
									<SelectItem value='status-based'>Status-Based</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</div>

				{/* Info Box */}
				<div className='glass-strong rounded-xl p-4 border border-glass-border-strong bg-accent/5'>
					<p className='text-sm text-text-accent'>
						<strong>Note:</strong> These settings only apply to newly created release events.
						Existing events will retain their current settings.
					</p>
				</div>
			</div>
		</div>
	);
};

export default ReleaseEventDefaultsSection;
