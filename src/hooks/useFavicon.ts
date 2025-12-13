import { getFaviconFromCache, saveFaviconToCache } from '@/store/indexedDB';
import { useEffect, useState } from 'react';

/**
 * Hook to fetch and cache favicons with 7-day expiration
 * @param url - The URL of the page to get the favicon for
 * @returns The favicon URL or null if not available
 */
export const useFavicon = (url: string | null): string | null => {
	const [faviconUrl, setFaviconUrl] = useState<string | null>(null);

	useEffect(() => {
		if (!url) {
			setFaviconUrl(null);
			return;
		}

		const fetchFavicon = async () => {
			try {
				// Handle special URLs like chrome://newtab/
				if (url.startsWith('chrome://') || url.startsWith('chrome-extension://')) {
					// For Chrome internal URLs, don't try to get favicon
					setFaviconUrl(null);
					return;
				}

				const urlObj = new URL(url);
				const domain = urlObj.hostname;

				// Check cache first
				const cachedFavicon = await getFaviconFromCache(domain);
				if (cachedFavicon && !cachedFavicon.startsWith('chrome://favicon/')) {
					setFaviconUrl(cachedFavicon);
					return;
				}

				// Use Google's favicon service (works everywhere, reliable)
				// chrome://favicon/ doesn't work in newtab pages, so we use Google's service
				const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

				setFaviconUrl(faviconUrl);
				await saveFaviconToCache(domain, faviconUrl);
			} catch (error) {
				console.error('Error fetching favicon:', error);
				// Fallback to Google's service
				try {
					const urlObj = new URL(url);
					const domain = urlObj.hostname;
					const fallbackUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
					setFaviconUrl(fallbackUrl);
					await saveFaviconToCache(domain, fallbackUrl);
				} catch (e) {
					setFaviconUrl(null);
				}
			}
		};

		fetchFavicon();
	}, [url]);

	return faviconUrl;
};
