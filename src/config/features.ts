import { LucideIcon, Rocket } from 'lucide-react';

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
];

export const iconMap: Record<string, LucideIcon> = {
	rocket: Rocket,
};
