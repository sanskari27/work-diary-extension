/// <reference types="vite/client" />

// Chrome Extension API types
declare global {
	interface ChromeBookmarkTreeNode {
		id: string;
		parentId?: string;
		title: string;
		url?: string;
		children?: ChromeBookmarkTreeNode[];
		dateAdded?: number;
	}

	interface ChromeTabsTab {
		id?: number;
		index?: number;
		windowId?: number;
		openerTabId?: number;
		highlighted?: boolean;
		active?: boolean;
		pinned?: boolean;
		audible?: boolean;
		discarded?: boolean;
		autoDiscardable?: boolean;
		mutedInfo?: { muted: boolean; reason?: string; extensionId?: string };
		url?: string;
		pendingUrl?: string;
		title?: string;
		favIconUrl?: string;
		status?: string;
		incognito?: boolean;
		width?: number;
		height?: number;
		sessionId?: string;
	}

	interface ChromeNotificationsOptions {
		type: 'basic' | 'image' | 'list' | 'progress';
		iconUrl?: string;
		title?: string;
		message?: string;
		priority?: number;
	}

	interface ChromeAlarm {
		name: string;
		scheduledTime: number;
		periodInMinutes?: number;
	}

	interface ChromeAlarmCreateInfo {
		when?: number;
		delayInMinutes?: number;
		periodInMinutes?: number;
	}

	interface ChromeStorageArea {
		get(
			keys: string | string[] | { [key: string]: any } | null,
			callback: (items: { [key: string]: any }) => void
		): void;
		set(items: { [key: string]: any }, callback?: () => void): void;
		remove(keys: string | string[], callback?: () => void): void;
		clear(callback?: () => void): void;
	}

	interface ChromeRuntimeError {
		message?: string;
	}

	interface ChromeMessageSender {
		tab?: ChromeTabsTab;
		frameId?: number;
	}

	interface ChromeEvent<T extends (...args: any[]) => any> {
		addListener(callback: T): void;
		removeListener(callback: T): void;
		hasListener(callback: T): boolean;
	}

	interface ChromeAlarmEvent extends ChromeEvent<(alarm: ChromeAlarm) => void> {}

	interface ChromeMessageEvent
		extends ChromeEvent<
			(
				message: any,
				sender: ChromeMessageSender,
				sendResponse: (response?: any) => void
			) => void | boolean
		> {}

	const chrome: {
		bookmarks?: {
			getTree(callback: (nodes: ChromeBookmarkTreeNode[]) => void): void;
		};
		tabs: {
			query(
				queryInfo: { active?: boolean; currentWindow?: boolean; [key: string]: any },
				callback: (tabs: ChromeTabsTab[]) => void
			): void;
		};
		notifications: {
			create(
				options: ChromeNotificationsOptions | string,
				callback?: (notificationId: string) => void
			): void;
		};
		alarms: {
			create(name: string, alarmInfo: ChromeAlarmCreateInfo): void;
			create(alarmInfo: ChromeAlarmCreateInfo): void;
			clear(name?: string, callback?: (wasCleared: boolean) => void): void;
			getAll(callback: (alarms: ChromeAlarm[]) => void): void;
			onAlarm: ChromeAlarmEvent;
		};
		storage: {
			local: ChromeStorageArea;
		};
		runtime: {
			lastError: ChromeRuntimeError | undefined;
			getURL(path: string): string;
			sendMessage(message: any, responseCallback?: (response: any) => void): void;
			onMessage: ChromeMessageEvent;
			onStartup: ChromeEvent<() => void>;
			onInstalled: ChromeEvent<(details: { reason: string }) => void>;
		};
	};
}

export {};
