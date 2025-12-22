import { Node, NodeType, Notebook, TagType } from '@/types/notebooks';
import { Connection } from '@xyflow/react';

export interface SearchResult {
	node: Node;
	notebook: Notebook;
	matches: string[];
	score: number;
}

export interface SearchFilters {
	query?: string;
	tag?: TagType;
	notebookId?: string;
	nodeType?: NodeType;
}

/**
 * Build a search index from nodes
 */
export function buildSearchIndex(nodes: Node[]): Map<string, Set<string>> {
	const index = new Map<string, Set<string>>();

	nodes.forEach((node) => {
		const words = extractWords(node.content);
		words.forEach((word) => {
			if (!index.has(word)) {
				index.set(word, new Set());
			}
			index.get(word)!.add(node.id);
		});
	});

	return index;
}

/**
 * Extract words from content (lowercase, alphanumeric)
 */
function extractWords(content: string): string[] {
	return content
		.toLowerCase()
		.replace(/[^\w\s]/g, ' ')
		.split(/\s+/)
		.filter((word) => word.length > 0);
}

/**
 * Search nodes with full-text search and filters
 */
export function searchNodes(
	nodes: Node[],
	notebooks: Notebook[],
	_connections: Connection[],
	filters: SearchFilters
): SearchResult[] {
	let results: Node[] = [...nodes];

	// Filter by notebook
	if (filters.notebookId) {
		results = results.filter((node) => node.notebookId === filters.notebookId);
	}

	// Filter by tag
	if (filters.tag) {
		results = results.filter((node) => node.tag === filters.tag);
	}

	// Filter by node type
	if (filters.nodeType) {
		results = results.filter((node) => node.type === filters.nodeType);
	}

	// Full-text search
	if (filters.query && filters.query.trim()) {
		const query = filters.query.toLowerCase().trim();
		const queryWords = extractWords(query);

		const scoredResults: Array<{ node: Node; score: number; matches: string[] }> = [];

		results.forEach((node) => {
			const content = node.content.toLowerCase();
			const nodeWords = extractWords(node.content);
			let score = 0;
			const matches: string[] = [];

			queryWords.forEach((queryWord) => {
				// Exact match in content
				if (content.includes(queryWord)) {
					score += 10;
					matches.push(queryWord);
				}

				// Word match
				if (nodeWords.includes(queryWord)) {
					score += 5;
				}

				// Partial match
				nodeWords.forEach((nodeWord) => {
					if (nodeWord.includes(queryWord) || queryWord.includes(nodeWord)) {
						score += 2;
					}
				});
			});

			if (score > 0) {
				scoredResults.push({ node, score, matches });
			}
		});

		// Sort by score (descending)
		scoredResults.sort((a, b) => b.score - a.score);

		// Create search results with notebook info
		return scoredResults.map(({ node, score, matches }) => {
			const notebook = notebooks.find((n) => n.id === node.notebookId);
			return {
				node,
				notebook: notebook || ({} as Notebook),
				matches: [...new Set(matches)],
				score,
			};
		});
	}

	// No query, just return filtered results
	return results.map((node) => {
		const notebook = notebooks.find((n) => n.id === node.notebookId);
		return {
			node,
			notebook: notebook || ({} as Notebook),
			matches: [],
			score: 0,
		};
	});
}

/**
 * Highlight search matches in text
 */
export function highlightMatches(text: string, query: string): string {
	if (!query || !query.trim()) return text;

	const queryWords = extractWords(query);
	let highlighted = text;

	queryWords.forEach((word) => {
		const regex = new RegExp(`(${word})`, 'gi');
		highlighted = highlighted.replace(regex, '<mark>$1</mark>');
	});

	return highlighted;
}
