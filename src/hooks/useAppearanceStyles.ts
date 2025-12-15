import { useAppSelector } from '@/store/hooks';

export const useAppearanceStyles = () => {
	const appearance = useAppSelector((state) => state.settings.appearanceSettings);

	// Card-level styles (used by ReleaseCard, ReleaseItemList, etc.)
	const card = (() => {
		const base = {
			compact: appearance.compactMode,
			minimal: appearance.minimalMode,
		};

		switch (appearance.cardSize) {
			case 'small':
				return {
					...base,
					padding: appearance.compactMode ? 'p-3' : 'p-4',
					titleSize: 'text-lg',
					metaSize: 'text-xs',
					textSize: 'text-xs',
					iconSize: 'w-3.5 h-3.5',
					spacing: 'space-y-2',
					buttonPadding: 'p-1.5',
				};
			case 'large':
				return {
					...base,
					padding: appearance.compactMode ? 'p-6' : 'p-8',
					titleSize: 'text-3xl',
					metaSize: 'text-base',
					textSize: 'text-base',
					iconSize: 'w-5 h-5',
					spacing: 'space-y-4',
					buttonPadding: 'p-3',
				};
			default: // medium
				return {
					...base,
					padding: appearance.compactMode ? 'p-4' : 'p-6',
					titleSize: 'text-2xl',
					metaSize: 'text-sm',
					textSize: 'text-sm',
					iconSize: 'w-4 h-4',
					spacing: 'space-y-3',
					buttonPadding: 'p-2',
				};
		}
	})();

	// Page-level spacing (used by ReleasesPage, TodosPage, BookmarksPage, etc.)
	const page = (() => {
		if (appearance.compactMode) {
			return {
				padding: 'p-4 md:p-6 lg:p-8',
				sectionGap: 'space-y-4',
				headerMargin: 'mb-4',
				iconSize: 'w-6 h-6',
				titleSize: 'text-4xl md:text-5xl',
			};
		}

		if (appearance.cardSize === 'large') {
			return {
				padding: 'p-8 md:p-16 lg:p-20',
				sectionGap: 'space-y-10',
				headerMargin: 'mb-10',
				iconSize: 'w-10 h-10',
				titleSize: 'text-6xl md:text-7xl',
			};
		}

		if (appearance.cardSize === 'small') {
			return {
				padding: 'p-4 md:p-8 lg:p-12',
				sectionGap: 'space-y-4',
				headerMargin: 'mb-6',
				iconSize: 'w-6 h-6',
				titleSize: 'text-3xl md:text-4xl',
			};
		}

		return {
			padding: 'p-6 md:p-12 lg:p-16',
			sectionGap: 'space-y-8',
			headerMargin: 'mb-8',
			iconSize: 'w-8 h-8',
			titleSize: 'text-5xl md:text-6xl',
		};
	})();

	// Notification panel specific styles
	const notification = (() => {
		const panelWidth = appearance.compactMode ? 'w-full lg:w-72 xl:w-80' : 'w-full lg:w-80 xl:w-96';
		const panelPadding = appearance.compactMode ? 'p-2' : 'p-4';
		const notificationPadding = appearance.compactMode
			? 'p-2'
			: appearance.cardSize === 'small'
			? 'p-2'
			: 'p-4';
		const spacing = appearance.compactMode ? 'space-y-2' : 'space-y-3';
		const iconSize =
			appearance.compactMode || appearance.cardSize === 'small'
				? 'w-4 h-4'
				: appearance.cardSize === 'large'
				? 'w-6 h-6'
				: 'w-5 h-5';
		const textSize =
			appearance.compactMode || appearance.cardSize === 'small'
				? 'text-xs'
				: appearance.cardSize === 'large'
				? 'text-base'
				: 'text-sm';
		const headerTextSize =
			appearance.compactMode || appearance.cardSize === 'small' ? 'text-base' : 'text-lg';

		// Type color classes; kept here so they can evolve with appearance if needed
		const typeColors: Record<string, string> = {
			error: 'bg-red-500/20 border-red-500/50 text-red-200',
			success: 'bg-green-500/20 border-green-500/50 text-green-200',
			warning: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200',
			info: 'bg-blue-500/20 border-blue-500/50 text-blue-200',
		};

		const getTypeColors = (type: string) => typeColors[type] ?? typeColors.info;

		return {
			panelWidth,
			panelPadding,
			notificationPadding,
			spacing,
			iconSize,
			textSize,
			headerTextSize,
			getTypeColors,
		};
	})();

	return { appearance, card, page, notification };
};
