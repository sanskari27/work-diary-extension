import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Hook to handle PWA install prompt
 * Detects when the browser shows the install prompt and provides methods to trigger it
 */
export const usePWAInstall = () => {
	const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
	const [isInstallable, setIsInstallable] = useState(false);
	const [isInstalled, setIsInstalled] = useState(false);

	useEffect(() => {
		// Check if app is already installed
		if (window.matchMedia('(display-mode: standalone)').matches) {
			setIsInstalled(true);
			return;
		}

		// Listen for the beforeinstallprompt event
		const handleBeforeInstallPrompt = (e: Event) => {
			// Prevent the default mini-infobar from appearing
			e.preventDefault();
			// Store the event for later use
			setDeferredPrompt(e as BeforeInstallPromptEvent);
			setIsInstallable(true);
		};

		// Listen for app installed event
		const handleAppInstalled = () => {
			setIsInstalled(true);
			setIsInstallable(false);
			setDeferredPrompt(null);
		};

		window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
		window.addEventListener('appinstalled', handleAppInstalled);

		return () => {
			window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
			window.removeEventListener('appinstalled', handleAppInstalled);
		};
	}, []);

	/**
	 * Trigger the install prompt
	 * @returns Promise that resolves when user makes a choice
	 */
	const promptInstall = async (): Promise<boolean> => {
		if (!deferredPrompt) {
			return false;
		}

		try {
			// Show the install prompt
			await deferredPrompt.prompt();

			// Wait for the user to respond to the prompt
			const { outcome } = await deferredPrompt.userChoice;

			if (outcome === 'accepted') {
				setIsInstalled(true);
				setIsInstallable(false);
				setDeferredPrompt(null);
				return true;
			}

			return false;
		} catch (error) {
			console.error('Error showing install prompt:', error);
			return false;
		}
	};

	return {
		isInstallable,
		isInstalled,
		promptInstall,
	};
};

