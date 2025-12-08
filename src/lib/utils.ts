import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import _ from 'lodash';
import { Sunrise, Sun, Sunset, Moon } from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const getGreeting = () => {
	const hour = new Date().getHours();

	if (_.inRange(hour, 5, 12)) {
		return 'Good Morning';
	} else if (_.inRange(hour, 12, 17)) {
		return 'Good Afternoon';
	} else if (_.inRange(hour, 17, 21)) {
		return 'Good Evening';
	} else {
		return 'Good Night';
	}
};

export const getGreetingIcon = () => {
	const hour = new Date().getHours();

	if (_.inRange(hour, 5, 12)) {
		return Sunrise;
	} else if (_.inRange(hour, 12, 17)) {
		return Sun;
	} else if (_.inRange(hour, 17, 21)) {
		return Sunset;
	} else {
		return Moon;
	}
};

export const formatTime = () => {
	return new Date().toLocaleTimeString('en-US', {
		hour: '2-digit',
		minute: '2-digit',
	});
};

