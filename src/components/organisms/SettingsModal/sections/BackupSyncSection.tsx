import { Button } from '@/components/ui/button';
import { AlertCircle, Cloud, Download, Upload } from 'lucide-react';

const BackupSyncSection = () => {
	return (
		<div className='space-y-6'>
			<div>
				<h3 className='text-xl font-semibold text-purple-300 mb-2'>Backup & Sync</h3>
				<p className='text-sm text-slate-400 mb-4'>
					Manage your data backups and synchronization (Coming Soon)
				</p>
			</div>

			<div className='space-y-6'>
				{/* Coming Soon Notice */}
				<div className='glass-strong rounded-xl p-6 border border-yellow-500/30 bg-yellow-500/5'>
					<div className='flex items-start gap-3'>
						<AlertCircle className='w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5' />
						<div className='space-y-2'>
							<h4 className='font-semibold text-yellow-300'>Feature In Development</h4>
							<p className='text-sm text-yellow-200/80'>
								Backup and sync functionality is currently under development. This section will
								include:
							</p>
							<ul className='text-sm text-yellow-200/70 space-y-1 list-disc list-inside ml-4'>
								<li>Export settings and data to JSON</li>
								<li>Import settings from backup files</li>
								<li>Cloud synchronization across devices</li>
								<li>Automatic backup scheduling</li>
								<li>Version history and rollback</li>
							</ul>
						</div>
					</div>
				</div>

				{/* Placeholder UI for Export */}
				<div className='glass-strong rounded-xl p-5 border border-purple-500/20 opacity-50 cursor-not-allowed'>
					<div className='flex items-start gap-3'>
						<Download className='w-5 h-5 text-purple-400 mt-0.5' />
						<div className='flex-1 space-y-3'>
							<div>
								<h4 className='text-purple-200 font-medium'>Export Data</h4>
								<p className='text-sm text-slate-400 mt-1'>
									Download all your settings, templates, and release data
								</p>
							</div>
							<Button disabled className='bg-purple-600/20 border border-purple-500/30'>
								<Download className='w-4 h-4 mr-2' />
								Export to JSON
							</Button>
						</div>
					</div>
				</div>

				{/* Placeholder UI for Import */}
				<div className='glass-strong rounded-xl p-5 border border-purple-500/20 opacity-50 cursor-not-allowed'>
					<div className='flex items-start gap-3'>
						<Upload className='w-5 h-5 text-purple-400 mt-0.5' />
						<div className='flex-1 space-y-3'>
							<div>
								<h4 className='text-purple-200 font-medium'>Import Data</h4>
								<p className='text-sm text-slate-400 mt-1'>
									Restore settings and data from a backup file
								</p>
							</div>
							<Button disabled className='bg-purple-600/20 border border-purple-500/30'>
								<Upload className='w-4 h-4 mr-2' />
								Import from JSON
							</Button>
						</div>
					</div>
				</div>

				{/* Placeholder UI for Cloud Sync */}
				<div className='glass-strong rounded-xl p-5 border border-purple-500/20 opacity-50 cursor-not-allowed'>
					<div className='flex items-start gap-3'>
						<Cloud className='w-5 h-5 text-purple-400 mt-0.5' />
						<div className='flex-1 space-y-3'>
							<div>
								<h4 className='text-purple-200 font-medium'>Cloud Sync</h4>
								<p className='text-sm text-slate-400 mt-1'>
									Automatically sync your data across multiple devices
								</p>
							</div>
							<div className='space-y-2'>
								<div className='flex items-center gap-2 text-sm text-slate-400'>
									<div className='w-2 h-2 rounded-full bg-slate-600'></div>
									<span>Not connected</span>
								</div>
								<Button disabled className='bg-purple-600/20 border border-purple-500/30'>
									<Cloud className='w-4 h-4 mr-2' />
									Connect to Cloud
								</Button>
							</div>
						</div>
					</div>
				</div>

				{/* Info Box */}
				<div className='glass-strong rounded-xl p-4 border border-blue-500/30 bg-blue-500/5'>
					<p className='text-sm text-blue-300'>
						<strong>Stay Tuned:</strong> We're working hard to bring you robust backup and sync
						features. In the meantime, your data is safely stored locally in your browser's
						IndexedDB.
					</p>
				</div>
			</div>
		</div>
	);
};

export default BackupSyncSection;
