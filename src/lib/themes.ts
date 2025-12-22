// Theme color definitions
export interface ThemeColors {
	// Primary theme colors
	primary: string; // HSL format: "hue saturation% lightness%"
	primaryForeground: string;
	primaryHover: string;

	// Accent colors (for borders, highlights, etc.)
	accent: string;
	accentForeground: string;
	accentBorder: string;

	// Gradient colors (for gradient buttons, backgrounds)
	gradientFrom: string;
	gradientTo: string;
	gradientShadow: string;

	// Background colors
	backgroundFrom: string; // Dark background gradient start
	backgroundVia: string; // Dark background gradient middle
	backgroundTo: string; // Dark background gradient end
	backgroundIcon: string; // Icon background gradient (darker, more saturated)

	// Glass effect colors
	glassBorder: string;
	glassBorderStrong: string;

	// Scrollbar colors
	scrollbarTrack: string;
	scrollbarThumb: string;
	scrollbarThumbHover: string;

	// Text colors
	textPrimary: string; // Main text color (bright)
	textSecondary: string; // Secondary text color (muted)
	textMuted: string; // Very muted text color
	textAccent: string; // Accent text color
	textAccentForeground: string; // Accent foreground text color

	// Ring color (for focus rings)
	ring: string; // Focus ring color (typically based on primary)
}

export interface Theme {
	id: string;
	name: string;
	description: string;
	colors: ThemeColors;
}

// Pre-curated themes
export const themes: Theme[] = [
	{
		id: 'purple',
		name: 'Purple',
		description: 'Elegant purple theme with pink accents',
		colors: {
			primary: '270 91% 65%',
			primaryForeground: '222 47% 11%',
			primaryHover: '270 91% 55%',
			accent: '270 70% 50%',
			accentForeground: '210 40% 98%',
			accentBorder: '270 50% 40%',
			gradientFrom: '270 100% 50%',
			gradientTo: '330 100% 50%',
			gradientShadow: '270 100% 50%',
			backgroundFrom: '222 47% 4.9%',
			backgroundVia: '270 50% 10%',
			backgroundTo: '222 47% 4.9%',
			backgroundIcon: '270 100% 50%',
			glassBorder: '270 50% 50%',
			glassBorderStrong: '270 50% 60%',
			scrollbarTrack: '270 50% 20%',
			scrollbarThumb: '270 50% 40%',
			scrollbarThumbHover: '270 50% 60%',
			textPrimary: '270 70% 70%',
			textSecondary: '270 50% 50%',
			textMuted: '270 30% 40%',
			textAccent: '270 91% 65%',
			textAccentForeground: '210 40% 98%',
			ring: '270 91% 65%',
		},
	},
	{
		id: 'blue',
		name: 'Blue',
		description: 'Calm blue theme with cyan accents',
		colors: {
			primary: '217 91% 60%',
			primaryForeground: '222 47% 11%',
			primaryHover: '217 91% 50%',
			accent: '200 90% 50%',
			accentForeground: '210 40% 98%',
			accentBorder: '217 50% 40%',
			gradientFrom: '217 100% 50%',
			gradientTo: '200 100% 50%',
			gradientShadow: '217 100% 50%',
			backgroundFrom: '222 47% 4.9%',
			backgroundVia: '217 50% 10%',
			backgroundTo: '222 47% 4.9%',
			backgroundIcon: '217 100% 50%',
			glassBorder: '217 50% 50%',
			glassBorderStrong: '217 50% 60%',
			scrollbarTrack: '217 50% 20%',
			scrollbarThumb: '217 50% 40%',
			scrollbarThumbHover: '217 50% 60%',
			textPrimary: '217 70% 70%',
			textSecondary: '217 50% 50%',
			textMuted: '217 30% 40%',
			textAccent: '217 91% 60%',
			textAccentForeground: '210 40% 98%',
			ring: '217 91% 60%',
		},
	},
	{
		id: 'green',
		name: 'Black',
		description: 'Classic black theme with white accents',
		colors: {
			primary: '0 0% 100%',
			primaryForeground: '0 0% 0%',
			primaryHover: '0 0% 90%',
			accent: '0 0% 80%',
			accentForeground: '0 0% 0%',
			accentBorder: '0 0% 40%',
			gradientFrom: '0 0% 35%',
			gradientTo: '0 0% 15%',
			gradientShadow: '0 0% 10%',
			backgroundFrom: '0 0% 0%',
			backgroundVia: '0 0% 5%',
			backgroundTo: '0 0% 0%',
			backgroundIcon: '0 0% 0%',
			glassBorder: '0 0% 50%',
			glassBorderStrong: '0 0% 60%',
			scrollbarTrack: '0 0% 20%',
			scrollbarThumb: '0 0% 40%',
			scrollbarThumbHover: '0 0% 60%',
			textPrimary: '0 0% 100%',
			textSecondary: '0 0% 70%',
			textMuted: '0 0% 50%',
			textAccent: '0 0% 100%',
			textAccentForeground: '0 0% 0%',
			ring: '0 0% 100%',
		},
	},
	{
		id: 'orange',
		name: 'Orange',
		description: 'Warm orange theme with amber accents',
		colors: {
			primary: '25 95% 53%',
			primaryForeground: '222 47% 11%',
			primaryHover: '25 95% 45%',
			accent: '43 96% 56%',
			accentForeground: '222 47% 11%',
			accentBorder: '25 70% 40%',
			gradientFrom: '25 100% 50%',
			gradientTo: '43 100% 50%',
			gradientShadow: '25 100% 50%',
			backgroundFrom: '222 47% 4.9%',
			backgroundVia: '25 50% 10%',
			backgroundTo: '222 47% 4.9%',
			backgroundIcon: '25 100% 50%',
			glassBorder: '25 50% 50%',
			glassBorderStrong: '25 50% 60%',
			scrollbarTrack: '25 50% 20%',
			scrollbarThumb: '25 50% 40%',
			scrollbarThumbHover: '25 50% 60%',
			textPrimary: '25 80% 65%',
			textSecondary: '25 60% 50%',
			textMuted: '25 40% 40%',
			textAccent: '25 95% 53%',
			textAccentForeground: '222 47% 11%',
			ring: '25 95% 53%',
		},
	},
	{
		id: 'pink',
		name: 'Pink',
		description: 'Vibrant pink theme with rose accents',
		colors: {
			primary: '330 81% 60%',
			primaryForeground: '210 40% 98%',
			primaryHover: '330 81% 50%',
			accent: '340 82% 52%',
			accentForeground: '210 40% 98%',
			accentBorder: '330 60% 45%',
			gradientFrom: '330 100% 60%',
			gradientTo: '340 100% 60%',
			gradientShadow: '330 100% 60%',
			backgroundFrom: '222 47% 4.9%',
			backgroundVia: '330 50% 10%',
			backgroundTo: '222 47% 4.9%',
			backgroundIcon: '330 100% 60%',
			glassBorder: '330 50% 50%',
			glassBorderStrong: '330 50% 60%',
			scrollbarTrack: '330 50% 20%',
			scrollbarThumb: '330 50% 40%',
			scrollbarThumbHover: '330 50% 60%',
			textPrimary: '330 70% 70%',
			textSecondary: '330 50% 55%',
			textMuted: '330 30% 45%',
			textAccent: '330 81% 60%',
			textAccentForeground: '210 40% 98%',
			ring: '330 81% 60%',
		},
	},
	{
		id: 'cyan',
		name: 'Cyan',
		description: 'Cool cyan theme with teal accents',
		colors: {
			primary: '188 94% 43%',
			primaryForeground: '222 47% 11%',
			primaryHover: '188 94% 35%',
			accent: '174 60% 51%',
			accentForeground: '210 40% 98%',
			accentBorder: '188 50% 35%',
			gradientFrom: '188 100% 45%',
			gradientTo: '174 100% 50%',
			gradientShadow: '188 100% 45%',
			backgroundFrom: '222 47% 4.9%',
			backgroundVia: '188 50% 10%',
			backgroundTo: '222 47% 4.9%',
			backgroundIcon: '188 100% 45%',
			glassBorder: '188 50% 50%',
			glassBorderStrong: '188 50% 60%',
			scrollbarTrack: '188 50% 20%',
			scrollbarThumb: '188 50% 40%',
			scrollbarThumbHover: '188 50% 60%',
			textPrimary: '188 70% 65%',
			textSecondary: '188 50% 50%',
			textMuted: '188 30% 40%',
			textAccent: '188 94% 43%',
			textAccentForeground: '210 40% 98%',
			ring: '188 94% 43%',
		},
	},
];

// Get theme by ID
export const getTheme = (themeId: string): Theme => {
	return themes.find((t) => t.id === themeId) || themes[0];
};

// Default theme
export const defaultTheme = themes[0];
