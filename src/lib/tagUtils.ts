/**
 * Tag Utilities
 * Core tag parsing, keyword matching, and color assignment logic
 */

export type TagColor = 'green' | 'red' | 'blue' | 'yellow' | 'neutral';

export type KeywordGroup = 'idea' | 'bug' | 'followup' | 'decision';

export interface TagSuggestion {
	label: string;
	color: TagColor;
	hint?: string;
}

// Keyword groups with their associated keywords
const KEYWORD_GROUPS: Record<
	KeywordGroup,
	{ keywords: (string | RegExp)[]; color: TagColor; hint: string }
> = {
	idea: {
		keywords: [
			'idea',
			'thought',
			'concept',
			'brainstorm',
			'innovation',
			'suggestion',
			'proposal',
			'insight',
			'vision',
			'hypothesis',
		],
		color: 'green',
		hint: 'idea | thought | concept | brainstorm | innovation | suggestion | proposal',
	},
	bug: {
		keywords: [
			'bug',
			'error',
			'issue',
			'broken',
			'fix',
			'defect',
			'glitch',
			'problem',
			'crash',
			'failure',
			'exception',
		],
		color: 'red',
		hint: 'bug | error | issue | broken | fix | defect | glitch | problem | crash',
	},
	followup: {
		keywords: [
			/follow.?up/i,
			'remind',
			'later',
			'todo',
			'check',
			'review',
			'revisit',
			'pending',
			'ask',
			'wait',
			'track',
		],
		color: 'blue',
		hint: 'follow up | remind | later | todo | check | review | revisit | pending | ask',
	},
	decision: {
		keywords: [
			'decide',
			'decision',
			'choose',
			'option',
			'select',
			'pick',
			'determine',
			'conclusion',
			'finalize',
			'tradeoff',
		],
		color: 'yellow',
		hint: 'decide | decision | choose | option | select | pick | determine | conclusion',
	},
};

// Priority order for color matching (Bug → Follow-up → Decision → Idea)
const COLOR_PRIORITY: KeywordGroup[] = ['bug', 'followup', 'decision', 'idea'];

/**
 * Extract all tags from content
 * Matches @tag patterns (alphanumeric, underscore, hyphen)
 */
export function extractTags(content: string): string[] {
	const tagRegex = /@([\w-]+)/g;
	const matches = content.matchAll(tagRegex);
	const tags: string[] = [];

	for (const match of matches) {
		if (match[1]) {
			tags.push(match[1]);
		}
	}

	return tags;
}

/**
 * Match a tag to a keyword group
 * Returns the matched group or null
 */
export function matchKeywordGroup(tag: string): KeywordGroup | null {
	const normalizedTag = tag.toLowerCase();

	// Check groups in priority order
	for (const group of COLOR_PRIORITY) {
		const groupData = KEYWORD_GROUPS[group];

		for (const keyword of groupData.keywords) {
			if (keyword instanceof RegExp) {
				if (keyword.test(normalizedTag)) {
					return group;
				}
			} else {
				if (normalizedTag === keyword.toLowerCase()) {
					return group;
				}
			}
		}
	}

	return null;
}

/**
 * Get color for a tag based on keyword matching
 */
export function getTagColor(tag: string): TagColor {
	const group = matchKeywordGroup(tag);
	if (group) {
		return KEYWORD_GROUPS[group].color;
	}
	return 'neutral';
}

/**
 * Get base suggestions (shown when only @ is typed)
 */
export function getBaseSuggestions(): TagSuggestion[] {
	return [
		{
			label: 'idea',
			color: 'green',
			hint: KEYWORD_GROUPS.idea.hint,
		},
		{
			label: 'bug',
			color: 'red',
			hint: KEYWORD_GROUPS.bug.hint,
		},
		{
			label: 'followup',
			color: 'blue',
			hint: KEYWORD_GROUPS.followup.hint,
		},
		{
			label: 'decision',
			color: 'yellow',
			hint: KEYWORD_GROUPS.decision.hint,
		},
	];
}

/**
 * Extract query text from value at a given cursor index
 * Returns the text after the last @ symbol before the index, or empty string if no @ found
 */
export function getQuery(value: string, index: number): string {
	const beforeCursor = value.slice(0, index);
	const lastAtIndex = beforeCursor.lastIndexOf('@');

	if (lastAtIndex === -1) {
		return '';
	}

	return beforeCursor.slice(lastAtIndex + 1);
}

/**
 * Get filtered suggestions based on query
 * Returns suggestions that match the query, or base suggestions if query is empty
 */
export function getTagSuggestions(query: string): TagSuggestion[] {
	const normalizedQuery = query.toLowerCase().trim();

	// If query is empty, return base suggestions
	if (!normalizedQuery) {
		return getBaseSuggestions();
	}

	// Filter base suggestions and add matching examples
	const suggestions: TagSuggestion[] = [];
	const matchedGroups = new Set<KeywordGroup>();

	// Check if query matches any base suggestion
	for (const baseSuggestion of getBaseSuggestions()) {
		if (baseSuggestion.label.toLowerCase().startsWith(normalizedQuery)) {
			suggestions.push({
				...baseSuggestion,
				hint: undefined, // Hide hint in filtered mode
			});
			const group = matchKeywordGroup(baseSuggestion.label);
			if (group) {
				matchedGroups.add(group);
			}
		}
	}

	// Add matching keywords from groups
	for (const group of COLOR_PRIORITY) {
		if (matchedGroups.has(group)) continue; // Already added base suggestion

		const groupData = KEYWORD_GROUPS[group];
		for (const keyword of groupData.keywords) {
			const keywordStr = keyword instanceof RegExp ? keyword.source : keyword;
			const keywordLower = keywordStr.toLowerCase();

			if (keywordLower.includes(normalizedQuery) || normalizedQuery.includes(keywordLower)) {
				suggestions.push({
					label: keywordStr.replace(/[()]/g, ''), // Clean regex patterns
					color: groupData.color,
				});
				matchedGroups.add(group);
				break; // Only add one example per group
			}
		}
	}

	// If no matches, return empty (user can type freely)
	return suggestions.slice(0, 4); // Limit to 4 suggestions
}
