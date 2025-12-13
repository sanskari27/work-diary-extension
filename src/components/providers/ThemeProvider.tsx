import { getTheme } from '@/lib/themes';
import { useAppSelector } from '@/store/hooks';
import { useEffect } from 'react';

/**
 * ThemeProvider applies theme CSS variables to the document root
 * based on the selected color theme in Redux store
 */
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
	const colorTheme = useAppSelector((state) => state.settings.appearanceSettings.colorTheme);
	const theme = getTheme(colorTheme);

	useEffect(() => {
		// Apply theme colors as CSS variables
		const root = document.documentElement;
		const colors = theme.colors;

		root.style.setProperty('--primary', colors.primary);
		root.style.setProperty('--primary-foreground', colors.primaryForeground);
		root.style.setProperty('--primary-hover', colors.primaryHover);
		root.style.setProperty('--accent', colors.accent);
		root.style.setProperty('--accent-foreground', colors.accentForeground);
		root.style.setProperty('--accent-border', colors.accentBorder);
		root.style.setProperty('--gradient-from', colors.gradientFrom);
		root.style.setProperty('--gradient-to', colors.gradientTo);
		root.style.setProperty('--gradient-shadow', colors.gradientShadow);
		root.style.setProperty('--background-from', colors.backgroundFrom);
		root.style.setProperty('--background-via', colors.backgroundVia);
		root.style.setProperty('--background-to', colors.backgroundTo);
		root.style.setProperty('--background-icon', colors.backgroundIcon);
		root.style.setProperty('--glass-border', colors.glassBorder);
		root.style.setProperty('--glass-border-strong', colors.glassBorderStrong);
		root.style.setProperty('--scrollbar-track', colors.scrollbarTrack);
		root.style.setProperty('--scrollbar-thumb', colors.scrollbarThumb);
		root.style.setProperty('--scrollbar-thumb-hover', colors.scrollbarThumbHover);
		root.style.setProperty('--text-primary', colors.textPrimary);
		root.style.setProperty('--text-secondary', colors.textSecondary);
		root.style.setProperty('--text-muted', colors.textMuted);
		root.style.setProperty('--text-accent', colors.textAccent);
		root.style.setProperty('--text-accent-foreground', colors.textAccentForeground);
		root.style.setProperty('--ring', colors.ring);
	}, [colorTheme, theme]);

	return <>{children}</>;
};
