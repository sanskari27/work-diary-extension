/// <reference types="vite/client" />

// Chrome Extension API types
declare global {
	namespace chrome {
		namespace tabs {
			interface Tab {
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
				mutedInfo?: MutedInfo;
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

			interface MutedInfo {
				muted: boolean;
				reason?: string;
				extensionId?: string;
			}

			function query(
				queryInfo: { active?: boolean; currentWindow?: boolean; [key: string]: any },
				callback: (tabs: Tab[]) => void
			): void;
		}
	}
}

export {};
