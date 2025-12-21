import {
	CaseSensitive,
	Clock,
	Code,
	FileJson,
	Key,
	Lock,
	LucideIcon,
	Network,
	Type,
	Wrench,
} from 'lucide-react';

export interface Tool {
	id: string;
	name: string;
	icon: string;
	description: string;
	component: string; // Component name to dynamically import
}

export interface ToolGroup {
	id: string;
	name: string;
	icon: string;
	description: string;
	tools: Tool[];
}

export const TOOL_GROUPS: ToolGroup[] = [
	{
		id: 'json',
		name: 'JSON Tools',
		icon: 'fileJson',
		description: 'JSON manipulation and validation tools',
		tools: [
			{
				id: 'json-pretty-minify',
				name: 'Pretty Print / Minify JSON',
				icon: 'code',
				description: 'Format JSON with indentation or remove whitespace',
				component: 'JsonPrettyMinify',
			},
			{
				id: 'json-validator',
				name: 'JSON Validator',
				icon: 'fileJson',
				description: 'Validate JSON and show error line',
				component: 'JsonValidator',
			},
			{
				id: 'json-sort-keys',
				name: 'Sort JSON Keys',
				icon: 'fileJson',
				description: 'Sort JSON object keys alphabetically',
				component: 'JsonSortKeys',
			},
			{
				id: 'json-remove-nulls',
				name: 'Remove null / undefined fields',
				icon: 'fileJson',
				description: 'Remove null and undefined values from JSON',
				component: 'JsonRemoveNulls',
			},
			{
				id: 'json-pick-omit',
				name: 'Pick / omit fields',
				icon: 'fileJson',
				description: 'Select or exclude specific fields from JSON',
				component: 'JsonPickOmit',
			},
			{
				id: 'json-string-converter',
				name: 'JSON ↔ String Converter',
				icon: 'code',
				description: 'Convert between JSON and escaped string',
				component: 'JsonStringConverter',
			},
			{
				id: 'javascript-to-json',
				name: 'JavaScript to JSON object',
				icon: 'code',
				description: 'Convert JavaScript object literal to JSON',
				component: 'JavascriptToJson',
			},
		],
	},
	{
		id: 'jwt',
		name: 'JWT Tools',
		icon: 'key',
		description: 'JWT token manipulation and analysis',
		tools: [
			{
				id: 'jwt-analyzer',
				name: 'JWT Analyzer',
				icon: 'key',
				description: 'Decode JWT, check expiry, and show issued-at time',
				component: 'JwtAnalyzer',
			},
		],
	},
	{
		id: 'encoding',
		name: 'Encoding',
		icon: 'lock',
		description: 'Text encoding and decoding utilities',
		tools: [
			{
				id: 'base64-converter',
				name: 'Base64 Encode / Decode',
				icon: 'code',
				description: 'Encode text to Base64 or decode Base64 to text',
				component: 'Base64Converter',
			},
			{
				id: 'url-converter',
				name: 'URL Encode / Decode',
				icon: 'code',
				description: 'Encode text for URL or decode URL encoded text',
				component: 'UrlConverter',
			},
			{
				id: 'hex-converter',
				name: 'Hex Encode / Decode',
				icon: 'code',
				description: 'Encode text to hexadecimal or decode hexadecimal to text',
				component: 'HexConverter',
			},
		],
	},
	{
		id: 'time',
		name: 'Time Tools',
		icon: 'clock',
		description: 'Time and date conversion utilities',
		tools: [
			{
				id: 'epoch-date-converter',
				name: 'Epoch ↔ Date Converter',
				icon: 'clock',
				description: 'Convert between Unix timestamp and readable date',
				component: 'EpochDateConverter',
			},
			{
				id: 'now-converter',
				name: 'Now → UTC / IST / Custom TZ',
				icon: 'clock',
				description: 'Convert current time to different timezones',
				component: 'NowConverter',
			},
			{
				id: 'time-calculator',
				name: 'Add / subtract time',
				icon: 'clock',
				description: 'Calculate time with offsets (e.g., now + 2h 15m)',
				component: 'TimeCalculator',
			},
			{
				id: 'iso-formatter',
				name: 'ISO string formatter',
				icon: 'clock',
				description: 'Format and parse ISO date strings',
				component: 'IsoFormatter',
			},
			{
				id: 'cron-to-human',
				name: 'Cron expression → human text',
				icon: 'clock',
				description: 'Convert cron expression to human readable',
				component: 'CronToHuman',
			},
			{
				id: 'human-to-cron',
				name: 'Human text → cron',
				icon: 'clock',
				description: 'Convert human text to cron expression (basic)',
				component: 'HumanToCron',
			},
		],
	},
	{
		id: 'text',
		name: 'Text Helpers',
		icon: 'type',
		description: 'Text manipulation and formatting tools',
		tools: [
			{
				id: 'text-trim',
				name: 'Trim whitespace',
				icon: 'type',
				description: 'Remove leading and trailing whitespace',
				component: 'TextTrim',
			},
			{
				id: 'text-remove-newlines',
				name: 'Remove newlines',
				icon: 'type',
				description: 'Remove all newline characters',
				component: 'TextRemoveNewlines',
			},
			{
				id: 'text-normalize-line-endings',
				name: 'Normalize line endings',
				icon: 'type',
				description: 'Convert line endings to consistent format',
				component: 'TextNormalizeLineEndings',
			},
			{
				id: 'text-tabs-spaces',
				name: 'Convert tabs ↔ spaces',
				icon: 'type',
				description: 'Convert between tabs and spaces',
				component: 'TextTabsSpaces',
			},
			{
				id: 'slug-generator',
				name: 'Slug generator',
				icon: 'type',
				description: 'Generate URL-friendly slugs from text',
				component: 'SlugGenerator',
			},
			{
				id: 'random-string',
				name: 'Random string generator',
				icon: 'type',
				description: 'Generate random strings',
				component: 'RandomString',
			},
		],
	},
	{
		id: 'case',
		name: 'Case Conversion',
		icon: 'caseSensitive',
		description: 'Convert text between different case styles',
		tools: [
			{
				id: 'case-converter',
				name: 'Case Converter',
				icon: 'caseSensitive',
				description: 'Convert between camelCase, snake_case, kebab-case, PascalCase, etc.',
				component: 'CaseConverter',
			},
		],
	},
	{
		id: 'http',
		name: 'HTTP / Network Utilities',
		icon: 'network',
		description: 'HTTP headers, requests, and network utilities',
		tools: [
			{
				id: 'curl-parser',
				name: 'Curl Parser',
				icon: 'network',
				description:
					'Parse curl commands and extract method, URL, headers, authorization, body, and more',
				component: 'CurlParser',
			},
			{
				id: 'http-headers-formatter',
				name: 'Format HTTP headers',
				icon: 'network',
				description: 'Format and prettify HTTP headers',
				component: 'HttpHeadersFormatter',
			},
			{
				id: 'query-params-converter',
				name: 'Query Params ↔ Object Converter',
				icon: 'code',
				description: 'Convert between query string and object',
				component: 'QueryParamsConverter',
			},
		],
	},
	{
		id: 'misc',
		name: 'Misc Tools',
		icon: 'wrench',
		description: 'Miscellaneous utility tools',
		tools: [
			{
				id: 'uuid-generator',
				name: 'UUID v4 generator',
				icon: 'code',
				description: 'Generate UUID v4',
				component: 'UuidGenerator',
			},
			{
				id: 'nanoid-generator',
				name: 'NanoID generator',
				icon: 'code',
				description: 'Generate NanoID',
				component: 'NanoIdGenerator',
			},
			{
				id: 'random-color',
				name: 'Random color',
				icon: 'wrench',
				description: 'Generate random colors (hex / rgb)',
				component: 'RandomColor',
			},
			{
				id: 'file-size-formatter',
				name: 'File size formatter',
				icon: 'wrench',
				description: 'Format file sizes',
				component: 'FileSizeFormatter',
			},
			{
				id: 'bytes-converter',
				name: 'Bytes ↔ KB / MB / GB',
				icon: 'wrench',
				description: 'Convert between bytes and units',
				component: 'BytesConverter',
			},
		],
	},
];

export const utilityIconMap: Record<string, LucideIcon> = {
	fileJson: FileJson,
	key: Key,
	lock: Lock,
	clock: Clock,
	type: Type,
	caseSensitive: CaseSensitive,
	network: Network,
	wrench: Wrench,
	code: Code,
};

// Helper to get tool by ID
export const getToolById = (toolId: string): Tool | undefined => {
	for (const group of TOOL_GROUPS) {
		const tool = group.tools.find((t) => t.id === toolId);
		if (tool) return tool;
	}
	return undefined;
};

// Helper to get tool group by ID
export const getToolGroupById = (groupId: string): ToolGroup | undefined => {
	return TOOL_GROUPS.find((group) => group.id === groupId);
};

// Helper to get tool group by tool ID
export const getToolGroupByToolId = (toolId: string): ToolGroup | undefined => {
	return TOOL_GROUPS.find((group) => group.tools.some((tool) => tool.id === toolId));
};
