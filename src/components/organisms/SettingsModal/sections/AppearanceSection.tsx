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
import { updateAppearanceSettings } from '@/store/slices/settingsSlice';
import { Eye, Layout, Maximize2, Palette, User } from 'lucide-react';

const AppearanceSection = () => {
	const dispatch = useAppDispatch();
	const appearance = useAppSelector((state) => state.settings.appearanceSettings);

	const handleUpdate = (updates: any) => {
		dispatch(updateAppearanceSettings(updates));
	};

	return (
		<div className='space-y-6'>
			<div>
				<h3 className='text-xl font-semibold text-purple-300 mb-2'>Appearance & Behavior</h3>
				<p className='text-sm text-slate-400 mb-4'>Customize the look and feel of your workspace</p>
			</div>

			<div className='space-y-6'>
				{/* Theme Selection */}
				<div className='glass rounded-xl p-5 border border-purple-500/20'>
					<div className='flex items-start gap-3'>
						<Palette className='w-5 h-5 text-purple-400 mt-0.5' />
						<div className='flex-1 space-y-3'>
							<div>
								<Label className='text-purple-200 font-medium'>Theme</Label>
								<p className='text-sm text-slate-400 mt-1'>Choose your preferred color theme</p>
							</div>
							<Select
								disabled
								value={appearance.theme}
								onValueChange={(value: any) => handleUpdate({ theme: value })}
							>
								<SelectTrigger className='bg-slate-800/50 border-purple-500/30 text-white w-full'>
									<SelectValue />
								</SelectTrigger>
								<SelectContent className='bg-slate-800 border-purple-500/30 text-white'>
									<SelectItem value='light'>Light</SelectItem>
									<SelectItem value='dark'>Dark</SelectItem>
									<SelectItem value='system'>System</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</div>

				{/* Greeting Name */}
				<div className='glass rounded-xl p-5 border border-purple-500/20'>
					<div className='flex items-start gap-3'>
						<User className='w-5 h-5 text-purple-400 mt-0.5' />
						<div className='flex-1 space-y-3'>
							<div>
								<Label htmlFor='greetingName' className='text-purple-200 font-medium'>
									Greeting Name
								</Label>
								<p className='text-sm text-slate-400 mt-1'>
									Personalize the name shown in the homepage greeting
								</p>
							</div>
							<Input
								id='greetingName'
								value={appearance.greetingName ?? ''}
								onChange={(e) => handleUpdate({ greetingName: e.target.value })}
								className='bg-slate-800/50 border-purple-500/30 text-white'
								placeholder='Enter your name'
							/>
						</div>
					</div>
				</div>

				{/* Compact Mode */}
				<div className='glass rounded-xl p-5 border border-purple-500/20'>
					<div className='flex items-center justify-between'>
						<div className='flex-1 flex items-start gap-3'>
							<Layout className='w-5 h-5 text-purple-400 mt-0.5' />
							<div>
								<Label className='text-purple-200 font-medium'>Compact Mode</Label>
								<p className='text-sm text-slate-400 mt-1'>
									Reduce spacing and padding for a denser layout
								</p>
							</div>
						</div>
						<Switch
							checked={appearance.compactMode}
							onCheckedChange={(checked) => handleUpdate({ compactMode: checked })}
						/>
					</div>
				</div>

				{/* Card Size */}
				<div className='glass rounded-xl p-5 border border-purple-500/20'>
					<div className='flex items-start gap-3'>
						<Maximize2 className='w-5 h-5 text-purple-400 mt-0.5' />
						<div className='flex-1 space-y-3'>
							<div>
								<Label className='text-purple-200 font-medium'>Card Size</Label>
								<p className='text-sm text-slate-400 mt-1'>Size of release item cards</p>
							</div>
							<Select
								value={appearance.cardSize}
								onValueChange={(value: any) => handleUpdate({ cardSize: value })}
							>
								<SelectTrigger className='bg-slate-800/50 border-purple-500/30 text-white w-full'>
									<SelectValue />
								</SelectTrigger>
								<SelectContent className='bg-slate-800 border-purple-500/30 text-white'>
									<SelectItem value='small'>Small</SelectItem>
									<SelectItem value='medium'>Medium</SelectItem>
									<SelectItem value='large'>Large</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</div>

				{/* Visibility Toggles */}
				<div className='glass rounded-xl p-5 border border-purple-500/20 space-y-4'>
					<div className='flex items-center gap-2 mb-3'>
						<Eye className='w-5 h-5 text-purple-400' />
						<Label className='text-purple-200 font-medium'>Show/Hide Elements</Label>
					</div>

					<div className='space-y-3 pl-7'>
						<div className='flex items-center justify-between py-2'>
							<div>
								<Label className='text-slate-300'>Status Checkboxes</Label>
								<p className='text-xs text-slate-500'>Show status checkboxes on release items</p>
							</div>
							<Switch
								checked={appearance.showStatusCheckboxes}
								onCheckedChange={(checked) => handleUpdate({ showStatusCheckboxes: checked })}
							/>
						</div>

						<div className='flex items-center justify-between py-2'>
							<div>
								<Label className='text-slate-300'>Lead Section</Label>
								<p className='text-xs text-slate-500'>Display lead name in release items</p>
							</div>
							<Switch
								checked={appearance.showLeadSection}
								onCheckedChange={(checked) => handleUpdate({ showLeadSection: checked })}
							/>
						</div>

						<div className='flex items-center justify-between py-2'>
							<div>
								<Label className='text-slate-300'>Description Section</Label>
								<p className='text-xs text-slate-500'>Show description field in release items</p>
							</div>
							<Switch
								checked={appearance.showDescriptionSection}
								onCheckedChange={(checked) => handleUpdate({ showDescriptionSection: checked })}
							/>
						</div>

						<div className='flex items-center justify-between py-2'>
							<div>
								<Label className='text-slate-300'>PR Link Field</Label>
								<p className='text-xs text-slate-500'>Display PR link field in release items</p>
							</div>
							<Switch
								checked={appearance.showPRLinkField}
								onCheckedChange={(checked) => handleUpdate({ showPRLinkField: checked })}
							/>
						</div>
					</div>
				</div>

				{/* Minimal Mode */}
				<div className='glass rounded-xl p-5 border border-purple-500/20'>
					<div className='flex items-center justify-between'>
						<div className='flex-1'>
							<Label className='text-purple-200 font-medium'>Minimal Mode for Homepage</Label>
							<p className='text-sm text-slate-400 mt-1'>
								Show only essential information on the homepage view
							</p>
						</div>
						<Switch
							checked={appearance.minimalMode}
							onCheckedChange={(checked) => handleUpdate({ minimalMode: checked })}
						/>
					</div>
				</div>

				{/* Info Box */}
				<div className='glass-strong rounded-xl p-4 border border-blue-500/30 bg-blue-500/5'>
					<p className='text-sm text-blue-300'>
						<strong>Tip:</strong> Changes to appearance settings will be applied immediately.
						Experiment to find what works best for you!
					</p>
				</div>
			</div>
		</div>
	);
};

export default AppearanceSection;
