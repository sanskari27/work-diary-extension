import { Button } from '@/components/ui/button';
import { downloadBackup, prepareImportData, readBackupFile } from '@/services/BackupService';
import { useAppDispatch, useAppSelector } from '@/store';
import { addBookmark, setBookmarks } from '@/store/slices/bookmarksSlice';
import { setContent } from '@/store/slices/contentSlice';
import { setReleases } from '@/store/slices/releasesSlice';
import { setSettings } from '@/store/slices/settingsSlice';
import { setTodos } from '@/store/slices/todosSlice';
import { AlertCircle, Bookmark, CheckCircle, Cloud, Download, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

const BackupSyncSection = () => {
	const dispatch = useAppDispatch();
	const state = useAppSelector((state) => state);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [importStatus, setImportStatus] = useState<{
		type: 'success' | 'error' | null;
		message: string;
	}>({ type: null, message: '' });
	const [isImportingBrowserBookmarks, setIsImportingBrowserBookmarks] = useState(false);

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

	const handleImportBrowserBookmarks = () => {
		if (isImportingBrowserBookmarks) return;

		// Ensure we can talk to the background script
		if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
			setImportStatus({
				type: 'error',
				message:
					'Browser extension APIs are not available. Make sure you are running this as a Chrome extension.',
			});
			setTimeout(() => setImportStatus({ type: null, message: '' }), 5000);
			return;
		}

		setIsImportingBrowserBookmarks(true);
		setImportStatus({ type: null, message: 'Importing bookmarks from browser...' });

		chrome.runtime.sendMessage(
			{ type: 'IMPORT_BROWSER_BOOKMARKS' },
			(response: {
				success: boolean;
				error?: string;
				bookmarks?: { title: string; url: string }[];
			}) => {
				try {
					if (chrome.runtime.lastError) {
						throw new Error(
							chrome.runtime.lastError.message || 'Failed to communicate with background script.'
						);
					}

					if (!response || !response.success) {
						throw new Error(
							response?.error ||
								'Failed to import browser bookmarks. Background script returned an error.'
						);
					}

					const collected = response.bookmarks || [];

					if (collected.length === 0) {
						setImportStatus({
							type: 'success',
							message: 'No browser bookmarks were found to import.',
						});
						setTimeout(() => setImportStatus({ type: null, message: '' }), 5000);
						return;
					}

					const existing = state.bookmarks.bookmarks || [];
					const existingUrls = new Set(existing.map((b) => b.pageUrl.toLowerCase()));

					let importedCount = 0;

					for (const { title, url } of collected) {
						const lowerUrl = url.toLowerCase();
						if (!existingUrls.has(lowerUrl)) {
							existingUrls.add(lowerUrl);
							dispatch(
								addBookmark({
									name: title || url,
									pageUrl: url,
								})
							);
							importedCount += 1;
						}
					}

					if (importedCount === 0) {
						setImportStatus({
							type: 'success',
							message: 'All browser bookmarks are already imported. No new bookmarks were added.',
						});
					} else {
						setImportStatus({
							type: 'success',
							message: `Imported ${importedCount} browser bookmark${
								importedCount === 1 ? '' : 's'
							} successfully.`,
						});
					}

					setTimeout(() => setImportStatus({ type: null, message: '' }), 5000);
				} catch (error) {
					console.error('Browser bookmarks import error:', error);
					setImportStatus({
						type: 'error',
						message:
							error instanceof Error
								? `Failed to import browser bookmarks: ${error.message}`
								: 'Failed to import browser bookmarks.',
					});
					setTimeout(() => setImportStatus({ type: null, message: '' }), 5000);
				} finally {
					setIsImportingBrowserBookmarks(false);
				}
			}
		);
	};

	return (
		<div className='space-y-6'>
			<div>
				<h3 className='text-xl font-semibold text-text-primary mb-2'>Backup & Sync</h3>
				<p className='text-sm text-text-secondary mb-4'>
					Export your data for backup or restore from a previous backup
				</p>
			</div>

			<div className='space-y-6'>
				{/* Export Section */}
				<div className='glass rounded-xl p-5 border border-glass-border'>
					<div className='flex items-start gap-3'>
						<Download className='w-5 h-5 text-text-accent mt-0.5' />
						<div className='flex-1 space-y-3'>
							<div>
								<h4 className='text-text-primary font-medium'>Export Data</h4>
								<p className='text-sm text-text-secondary mt-1'>
									Download all your settings, todos, bookmarks, releases, and content as a backup
									file
								</p>
							</div>
							<Button onClick={handleExport} variant='gradient'>
								<Download className='w-4 h-4 mr-2' />
								Export to JSON
							</Button>
						</div>
					</div>
				</div>

				{/* Import Section */}
				<div className='glass rounded-xl p-5 border border-glass-border'>
					<div className='flex items-start gap-3'>
						<Upload className='w-5 h-5 text-text-accent mt-0.5' />
						<div className='flex-1 space-y-3'>
							<div>
								<h4 className='text-text-primary font-medium'>Import Data</h4>
								<p className='text-sm text-text-secondary mt-1'>
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
							<Button onClick={handleImportClick} variant='gradient'>
								<Upload className='w-4 h-4 mr-2' />
								Import from JSON
							</Button>
						</div>
					</div>
				</div>

				{/* Import Browser Bookmarks Section */}
				<div className='glass rounded-xl p-5 border border-glass-border'>
					<div className='flex items-start gap-3'>
						<Bookmark className='w-5 h-5 text-text-accent mt-0.5' />
						<div className='flex-1 space-y-3'>
							<div>
								<h4 className='text-text-primary font-medium'>Import Browser Bookmarks</h4>
								<p className='text-sm text-text-secondary mt-1'>
									Import your existing browser bookmarks directly into Work Diary. We&apos;ll skip
									any bookmarks you already have.
								</p>
							</div>
							<Button
								onClick={handleImportBrowserBookmarks}
								variant='gradient'
								disabled={isImportingBrowserBookmarks}
							>
								{isImportingBrowserBookmarks ? (
									<span>Importing...</span>
								) : (
									<>
										<Bookmark className='w-4 h-4 mr-2' />
										Import from browser
									</>
								)}
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
				<div className='glass rounded-xl p-5 border border-glass-border opacity-50 cursor-not-allowed'>
					<div className='flex items-start gap-3'>
						<Cloud className='w-5 h-5 text-text-accent mt-0.5' />
						<div className='flex-1 space-y-3'>
							<div>
								<h4 className='text-text-primary font-medium'>Cloud Sync</h4>
								<p className='text-sm text-text-secondary mt-1'>
									Automatically sync your data across multiple devices
								</p>
							</div>
							<div className='space-y-2'>
								<div className='flex items-center gap-2 text-sm text-text-secondary'>
									<div className='w-2 h-2 rounded-full bg-slate-600'></div>
									<span>Coming soon</span>
								</div>
								<Button disabled className='bg-primary/20 border border-glass-border'>
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
