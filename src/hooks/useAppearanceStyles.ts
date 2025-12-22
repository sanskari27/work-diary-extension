import { useAppSelector } from '@/store/hooks';

type SizeVariant = 'small' | 'medium' | 'large';
type ComponentType =
	| 'card'
	| 'button'
	| 'input'
	| 'badge'
	| 'text'
	| 'icon'
	| 'page'
	| 'notification';

interface StyleConfig {
	padding?: string;
	margin?: string;
	textSize?: string;
	iconSize?: string;
	spacing?: string;
	buttonPadding?: string;
	titleSize?: string;
	metaSize?: string;
	height?: string;
	panelWidth?: string;
	panelPadding?: string;
	notificationPadding?: string;
	headerTextSize?: string;
	getTypeColors?: (type: string) => string;
	[key: string]: string | boolean | ((...args: any[]) => any) | undefined;
}

/**
 * Generic hook for appearance-based styling that can be used by any component.
 * Provides utility functions and pre-configured style sets for common component types.
 */
export const useAppearanceStyles = () => {
	const appearance = useAppSelector((state) => state.settings.appearanceSettings);

	/**
	 * Get base styles based on size variant
	 */
	const getBaseStyles = (variant: SizeVariant = appearance.cardSize): StyleConfig => {
		const isCompact = appearance.compactMode;
		const isMinimal = appearance.minimalMode;

		switch (variant) {
			case 'small':
				return {
					compact: isCompact,
					minimal: isMinimal,
					padding: isCompact ? 'p-2' : 'p-3',
					textSize: 'text-xs',
					iconSize: 'w-3.5 h-3.5',
					spacing: 'space-y-1.5',
					buttonPadding: 'p-1',
					titleSize: 'text-base',
					metaSize: 'text-[10px]',
				};
			case 'large':
				return {
					compact: isCompact,
					minimal: isMinimal,
					padding: isCompact ? 'p-6' : 'p-8',
					textSize: 'text-base',
					iconSize: 'w-5 h-5',
					spacing: 'space-y-4',
					buttonPadding: 'p-3',
					titleSize: 'text-3xl',
					metaSize: 'text-base',
				};
			default: // medium
				return {
					compact: isCompact,
					minimal: isMinimal,
					padding: isCompact ? 'p-3' : 'p-4',
					textSize: 'text-sm',
					iconSize: 'w-4 h-4',
					spacing: 'space-y-2',
					buttonPadding: 'p-1.5',
					titleSize: 'text-lg',
					metaSize: 'text-xs',
				};
		}
	};

	/**
	 * Get styles for a specific component type
	 */
	const getComponentStyles = (type: ComponentType, variant?: SizeVariant): StyleConfig => {
		const base = getBaseStyles(variant);
		const isCompact = appearance.compactMode;

		switch (type) {
			case 'card':
				switch (appearance.cardSize) {
					case 'small':
						return {
							...base,
							padding: isCompact ? 'p-3' : 'p-4',
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
							padding: isCompact ? 'p-6' : 'p-8',
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
							padding: isCompact ? 'p-4' : 'p-6',
							titleSize: 'text-2xl',
							metaSize: 'text-sm',
							textSize: 'text-sm',
							iconSize: 'w-4 h-4',
							spacing: 'space-y-3',
							buttonPadding: 'p-2',
						};
				}

			case 'button':
				return {
					...base,
					padding: isCompact ? 'px-3 py-1.5' : 'px-4 py-2',
					textSize: base.textSize,
					iconSize: base.iconSize,
				};

			case 'input':
				return {
					...base,
					padding: isCompact ? 'px-2 py-1' : 'px-3 py-1.5',
					textSize: base.textSize,
					height: isCompact ? 'h-7' : 'h-8',
				};

			case 'badge':
				return {
					...base,
					padding: isCompact ? 'px-1.5 py-0.5' : 'px-2 py-1',
					textSize: 'text-xs',
					iconSize: 'w-3 h-3',
				};

			case 'text':
				return {
					...base,
					titleSize: base.titleSize,
					textSize: base.textSize,
					metaSize: base.metaSize,
				};

			case 'icon':
				return {
					...base,
					iconSize: base.iconSize,
				};

			case 'page':
				if (isCompact) {
					return {
						...base,
						padding: 'p-4 md:p-6 lg:p-8',
						sectionGap: 'space-y-4',
						headerMargin: 'mb-4',
						iconSize: 'w-6 h-6',
						titleSize: 'text-4xl md:text-5xl',
					};
				}

				if (appearance.cardSize === 'large') {
					return {
						...base,
						padding: 'p-8 md:p-16 lg:p-20',
						sectionGap: 'space-y-10',
						headerMargin: 'mb-10',
						iconSize: 'w-10 h-10',
						titleSize: 'text-6xl md:text-7xl',
					};
				}

				if (appearance.cardSize === 'small') {
					return {
						...base,
						padding: 'p-4 md:p-8 lg:p-12',
						sectionGap: 'space-y-4',
						headerMargin: 'mb-6',
						iconSize: 'w-6 h-6',
						titleSize: 'text-3xl md:text-4xl',
					};
				}

				return {
					...base,
					padding: 'p-6 md:p-12 lg:p-16',
					sectionGap: 'space-y-8',
					headerMargin: 'mb-8',
					iconSize: 'w-8 h-8',
					titleSize: 'text-5xl md:text-6xl',
				};

			case 'notification':
				const panelWidth = isCompact ? 'w-full lg:w-72 xl:w-80' : 'w-full lg:w-80 xl:w-96';
				const panelPadding = isCompact ? 'p-2' : 'p-4';
				const notificationPadding = isCompact
					? 'p-2'
					: appearance.cardSize === 'small'
					? 'p-2'
					: 'p-4';
				const spacing = isCompact ? 'space-y-2' : 'space-y-3';
				const iconSize =
					isCompact || appearance.cardSize === 'small'
						? 'w-4 h-4'
						: appearance.cardSize === 'large'
						? 'w-6 h-6'
						: 'w-5 h-5';
				const textSize =
					isCompact || appearance.cardSize === 'small'
						? 'text-xs'
						: appearance.cardSize === 'large'
						? 'text-base'
						: 'text-sm';
				const headerTextSize =
					isCompact || appearance.cardSize === 'small' ? 'text-base' : 'text-lg';

				const typeColors: Record<string, string> = {
					error: 'bg-red-500/20 border-red-500/50 text-red-200',
					success: 'bg-green-500/20 border-green-500/50 text-green-200',
					warning: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200',
					info: 'bg-blue-500/20 border-blue-500/50 text-blue-200',
				};

				return {
					...base,
					panelWidth,
					panelPadding,
					notificationPadding,
					spacing,
					iconSize,
					textSize,
					headerTextSize,
					getTypeColors: (type: string) => typeColors[type] ?? typeColors.info,
				};

			default:
				return base;
		}
	};

	/**
	 * Utility function to get a specific style property
	 */
	const getStyle = (type: ComponentType, property: string, variant?: SizeVariant): string => {
		const styles = getComponentStyles(type, variant);
		return (styles[property] as string) || '';
	};

	/**
	 * Utility function to combine multiple style classes
	 */
	const combineStyles = (...classes: (string | undefined | null | false)[]): string => {
		return classes.filter(Boolean).join(' ');
	};

	// Legacy API for backward compatibility
	const card = getComponentStyles('card');
	const page = getComponentStyles('page');
	const notification = getComponentStyles('notification');

	return {
		// Raw appearance settings
		appearance,

		// Legacy API (for backward compatibility)
		card,
		page,
		notification,

		// New generic API
		getBaseStyles,
		getComponentStyles,
		getStyle,
		combineStyles,

		// Convenience helpers
		styles: {
			card: () => getComponentStyles('card'),
			button: () => getComponentStyles('button'),
			input: () => getComponentStyles('input'),
			badge: () => getComponentStyles('badge'),
			text: () => getComponentStyles('text'),
			icon: () => getComponentStyles('icon'),
			page: () => getComponentStyles('page'),
			notification: () => getComponentStyles('notification'),
		},
	};
};
