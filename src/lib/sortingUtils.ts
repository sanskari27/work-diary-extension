import { ReleaseEvent } from '@/store/slices/releasesSlice';
import { getDateStart, getTodayStart } from './dateUtils';

/**
 * Sorting utility functions for organizing release events
 */

/**
 * Sort releases in descending order (newest/furthest first)
 */
export const sortDescending = (a: ReleaseEvent, b: ReleaseEvent): number => {
	return new Date(b.date).getTime() - new Date(a.date).getTime();
};

/**
 * Sort releases in ascending order (soonest first)
 */
export const sortAscending = (a: ReleaseEvent, b: ReleaseEvent): number => {
	return new Date(a.date).getTime() - new Date(b.date).getTime();
};

/**
 * Special sorting for "This Month" releases
 * - Future releases appear first (sorted ascending - soonest first)
 * - Past releases appear at the bottom (sorted descending - most recent first)
 */
export const sortThisMonthReleases = (releases: ReleaseEvent[]): ReleaseEvent[] => {
	const todayStart = getTodayStart();
	const futureReleases: ReleaseEvent[] = [];
	const pastReleases: ReleaseEvent[] = [];

	releases.forEach((release) => {
		const releaseDateStart = getDateStart(release.date);

		if (releaseDateStart >= todayStart) {
			futureReleases.push(release);
		} else {
			pastReleases.push(release);
		}
	});

	// Sort future ascending (soonest first), past descending (most recent past first)
	futureReleases.sort(sortAscending);
	pastReleases.sort(sortDescending);

	return [...futureReleases, ...pastReleases];
};
