import { Button } from '@/components/ui/button';
import { downloadBackup, prepareImportData, readBackupFile } from '@/services/BackupService';
import { useAppDispatch, useAppSelector } from '@/store';
import { setBookmarks } from '@/store/slices/bookmarksSlice';
import { setContent } from '@/store/slices/contentSlice';
import { setReleases } from '@/store/slices/releasesSlice';
import { setSettings } from '@/store/slices/settingsSlice';
import { setTodos } from '@/store/slices/todosSlice';
import { AlertCircle, CheckCircle, Cloud, Download, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

const BackupSyncSection = () => {
	const dispatch = useAppDispatch();
	const state = useAppSelector((state) => state);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [importStatus, setImportStatus] = useState<{
		type: 'success' | 'error' | null;
		message: string;
	}>({ type: null, message: '' });

	const handleExport = () => {
		try {
			downloadBackup(state);
			setImportStatus({
				type: 'success',
				message: 'Backup exported successfully!',
			});
			setTimeout(() => setImportStatus({ type: null, message: '' }), 3000);
		} catch (error) {
			setImportStatus({
				type: 'error',
				message: 'Failed to export backup. Please try again.',
			});
			setTimeout(() => setImportStatus({ type: null, message: '' }), 5000);
		}
	};

	const handleImportClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		try {
			setImportStatus({ type: null, message: 'Importing backup...' });

			// Read and parse backup file
			const backup = await readBackupFile(file);

			// Prepare import data (merges with existing data)
			const importData = prepareImportData(backup, state);

			// Dispatch actions to update state
			if (importData.todos) {
				dispatch(setTodos(importData.todos.todos));
			}
			if (importData.bookmarks) {
				dispatch(setBookmarks(importData.bookmarks.bookmarks));
			}
			if (importData.settings) {
				dispatch(setSettings(importData.settings));
			}
			if (importData.releases) {
				dispatch(setReleases(importData.releases));
			}
			if (importData.content) {
				dispatch(setContent(importData.content.content));
			}

			setImportStatus({
				type: 'success',
				message: 'Backup imported successfully! Data has been merged with existing data.',
			});
			setTimeout(() => setImportStatus({ type: null, message: '' }), 5000);

			// Reset file input
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
		} catch (error) {
			console.error('Import error:', error);
			setImportStatus({
				type: 'error',
				message:
					error instanceof Error
						? `Failed to import backup: ${error.message}`
						: 'Failed to import backup. Please check the file format.',
			});
			setTimeout(() => setImportStatus({ type: null, message: '' }), 5000);

			// Reset file input
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
		}
	};

	return (
		<div className='space-y-6'>
			<div>
				<h3 className='text-xl font-semibold text-purple-300 mb-2'>Backup & Sync</h3>
				<p className='text-sm text-slate-400 mb-4'>
					Export your data for backup or restore from a previous backup
				</p>
			</div>

			<div className='space-y-6'>
				{/* Export Section */}
				<div className='glass rounded-xl p-5 border border-purple-500/20'>
					<div className='flex items-start gap-3'>
						<Download className='w-5 h-5 text-purple-400 mt-0.5' />
						<div className='flex-1 space-y-3'>
							<div>
								<h4 className='text-purple-200 font-medium'>Export Data</h4>
								<p className='text-sm text-slate-400 mt-1'>
									Download all your settings, todos, bookmarks, releases, and content as a backup
									file
								</p>
							</div>
							<Button
								onClick={handleExport}
								className='bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30'
							>
								<Download className='w-4 h-4 mr-2' />
								Export to JSON
							</Button>
						</div>
					</div>
				</div>

				{/* Import Section */}
				<div className='glass rounded-xl p-5 border border-purple-500/20'>
					<div className='flex items-start gap-3'>
						<Upload className='w-5 h-5 text-purple-400 mt-0.5' />
						<div className='flex-1 space-y-3'>
							<div>
								<h4 className='text-purple-200 font-medium'>Import Data</h4>
								<p className='text-sm text-slate-400 mt-1'>
									Restore data from a backup file. Existing data will be merged with imported data
									(no data will be removed).
								</p>
							</div>
							<input
								ref={fileInputRef}
								type='file'
								accept='.json'
								onChange={handleFileChange}
								className='hidden'
							/>
							<Button
								onClick={handleImportClick}
								className='bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30'
							>
								<Upload className='w-4 h-4 mr-2' />
								Import from JSON
							</Button>
						</div>
					</div>
				</div>

				{/* Status Messages */}
				{importStatus.type && (
					<div
						className={`glass-strong rounded-xl p-4 border ${
							importStatus.type === 'success'
								? 'border-green-500/30 bg-green-500/5'
								: 'border-red-500/30 bg-red-500/5'
						}`}
					>
						<div className='flex items-start gap-3'>
							{importStatus.type === 'success' ? (
								<CheckCircle className='w-5 h-5 text-green-400 flex-shrink-0 mt-0.5' />
							) : (
								<AlertCircle className='w-5 h-5 text-red-400 flex-shrink-0 mt-0.5' />
							)}
							<p
								className={`text-sm ${
									importStatus.type === 'success' ? 'text-green-300' : 'text-red-300'
								}`}
							>
								{importStatus.message}
							</p>
						</div>
					</div>
				)}

				{/* Placeholder UI for Cloud Sync */}
				<div className='glass rounded-xl p-5 border border-purple-500/20 opacity-50 cursor-not-allowed'>
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
									<span>Coming soon</span>
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
						<strong>Note:</strong> Export creates a unique backup file with version information.
						Import will merge data with your existing data, so no information will be lost. Your
						data is also safely stored locally in your browser's IndexedDB.
					</p>
				</div>
			</div>
		</div>
	);
};

export default BackupSyncSection;
