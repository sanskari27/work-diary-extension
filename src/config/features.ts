import { Bookmark, Brain, CheckSquare, GitPullRequest, LucideIcon, Rocket } from 'lucide-react';

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
	{
		id: 'prs',
		name: 'Active PRs',
		route: '/prs',
		icon: 'gitPullRequest',
	},
	{
		id: 'brain-dumps',
		name: 'Brain Dumps',
		route: '/brain-dumps',
		icon: 'brain',
	},
];

export const iconMap: Record<string, LucideIcon> = {
	rocket: Rocket,
	checkSquare: CheckSquare,
	bookmark: Bookmark,
	gitPullRequest: GitPullRequest,
	brain: Brain,
};
