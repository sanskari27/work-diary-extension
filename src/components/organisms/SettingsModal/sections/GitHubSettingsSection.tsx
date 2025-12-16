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
import { updateGitHubSettings } from '@/store/slices/settingsSlice';
import { Github } from 'lucide-react';

const GitHubSettingsSection = () => {
	const dispatch = useAppDispatch();
	const githubSettings = useAppSelector((state) => state.settings.githubSettings);

	const handleUpdate = (updates: Partial<typeof githubSettings>) => {
		dispatch(updateGitHubSettings(updates));
	};

	return (
		<div className='space-y-6'>
			<div>
				<h3 className='text-xl font-semibold text-text-primary mb-2'>GitHub Integration</h3>
				<p className='text-sm text-text-secondary mb-4'>
					Configure GitHub credentials and PR tracker refresh & notification preferences.
				</p>
			</div>

			<div className='space-y-6'>
				{/* GitHub Credentials */}
				<div className='glass rounded-xl p-5 border border-glass-border space-y-4'>
					<div className='flex items-start gap-3'>
						<Github className='w-5 h-5 text-text-accent mt-0.5' />
						<div className='flex-1 space-y-3'>
							<div>
								<Label className='text-text-primary font-medium'>GitHub Username</Label>
								<p className='text-sm text-text-secondary mt-1'>
									Used to fetch pull requests authored by you across your repositories.
								</p>
							</div>
							<Input
								value={githubSettings.username}
								onChange={(e) => handleUpdate({ username: e.target.value })}
								placeholder='your-github-username'
								className='bg-slate-800/50 border-glass-border text-white'
							/>
						</div>
					</div>

					<div className='space-y-2'>
						<Label className='text-text-primary font-medium'>Personal Access Token</Label>
						<p className='text-sm text-text-secondary'>
							Provide a read-only GitHub Personal Access Token with{' '}
							<span className='font-semibold'>`repo`</span> and{' '}
							<span className='font-semibold'>`read:org`</span> scopes to fetch your pull requests.
							This token is stored locally in your browser.
						</p>
						<Input
							type='password'
							value={githubSettings.personalAccessToken}
							onChange={(e) => handleUpdate({ personalAccessToken: e.target.value })}
							placeholder='ghp_************************************'
							className='bg-slate-800/50 border-glass-border text-white'
						/>
					</div>
				</div>

				{/* Refresh Interval */}
				<div className='glass rounded-xl p-5 border border-glass-border flex items-center justify-between gap-4'>
					<div className='flex-1'>
						<Label className='text-text-primary font-medium'>PR Refresh Interval</Label>
						<p className='text-sm text-text-secondary mt-1'>
							How often the Active PR Tracker should auto-refresh pull requests.
						</p>
					</div>
					<Select
						value={String(githubSettings.prRefreshIntervalMinutes)}
						onValueChange={(value) =>
							handleUpdate({ prRefreshIntervalMinutes: Number(value) || 10 })
						}
					>
						<SelectTrigger className='w-48 bg-slate-800/50 border-glass-border text-white'>
							<SelectValue placeholder='Interval' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='1'>Every 1 minute</SelectItem>
							<SelectItem value='5'>Every 5 minutes</SelectItem>
							<SelectItem value='10'>Every 10 minutes</SelectItem>
							<SelectItem value='15'>Every 15 minutes</SelectItem>
							<SelectItem value='30'>Every 30 minutes</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* Notification Preferences */}
				<div className='glass rounded-xl p-5 border border-glass-border space-y-4'>
					<div>
						<Label className='text-text-primary font-medium'>PR Notifications</Label>
						<p className='text-sm text-text-secondary mt-1'>
							Choose which pull request events should trigger a notification. Each PR only notifies
							once per stage.
						</p>
					</div>

					<div className='space-y-3'>
						<div className='flex items-center justify-between gap-4'>
							<div>
								<p className='text-sm font-medium text-text-primary'>On Approval</p>
								<p className='text-xs text-text-secondary'>
									Notify when a pull request is approved.
								</p>
							</div>
							<Switch
								checked={githubSettings.notifyOnApproval}
								onCheckedChange={(checked) => handleUpdate({ notifyOnApproval: checked })}
							/>
						</div>

						<div className='flex items-center justify-between gap-4'>
							<div>
								<p className='text-sm font-medium text-text-primary'>On Merge</p>
								<p className='text-xs text-text-secondary'>Notify when a pull request is merged.</p>
							</div>
							<Switch
								checked={githubSettings.notifyOnMerge}
								onCheckedChange={(checked) => handleUpdate({ notifyOnMerge: checked })}
							/>
						</div>

						<div className='flex items-center justify-between gap-4'>
							<div>
								<p className='text-sm font-medium text-text-primary'>On Changes Requested</p>
								<p className='text-xs text-text-secondary'>
									Notify when reviewers request changes on your pull request.
								</p>
							</div>
							<Switch
								checked={githubSettings.notifyOnChangesRequested}
								onCheckedChange={(checked) => handleUpdate({ notifyOnChangesRequested: checked })}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default GitHubSettingsSection;
