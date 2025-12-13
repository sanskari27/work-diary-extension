import { RootState } from '@/store/store';
import { nanoid } from 'nanoid';

// Backup file format with unique identifier
export interface BackupData {
	version: string;
	appName: string;
	exportedAt: number;
	exportedBy: string; // Unique identifier for this export
	data: {
		todos?: any;
		bookmarks?: any;
		settings?: any;
		releases?: any;
		content?: any;
	};
}

const BACKUP_VERSION = '1.0.0';
const APP_NAME = 'chrome-homepage';

/**
 * Export all application data to a backup file
 */
export const exportBackup = (state: RootState): string => {
	const backup: BackupData = {
		version: BACKUP_VERSION,
		appName: APP_NAME,
		exportedAt: Date.now(),
		exportedBy: nanoid(), // Unique identifier for this export
		data: {
			todos: state.todos,
			bookmarks: state.bookmarks,
			settings: state.settings,
			releases: state.releases,
			content: state.content,
		},
	};

	return JSON.stringify(backup, null, 2);
};

/**
 * Download backup file
 */
export const downloadBackup = (state: RootState): void => {
	const backupJson = exportBackup(state);
	const blob = new Blob([backupJson], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
	a.href = url;
	a.download = `chrome-homepage-backup-${timestamp}.json`;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
};

/**
 * Parse backup file
 */
export const parseBackup = (fileContent: string): BackupData => {
	try {
		const parsed = JSON.parse(fileContent);

		// Validate backup format
		if (!parsed.version || !parsed.appName || !parsed.data) {
			throw new Error('Invalid backup file format');
		}

		if (parsed.appName !== APP_NAME) {
			throw new Error('This backup file is not for chrome-homepage');
		}

		return parsed as BackupData;
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Failed to parse backup file: ${error.message}`);
		}
		throw new Error('Failed to parse backup file: Unknown error');
	}
};

/**
 * Read backup file from input
 */
export const readBackupFile = (file: File): Promise<BackupData> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const content = e.target?.result as string;
				const backup = parseBackup(content);
				resolve(backup);
			} catch (error) {
				reject(error);
			}
		};
		reader.onerror = () => reject(new Error('Failed to read file'));
		reader.readAsText(file);
	});
};

/**
 * Merge arrays by avoiding duplicates
 * For todos: check by id or title+date combination
 * For bookmarks: check by URL
 * For releases: check by id
 */
const mergeTodos = (existing: any[], imported: any[]): any[] => {
	const merged = [...existing];
	const existingIds = new Set(existing.map((t) => t.id));
	const existingKeys = new Set(
		existing.map((t) => `${t.title}|${t.date}`).map((k) => k.toLowerCase())
	);

	for (const todo of imported) {
		// Skip if ID already exists
		if (todo.id && existingIds.has(todo.id)) {
			continue;
		}
		// Skip if title+date combination already exists
		const key = `${todo.title}|${todo.date}`.toLowerCase();
		if (existingKeys.has(key)) {
			continue;
		}
		// Add new todo with new ID to avoid conflicts
		merged.push({
			...todo,
			id: nanoid(), // Generate new ID to avoid conflicts
		});
	}

	return merged;
};

const mergeBookmarks = (existing: any[], imported: any[]): any[] => {
	const merged = [...existing];
	const existingUrls = new Set(existing.map((b) => b.pageUrl?.toLowerCase() || ''));

	for (const bookmark of imported) {
		const url = bookmark.pageUrl?.toLowerCase() || '';
		if (!existingUrls.has(url) && url) {
			merged.push({
				...bookmark,
				id: nanoid(), // Generate new ID to avoid conflicts
			});
		}
	}

	return merged;
};

const mergeReleaseEvents = (existing: any[], imported: any[]): any[] => {
	const merged = [...existing];
	const existingIds = new Set(existing.map((e) => e.id));

	for (const event of imported) {
		if (event.id && existingIds.has(event.id)) {
			// If ID exists, skip or update? For now, skip to avoid duplicates
			continue;
		}
		// Add new event with new ID
		merged.push({
			...event,
			id: nanoid(), // Generate new ID to avoid conflicts
			items:
				event.items?.map((item: any) => ({
					...item,
					id: nanoid(), // Generate new IDs for items too
				})) || [],
		});
	}

	return merged;
};

const mergeTemplates = (existing: any[], imported: any[]): any[] => {
	const merged = [...existing];
	const existingKeys = new Set(existing.map((t) => `${t.repoName}|${t.repoLink}`.toLowerCase()));

	for (const template of imported) {
		const key = `${template.repoName}|${template.repoLink}`.toLowerCase();
		if (!existingKeys.has(key)) {
			merged.push({
				...template,
				id: nanoid(), // Generate new ID to avoid conflicts
			});
		}
	}

	return merged;
};

const mergeCustomStatuses = (existing: any[], imported: any[]): any[] => {
	const merged = [...existing];
	const existingNames = new Set(existing.map((s) => s.name?.toLowerCase() || ''));

	for (const status of imported) {
		// Only merge non-default statuses to avoid conflicts
		if (!status.isDefault) {
			const name = status.name?.toLowerCase() || '';
			if (!existingNames.has(name)) {
				merged.push({
					...status,
					id: nanoid(), // Generate new ID to avoid conflicts
				});
			}
		}
	}

	return merged;
};

const mergeFeatures = (existing: any[], imported: any[]): any[] => {
	const merged = [...existing];
	const existingIds = new Set(existing.map((f) => f.id));

	for (const feature of imported) {
		if (feature.id && existingIds.has(feature.id)) {
			continue;
		}
		merged.push({
			...feature,
			id: nanoid(), // Generate new ID to avoid conflicts
		});
	}

	return merged;
};

/**
 * Prepare imported data for merging with existing state
 * This function returns the data that should be merged/appended
 */
export const prepareImportData = (
	backup: BackupData,
	currentState: RootState
): {
	todos?: any;
	bookmarks?: any;
	settings?: any;
	releases?: any;
	content?: any;
} => {
	const result: any = {};

	// Merge todos
	if (backup.data.todos?.todos) {
		result.todos = {
			todos: mergeTodos(currentState.todos.todos || [], backup.data.todos.todos || []),
		};
	}

	// Merge bookmarks
	if (backup.data.bookmarks?.bookmarks) {
		result.bookmarks = {
			bookmarks: mergeBookmarks(
				currentState.bookmarks.bookmarks || [],
				backup.data.bookmarks.bookmarks || []
			),
		};
	}

	// Merge settings (templates and custom statuses, but keep preferences)
	if (backup.data.settings) {
		const currentSettings = currentState.settings;
		result.settings = {
			...currentSettings,
			// Merge templates
			templates: mergeTemplates(
				currentSettings.templates || [],
				backup.data.settings.templates || []
			),
			// Merge custom statuses
			customStatuses: mergeCustomStatuses(
				currentSettings.customStatuses || [],
				backup.data.settings.customStatuses || []
			),
			// Keep current reminder preferences and defaults (don't override)
			reminderPreferences: currentSettings.reminderPreferences,
			releaseEventDefaults: currentSettings.releaseEventDefaults,
			appearanceSettings: currentSettings.appearanceSettings,
		};
	}

	// Merge releases
	if (backup.data.releases) {
		const currentReleases = currentState.releases;
		result.releases = {
			...currentReleases,
			// Merge events
			events: mergeReleaseEvents(currentReleases.events || [], backup.data.releases.events || []),
			// Merge templates
			templates: mergeTemplates(
				currentReleases.templates || [],
				backup.data.releases.templates || []
			),
			// Keep default statuses (don't override)
			defaultStatuses: currentReleases.defaultStatuses,
		};
	}

	// Merge content (features, but keep greeting)
	if (backup.data.content?.content) {
		const currentContent = currentState.content;
		result.content = {
			content: {
				...currentContent.content,
				// Merge features
				features: {
					...currentContent.content.features,
					items: mergeFeatures(
						currentContent.content.features.items || [],
						backup.data.content.content.features?.items || []
					),
				},
				// Keep current greeting
				greeting: currentContent.content.greeting,
			},
		};
	}

	return result;
};
