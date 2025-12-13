import { Bookmark, CheckSquare, LucideIcon, Rocket } from 'lucide-react';

export interface Feature {
	id: string;
	name: string;
	route: string;
	icon: string;
}

export const FEATURES: Feature[] = [
	{
		id: 'releases',
		name: 'Releases',
		route: '/releases',
		icon: 'rocket',
	},
	{
		id: 'todos',
		name: 'Todos',
		route: '/todos',
		icon: 'checkSquare',
	},
	{
		id: 'bookmarks',
		name: 'Bookmarks',
		route: '/bookmarks',
		icon: 'bookmark',
	},
];

export const iconMap: Record<string, LucideIcon> = {
	rocket: Rocket,
	checkSquare: CheckSquare,
	bookmark: Bookmark,
};
