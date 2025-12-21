import { BookmarkGroup } from '@/store/slices/bookmarksSlice';

/**
 * Detects the type of bookmark based on URL patterns
 */
export function detectBookmarkType(url: string): 'repo' | 'docs' | 'dashboard' | 'other' {
	try {
		const urlObj = new URL(url);
		const hostname = urlObj.hostname.toLowerCase();
		const pathname = urlObj.pathname.toLowerCase();

		// GitHub, GitLab, Bitbucket patterns
		if (
			hostname.includes('github.com') ||
			hostname.includes('gitlab.com') ||
			hostname.includes('bitbucket.org') ||
			hostname.includes('github.io') ||
			hostname.includes('gitlab.io')
		) {
			return 'repo';
		}

		// Documentation sites
		if (
			hostname.includes('docs.') ||
			hostname.includes('readthedocs.io') ||
			hostname.includes('documentation') ||
			pathname.includes('/docs/') ||
			hostname.includes('wiki.') ||
			hostname.includes('confluence.') ||
			pathname.includes('/wiki/')
		) {
			return 'docs';
		}

		// Dashboard/admin patterns
		if (
			hostname.includes('dashboard') ||
			hostname.includes('admin') ||
			pathname.includes('/dashboard') ||
			pathname.includes('/admin') ||
			hostname.includes('console.') ||
			hostname.includes('portal.') ||
			pathname.includes('/jira/')
		) {
			return 'dashboard';
		}

		return 'other';
	} catch {
		return 'other';
	}
}

/**
 * Suggests a bookmark group name based on URL or type
 */
export function suggestBookmarkGroup(url: string, existingGroups: BookmarkGroup[]): string | null {
	try {
		const urlObj = new URL(url);
		const hostname = urlObj.hostname.toLowerCase();
		const type = detectBookmarkType(url);

		// Extract domain name (e.g., "github.com" -> "GitHub")
		const domainParts = hostname.replace('www.', '').split('.');
		const baseDomain = domainParts[0];

		// Type-based suggestions
		if (type === 'repo') {
			// Check if there's already a group for this repo host
			const repoGroup = existingGroups.find(
				(g) =>
					g.name.toLowerCase().includes(baseDomain) || g.name.toLowerCase().includes('repository')
			);
			if (repoGroup) {
				return repoGroup.name;
			}
			return 'Repositories';
		}

		if (type === 'docs') {
			const docsGroup = existingGroups.find(
				(g) =>
					g.name.toLowerCase().includes('doc') || g.name.toLowerCase().includes('documentation')
			);
			if (docsGroup) {
				return docsGroup.name;
			}
			return 'Documentation';
		}

		if (type === 'dashboard') {
			const dashboardGroup = existingGroups.find(
				(g) => g.name.toLowerCase().includes('dashboard') || g.name.toLowerCase().includes('admin')
			);
			if (dashboardGroup) {
				return dashboardGroup.name;
			}
			return 'Dashboards';
		}

		// Domain-based suggestion
		const domainGroup = existingGroups.find((g) => g.name.toLowerCase().includes(baseDomain));
		if (domainGroup) {
			return domainGroup.name;
		}

		// Capitalize first letter of domain
		const capitalizedDomain = baseDomain.charAt(0).toUpperCase() + baseDomain.slice(1);
		return capitalizedDomain;
	} catch {
		return null;
	}
}
