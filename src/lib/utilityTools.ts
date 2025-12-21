/**
 * Utility functions for all utility tools
 */

// ==================== JSON Tools ====================

export const prettyPrintJson = (json: string): { result: string; error?: string } => {
	try {
		const parsed = JSON.parse(json);
		return { result: JSON.stringify(parsed, null, 2) };
	} catch (error) {
		return { result: '', error: error instanceof Error ? error.message : 'Invalid JSON' };
	}
};

export const minifyJson = (json: string): { result: string; error?: string } => {
	try {
		const parsed = JSON.parse(json);
		return { result: JSON.stringify(parsed) };
	} catch (error) {
		return { result: '', error: error instanceof Error ? error.message : 'Invalid JSON' };
	}
};

export const validateJson = (
	json: string
): { valid: boolean; error?: string; line?: number; column?: number } => {
	try {
		JSON.parse(json);
		return { valid: true };
	} catch (error) {
		if (error instanceof SyntaxError) {
			const match = error.message.match(/position (\d+)/);
			const position = match ? parseInt(match[1], 10) : 0;
			const lines = json.substring(0, position).split('\n');
			const line = lines.length;
			const column = lines[lines.length - 1].length + 1;
			return { valid: false, error: error.message, line, column };
		}
		return { valid: false, error: error instanceof Error ? error.message : 'Invalid JSON' };
	}
};

export const sortJsonKeys = (json: string): { result: string; error?: string } => {
	try {
		const parsed = JSON.parse(json);
		const sorted = sortObjectKeys(parsed);
		return { result: JSON.stringify(sorted, null, 2) };
	} catch (error) {
		return { result: '', error: error instanceof Error ? error.message : 'Invalid JSON' };
	}
};

const sortObjectKeys = (obj: any): any => {
	if (Array.isArray(obj)) {
		return obj.map((item) => sortObjectKeys(item));
	}
	if (obj !== null && typeof obj === 'object') {
		const sorted: any = {};
		Object.keys(obj)
			.sort()
			.forEach((key) => {
				sorted[key] = sortObjectKeys(obj[key]);
			});
		return sorted;
	}
	return obj;
};

export const removeNullsFromJson = (json: string): { result: string; error?: string } => {
	try {
		const parsed = JSON.parse(json);
		const cleaned = removeNulls(parsed);
		return { result: JSON.stringify(cleaned, null, 2) };
	} catch (error) {
		return { result: '', error: error instanceof Error ? error.message : 'Invalid JSON' };
	}
};

const removeNulls = (obj: any): any => {
	if (Array.isArray(obj)) {
		return obj
			.map((item) => removeNulls(item))
			.filter((item) => item !== null && item !== undefined);
	}
	if (obj !== null && typeof obj === 'object') {
		const cleaned: any = {};
		Object.keys(obj).forEach((key) => {
			const value = obj[key];
			if (value !== null && value !== undefined) {
				cleaned[key] = removeNulls(value);
			}
		});
		return cleaned;
	}
	return obj;
};

export const pickOmitJsonFields = (
	json: string,
	fields: string[],
	mode: 'pick' | 'omit'
): { result: string; error?: string } => {
	try {
		const parsed = JSON.parse(json);
		const result = mode === 'pick' ? pickFields(parsed, fields) : omitFields(parsed, fields);
		return { result: JSON.stringify(result, null, 2) };
	} catch (error) {
		return { result: '', error: error instanceof Error ? error.message : 'Invalid JSON' };
	}
};

const pickFields = (obj: any, fields: string[]): any => {
	if (Array.isArray(obj)) {
		return obj.map((item) => pickFields(item, fields));
	}
	if (obj !== null && typeof obj === 'object') {
		const picked: any = {};
		fields.forEach((field) => {
			if (field in obj) {
				picked[field] = obj[field];
			}
		});
		return picked;
	}
	return obj;
};

const omitFields = (obj: any, fields: string[]): any => {
	if (Array.isArray(obj)) {
		return obj.map((item) => omitFields(item, fields));
	}
	if (obj !== null && typeof obj === 'object') {
		const omitted: any = {};
		Object.keys(obj).forEach((key) => {
			if (!fields.includes(key)) {
				omitted[key] = omitFields(obj[key], fields);
			}
		});
		return omitted;
	}
	return obj;
};

export const jsonToString = (json: string): { result: string; error?: string } => {
	try {
		const parsed = JSON.parse(json);
		const stringified = JSON.stringify(parsed);
		// Escape for use in JavaScript strings
		return { result: stringified.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"') };
	} catch (error) {
		return { result: '', error: error instanceof Error ? error.message : 'Invalid JSON' };
	}
};

export const stringToJson = (str: string): { result: string; error?: string } => {
	try {
		// Unescape the string
		const unescaped = str.replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\\\/g, '\\');
		const parsed = JSON.parse(unescaped);
		return { result: JSON.stringify(parsed, null, 2) };
	} catch (error) {
		return { result: '', error: error instanceof Error ? error.message : 'Invalid string' };
	}
};

/**
 * Safely converts JavaScript object literal to JSON without using eval
 * This parser handles basic JavaScript object literals without requiring 'unsafe-eval'
 * Note: This is a simplified parser that handles common cases but may not support all JavaScript features
 */
const parseJavaScriptObject = (code: string): any => {
	let cleaned = code.trim();

	// Remove variable declarations and assignments
	cleaned = cleaned.replace(/^(const|let|var)\s+\w+\s*=\s*/i, '');
	cleaned = cleaned.replace(/;?\s*$/, '');

	// Remove comments (single-line and multi-line)
	cleaned = cleaned.replace(/\/\/.*$/gm, '');
	cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');

	// Process character by character to properly handle strings
	let result = '';
	let inString = false;
	let stringChar = '';
	let escapeNext = false;

	for (let i = 0; i < cleaned.length; i++) {
		const char = cleaned[i];

		if (escapeNext) {
			result += char;
			escapeNext = false;
			continue;
		}

		if (char === '\\') {
			escapeNext = true;
			result += char;
			continue;
		}

		// Handle string boundaries
		if ((char === '"' || char === "'") && !escapeNext) {
			if (!inString) {
				inString = true;
				stringChar = char;
				result += '"'; // Always use double quotes in JSON
			} else if (char === stringChar) {
				inString = false;
				stringChar = '';
				result += '"';
			} else {
				result += char;
			}
			continue;
		}

		// Process non-string content
		if (!inString) {
			// Remove trailing commas
			if (char === ',' && /^\s*[}\]]/.test(cleaned.substring(i + 1))) {
				continue;
			}

			// Convert undefined to null
			if (
				cleaned.substring(i).startsWith('undefined') &&
				!/[a-zA-Z0-9_]/.test(cleaned[i + 9] || '')
			) {
				result += 'null';
				i += 'undefined'.length - 1;
				continue;
			}

			// Convert unquoted keys to quoted keys
			// Look for pattern: {key: or ,key:
			const keyMatch = cleaned.substring(i).match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/);
			if (keyMatch) {
				const beforeKey = i === 0 ? '' : cleaned.substring(Math.max(0, i - 10), i);
				if (i === 0 || /[{,]\s*$/.test(beforeKey)) {
					result += `"${keyMatch[1]}":`;
					i += keyMatch[0].length - 1;
					continue;
				}
			}
		}

		result += char;
	}

	// Try to parse as JSON
	try {
		return JSON.parse(result);
	} catch (parseError) {
		throw new Error(
			'Unable to parse JavaScript object. Please ensure it is a valid object literal. Complex JavaScript features may not be supported.'
		);
	}
};

export const javascriptToJson = (jsCode: string): { result: string; error?: string } => {
	try {
		const result = parseJavaScriptObject(jsCode);
		return { result: JSON.stringify(result, null, 2) };
	} catch (error) {
		return {
			result: '',
			error: error instanceof Error ? error.message : 'Invalid JavaScript object',
		};
	}
};

// ==================== JWT Tools ====================

export const decodeJwt = (token: string): { header: any; payload: any; error?: string } => {
	try {
		const parts = token.split('.');
		if (parts.length !== 3) {
			return { header: null, payload: null, error: 'Invalid JWT format' };
		}

		const base64UrlDecode = (str: string): string => {
			let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
			while (base64.length % 4) {
				base64 += '=';
			}
			try {
				return decodeURIComponent(
					atob(base64)
						.split('')
						.map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
						.join('')
				);
			} catch {
				return '';
			}
		};

		const header = JSON.parse(base64UrlDecode(parts[0]));
		const payload = JSON.parse(base64UrlDecode(parts[1]));

		return { header, payload };
	} catch (error) {
		return {
			header: null,
			payload: null,
			error: error instanceof Error ? error.message : 'Failed to decode JWT',
		};
	}
};

export const checkJwtExpiry = (
	token: string
): { expired: boolean; expiresAt?: number; error?: string } => {
	try {
		const decoded = decodeJwt(token);
		if (decoded.error) {
			return { expired: false, error: decoded.error };
		}

		const exp = decoded.payload?.exp;
		if (!exp) {
			return { expired: false, error: 'No expiration claim found' };
		}

		const expiresAt = exp * 1000; // Convert to milliseconds
		const now = Date.now();
		return { expired: now >= expiresAt, expiresAt };
	} catch (error) {
		return {
			expired: false,
			error: error instanceof Error ? error.message : 'Failed to check expiry',
		};
	}
};

export const getJwtIssuedAt = (token: string): { issuedAt?: number; error?: string } => {
	try {
		const decoded = decodeJwt(token);
		if (decoded.error) {
			return { error: decoded.error };
		}

		const iat = decoded.payload?.iat;
		if (!iat) {
			return { error: 'No issued-at claim found' };
		}

		return { issuedAt: iat * 1000 }; // Convert to milliseconds
	} catch (error) {
		return { error: error instanceof Error ? error.message : 'Failed to get issued-at time' };
	}
};

export const base64UrlDecode = (str: string): { result: string; error?: string } => {
	try {
		let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
		while (base64.length % 4) {
			base64 += '=';
		}
		const decoded = atob(base64);
		return { result: decoded };
	} catch (error) {
		return { result: '', error: error instanceof Error ? error.message : 'Failed to decode' };
	}
};

export const reencodeJwtPayload = (
	token: string,
	newPayload: string
): { result: string; error?: string } => {
	try {
		const parts = token.split('.');
		if (parts.length !== 3) {
			return { result: '', error: 'Invalid JWT format' };
		}

		const base64UrlEncode = (str: string): string => {
			return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
		};

		const parsedPayload = JSON.parse(newPayload);
		const encodedPayload = base64UrlEncode(JSON.stringify(parsedPayload));

		// Return header.payload.signature (signature is not validated, just preserved)
		return { result: `${parts[0]}.${encodedPayload}.${parts[2]}` };
	} catch (error) {
		return { result: '', error: error instanceof Error ? error.message : 'Failed to re-encode' };
	}
};

// ==================== Encoding Tools ====================

export const base64Encode = (text: string): string => {
	return btoa(unescape(encodeURIComponent(text)));
};

export const base64Decode = (base64: string): { result: string; error?: string } => {
	try {
		return { result: decodeURIComponent(escape(atob(base64))) };
	} catch (error) {
		return { result: '', error: error instanceof Error ? error.message : 'Invalid Base64' };
	}
};

export const urlEncode = (text: string): string => {
	return encodeURIComponent(text);
};

export const urlDecode = (text: string): { result: string; error?: string } => {
	try {
		return { result: decodeURIComponent(text) };
	} catch (error) {
		return { result: '', error: error instanceof Error ? error.message : 'Invalid URL encoding' };
	}
};

export const htmlEscape = (text: string): string => {
	const map: Record<string, string> = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;',
	};
	return text.replace(/[&<>"']/g, (m) => map[m]);
};

export const htmlUnescape = (text: string): string => {
	const map: Record<string, string> = {
		'&amp;': '&',
		'&lt;': '<',
		'&gt;': '>',
		'&quot;': '"',
		'&#39;': "'",
		'&#x27;': "'",
		'&#x2F;': '/',
	};
	return text.replace(/&(amp|lt|gt|quot|#39|#x27|#x2F);/g, (m) => map[m] || m);
};

export const unicodeEscape = (text: string): string => {
	return text
		.split('')
		.map((char) => {
			const code = char.charCodeAt(0);
			if (code > 127) {
				return '\\u' + ('0000' + code.toString(16)).slice(-4);
			}
			return char;
		})
		.join('');
};

export const unicodeDecode = (text: string): { result: string; error?: string } => {
	try {
		return {
			result: text.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
				String.fromCharCode(parseInt(hex, 16))
			),
		};
	} catch (error) {
		return {
			result: '',
			error: error instanceof Error ? error.message : 'Invalid Unicode escape sequence',
		};
	}
};

export const hexEncode = (text: string): string => {
	return text
		.split('')
		.map((char) => char.charCodeAt(0).toString(16).padStart(2, '0'))
		.join('');
};

export const hexDecode = (hex: string): { result: string; error?: string } => {
	try {
		if (!/^[0-9a-fA-F]*$/.test(hex)) {
			return { result: '', error: 'Invalid hexadecimal string' };
		}
		if (hex.length % 2 !== 0) {
			return { result: '', error: 'Hexadecimal string must have even length' };
		}
		const result =
			hex
				.match(/.{1,2}/g)
				?.map((byte) => String.fromCharCode(parseInt(byte, 16)))
				.join('') || '';
		return { result };
	} catch (error) {
		return { result: '', error: error instanceof Error ? error.message : 'Failed to decode hex' };
	}
};

// ==================== Time Tools ====================

export const epochToDate = (epoch: string): { result: string; error?: string } => {
	try {
		const timestamp = epoch.includes('.') ? parseFloat(epoch) * 1000 : parseInt(epoch, 10) * 1000;
		const date = new Date(timestamp);
		if (isNaN(date.getTime())) {
			return { result: '', error: 'Invalid timestamp' };
		}
		return { result: date.toISOString() };
	} catch (error) {
		return { result: '', error: error instanceof Error ? error.message : 'Invalid epoch' };
	}
};

export const dateToEpoch = (dateString: string): { result: string; error?: string } => {
	try {
		const date = new Date(dateString);
		if (isNaN(date.getTime())) {
			return { result: '', error: 'Invalid date string' };
		}
		return { result: Math.floor(date.getTime() / 1000).toString() };
	} catch (error) {
		return { result: '', error: error instanceof Error ? error.message : 'Invalid date' };
	}
};

export const getNowInTimezone = (timezone: string): { result: string; error?: string } => {
	try {
		const now = new Date();
		const formatter = new Intl.DateTimeFormat('en-US', {
			timeZone: timezone,
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: false,
		});
		return { result: formatter.format(now) };
	} catch (error) {
		return { result: '', error: error instanceof Error ? error.message : 'Invalid timezone' };
	}
};

export const calculateTime = (
	baseTime: string,
	offset: string
): { result: string; error?: string } => {
	try {
		// Parse offset like "2h 15m" or "+2h 15m"
		const offsetRegex = /([+-]?)(\d+)h\s*(\d+)?m?/i;
		const match = offset.match(offsetRegex);
		if (!match) {
			return { result: '', error: 'Invalid offset format. Use format like "2h 15m" or "+2h 15m"' };
		}

		const sign = match[1] === '-' ? -1 : 1;
		const hours = parseInt(match[2], 10) * sign;
		const minutes = match[3] ? parseInt(match[3], 10) * sign : 0;

		const base = baseTime === 'now' ? new Date() : new Date(baseTime);
		if (isNaN(base.getTime())) {
			return { result: '', error: 'Invalid base time' };
		}

		const result = new Date(base);
		result.setHours(result.getHours() + hours);
		result.setMinutes(result.getMinutes() + minutes);

		return { result: result.toISOString() };
	} catch (error) {
		return {
			result: '',
			error: error instanceof Error ? error.message : 'Failed to calculate time',
		};
	}
};

export const formatIsoString = (dateString: string): { result: string; error?: string } => {
	try {
		const date = new Date(dateString);
		if (isNaN(date.getTime())) {
			return { result: '', error: 'Invalid date string' };
		}
		return { result: date.toISOString() };
	} catch (error) {
		return { result: '', error: error instanceof Error ? error.message : 'Invalid date' };
	}
};

export const cronToHuman = (cron: string): { result: string; error?: string } => {
	try {
		const parts = cron.trim().split(/\s+/);
		if (parts.length !== 5) {
			return { result: '', error: 'Cron expression must have 5 parts' };
		}

		const [minute, hour, day, month, weekday] = parts;

		const descriptions: string[] = [];

		// Minute
		if (minute === '*') {
			descriptions.push('every minute');
		} else if (minute.includes('/')) {
			const [, interval] = minute.split('/');
			descriptions.push(`every ${interval} minutes`);
		} else {
			descriptions.push(`at minute ${minute}`);
		}

		// Hour
		if (hour === '*') {
			descriptions.push('every hour');
		} else if (hour.includes('/')) {
			const [, interval] = hour.split('/');
			descriptions.push(`every ${interval} hours`);
		} else {
			descriptions.push(`at hour ${hour}`);
		}

		// Day
		if (day === '*') {
			descriptions.push('every day');
		} else if (day.includes('/')) {
			const [, interval] = day.split('/');
			descriptions.push(`every ${interval} days`);
		} else {
			descriptions.push(`on day ${day}`);
		}

		// Month
		if (month === '*') {
			descriptions.push('every month');
		} else if (month.includes('/')) {
			const [, interval] = month.split('/');
			descriptions.push(`every ${interval} months`);
		} else {
			descriptions.push(`in month ${month}`);
		}

		// Weekday
		if (weekday === '*') {
			descriptions.push('every weekday');
		} else if (weekday.includes('/')) {
			const [, interval] = weekday.split('/');
			descriptions.push(`every ${interval} weekdays`);
		} else {
			descriptions.push(`on weekday ${weekday}`);
		}

		return { result: descriptions.join(', ') };
	} catch (error) {
		return {
			result: '',
			error: error instanceof Error ? error.message : 'Invalid cron expression',
		};
	}
};

export const humanToCron = (description: string): { result: string; error?: string } => {
	// Basic implementation - can be expanded
	try {
		const lower = description.toLowerCase();
		if (lower.includes('every minute')) {
			return { result: '* * * * *' };
		}
		if (lower.includes('every hour')) {
			return { result: '0 * * * *' };
		}
		if (lower.includes('every day')) {
			return { result: '0 0 * * *' };
		}
		return { result: '', error: 'Basic human-to-cron conversion. More patterns coming soon.' };
	} catch (error) {
		return { result: '', error: error instanceof Error ? error.message : 'Failed to convert' };
	}
};

// ==================== Text Tools ====================

export const trimWhitespace = (text: string): string => {
	return text.trim();
};

export const removeNewlines = (text: string): string => {
	return text.replace(/\r?\n/g, '');
};

export const normalizeLineEndings = (text: string, target: 'lf' | 'crlf' | 'cr'): string => {
	const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
	if (target === 'lf') {
		return normalized;
	}
	if (target === 'crlf') {
		return normalized.replace(/\n/g, '\r\n');
	}
	return normalized.replace(/\n/g, '\r');
};

export const convertTabsSpaces = (
	text: string,
	from: 'tabs' | 'spaces',
	to: 'tabs' | 'spaces',
	spacesPerTab = 4
): string => {
	if (from === 'tabs' && to === 'spaces') {
		return text.replace(/\t/g, ' '.repeat(spacesPerTab));
	}
	if (from === 'spaces' && to === 'tabs') {
		return text.replace(new RegExp(' '.repeat(spacesPerTab), 'g'), '\t');
	}
	return text;
};

export const generateSlug = (text: string): string => {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '')
		.replace(/[\s_-]+/g, '-')
		.replace(/^-+|-+$/g, '');
};

export const generateRandomString = (
	length: number,
	includeNumbers = true,
	includeSymbols = false
): string => {
	const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	const numbers = '0123456789';
	const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
	let pool = chars;
	if (includeNumbers) pool += numbers;
	if (includeSymbols) pool += symbols;

	let result = '';
	for (let i = 0; i < length; i++) {
		result += pool.charAt(Math.floor(Math.random() * pool.length));
	}
	return result;
};

export const searchReplace = (
	text: string,
	search: string,
	replace: string,
	useRegex = false
): { result: string; error?: string } => {
	try {
		if (useRegex) {
			const regex = new RegExp(search, 'g');
			return { result: text.replace(regex, replace) };
		}
		return {
			result: text.replace(new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace),
		};
	} catch (error) {
		return { result: '', error: error instanceof Error ? error.message : 'Invalid regex pattern' };
	}
};

// ==================== Case Conversion ====================

export const convertCase = (
	text: string,
	targetCase: 'camel' | 'snake' | 'kebab' | 'pascal' | 'upper' | 'lower' | 'sentence'
): string => {
	if (!text) return '';

	const words = text
		.replace(/([a-z])([A-Z])/g, '$1 $2')
		.replace(/[_\-\s]+/g, ' ')
		.trim()
		.split(/\s+/)
		.filter((w) => w.length > 0);

	if (words.length === 0) return '';

	switch (targetCase) {
		case 'camel':
			return (
				words[0].toLowerCase() +
				words
					.slice(1)
					.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
					.join('')
			);
		case 'snake':
			return words.map((w) => w.toLowerCase()).join('_');
		case 'kebab':
			return words.map((w) => w.toLowerCase()).join('-');
		case 'pascal':
			return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
		case 'upper':
			return words.map((w) => w.toUpperCase()).join('_');
		case 'lower':
			return words.map((w) => w.toLowerCase()).join(' ');
		case 'sentence':
			return (
				words[0].charAt(0).toUpperCase() +
				words[0].slice(1).toLowerCase() +
				' ' +
				words
					.slice(1)
					.map((w) => w.toLowerCase())
					.join(' ')
			);
		default:
			return text;
	}
};

// ==================== HTTP/Network Tools ====================

export const formatHttpHeaders = (headers: string): { result: string; error?: string } => {
	try {
		const lines = headers.split('\n').filter((line) => line.trim());
		const formatted: string[] = [];
		lines.forEach((line) => {
			if (line.includes(':')) {
				const [key, ...valueParts] = line.split(':');
				const value = valueParts.join(':').trim();
				formatted.push(`${key.trim()}: ${value}`);
			}
		});
		return { result: formatted.join('\n') };
	} catch (error) {
		return {
			result: '',
			error: error instanceof Error ? error.message : 'Failed to format headers',
		};
	}
};

export const curlToFetch = (curl: string): { result: string; error?: string } => {
	try {
		// Basic curl to fetch conversion
		const urlMatch = curl.match(/curl\s+['"]([^'"]+)['"]/);
		if (!urlMatch) {
			return { result: '', error: 'Could not parse cURL command' };
		}
		const url = urlMatch[1];
		const methodMatch = curl.match(/-X\s+(\w+)/);
		const method = methodMatch ? methodMatch[1].toUpperCase() : 'GET';

		let fetchCode = `fetch('${url}', {\n  method: '${method}',\n`;
		// Add headers if present
		const headerMatches = curl.matchAll(/-H\s+['"]([^'"]+)['"]/g);
		const headers: string[] = [];
		for (const match of headerMatches) {
			const [key, value] = match[1].split(':').map((s) => s.trim());
			headers.push(`    '${key}': '${value}'`);
		}
		if (headers.length > 0) {
			fetchCode += '  headers: {\n' + headers.join(',\n') + '\n  },\n';
		}
		fetchCode += '})';

		return { result: fetchCode };
	} catch (error) {
		return { result: '', error: error instanceof Error ? error.message : 'Failed to convert' };
	}
};

export const fetchToCurl = (fetchCode: string): { result: string; error?: string } => {
	try {
		// Basic fetch to curl conversion
		const urlMatch = fetchCode.match(/fetch\(['"]([^'"]+)['"]/);
		if (!urlMatch) {
			return { result: '', error: 'Could not parse fetch code' };
		}
		const url = urlMatch[1];
		const methodMatch = fetchCode.match(/method:\s*['"](\w+)['"]/);
		const method = methodMatch ? methodMatch[1].toUpperCase() : 'GET';

		let curl = `curl -X ${method} '${url}'`;
		const headerMatches = fetchCode.matchAll(/['"](\w+)['"]:\s*['"]([^'"]+)['"]/g);
		for (const match of headerMatches) {
			curl += ` -H '${match[1]}: ${match[2]}'`;
		}

		return { result: curl };
	} catch (error) {
		return { result: '', error: error instanceof Error ? error.message : 'Failed to convert' };
	}
};

export const queryParamsToObject = (queryString: string): { result: string; error?: string } => {
	try {
		const params = new URLSearchParams(
			queryString.startsWith('?') ? queryString.slice(1) : queryString
		);
		const obj: Record<string, string> = {};
		params.forEach((value, key) => {
			obj[key] = value;
		});
		return { result: JSON.stringify(obj, null, 2) };
	} catch (error) {
		return { result: '', error: error instanceof Error ? error.message : 'Invalid query string' };
	}
};

export const objectToQueryParams = (objString: string): { result: string; error?: string } => {
	try {
		const obj = JSON.parse(objString);
		const params = new URLSearchParams();
		Object.keys(obj).forEach((key) => {
			params.append(key, String(obj[key]));
		});
		return { result: params.toString() };
	} catch (error) {
		return { result: '', error: error instanceof Error ? error.message : 'Invalid object' };
	}
};

// ==================== Misc Tools ====================

export const generateUuid = (): string => {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
};

export const generateNanoId = (length = 21): string => {
	// Simple NanoID-like implementation
	const alphabet = 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLFGQZbfghjklqvwyzrict';
	let id = '';
	for (let i = 0; i < length; i++) {
		id += alphabet[Math.floor(Math.random() * alphabet.length)];
	}
	return id;
};

export const generateRandomPort = (min = 1024, max = 65535): number => {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const generateRandomColor = (format: 'hex' | 'rgb'): string => {
	const r = Math.floor(Math.random() * 256);
	const g = Math.floor(Math.random() * 256);
	const b = Math.floor(Math.random() * 256);
	if (format === 'hex') {
		return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
	}
	return `rgb(${r}, ${g}, ${b})`;
};

export const formatFileSize = (bytes: number): string => {
	const units = ['B', 'KB', 'MB', 'GB', 'TB'];
	let size = bytes;
	let unitIndex = 0;
	while (size >= 1024 && unitIndex < units.length - 1) {
		size /= 1024;
		unitIndex++;
	}
	return `${size.toFixed(2)} ${units[unitIndex]}`;
};

export const convertBytes = (
	value: number,
	from: string,
	to: string
): { result: string; error?: string } => {
	const units: Record<string, number> = {
		B: 1,
		KB: 1024,
		MB: 1024 * 1024,
		GB: 1024 * 1024 * 1024,
		TB: 1024 * 1024 * 1024 * 1024,
	};

	const fromMultiplier = units[from.toUpperCase()];
	const toMultiplier = units[to.toUpperCase()];

	if (!fromMultiplier || !toMultiplier) {
		return { result: '', error: 'Invalid unit' };
	}

	const bytes = value * fromMultiplier;
	const result = bytes / toMultiplier;

	return { result: result.toFixed(2) };
};
