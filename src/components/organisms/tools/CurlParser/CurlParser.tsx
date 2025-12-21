import { Text } from '@/components/atoms';
import { CodeEditor, CodeViewer, ErrorDisplay } from '@/components/molecules';
import { UtilityToolCard } from '@/components/organisms';
import { Button } from '@/components/ui/button';
import { parseCurl, ParsedCurl } from '@/lib/utilityTools';
import { useEffect, useState } from 'react';

const CurlParser = () => {
	const [input, setInput] = useState('');
	const [parsed, setParsed] = useState<ParsedCurl | null>(null);
	const [error, setError] = useState<string>();

	useEffect(() => {
		if (input.trim()) {
			const result = parseCurl(input);
			if (result.error) {
				setError(result.error);
				setParsed(null);
			} else {
				setError(undefined);
				setParsed(result.result);
			}
		} else {
			setError(undefined);
			setParsed(null);
		}
	}, [input]);

	const handleClear = () => {
		setInput('');
		setParsed(null);
		setError(undefined);
	};

	const renderOutput = () => {
		if (!parsed) {
			return <CodeViewer value='' />;
		}

		return (
			<div className='space-y-4 h-full overflow-y-auto'>
				{/* Method & URL */}
				<div className='space-y-2'>
					<Text variant='p' className='text-sm font-semibold text-text-secondary'>
						Method
					</Text>
					<div className='p-3 rounded-lg bg-white/5 border border-glass-border'>
						<Text variant='span' className='text-text-accent font-mono'>
							{parsed.method}
						</Text>
					</div>
				</div>

				<div className='space-y-2'>
					<Text variant='p' className='text-sm font-semibold text-text-secondary'>
						URL
					</Text>
					<CodeViewer value={parsed.url} />
				</div>

				{/* Query Parameters */}
				{parsed.queryParams && Object.keys(parsed.queryParams).length > 0 && (
					<div className='space-y-2'>
						<Text variant='p' className='text-sm font-semibold text-text-secondary'>
							Query Parameters
						</Text>
						<CodeViewer value={JSON.stringify(parsed.queryParams, null, 2)} language='json' />
					</div>
				)}

				{/* Authorization */}
				{parsed.authorization && (
					<div className='space-y-2'>
						<Text variant='p' className='text-sm font-semibold text-text-secondary'>
							Authorization
						</Text>
						<div className='p-3 rounded-lg bg-white/5 border border-glass-border space-y-2'>
							<div>
								<Text variant='span' className='text-xs text-text-secondary'>
									Type:
								</Text>
								<Text variant='span' className='ml-2 text-text-accent font-mono'>
									{parsed.authorization.type}
								</Text>
							</div>
							<div>
								<Text variant='span' className='text-xs text-text-secondary'>
									Value:
								</Text>
								<Text variant='span' className='ml-2 text-white font-mono text-sm break-all'>
									{parsed.authorization.value}
								</Text>
							</div>
						</div>
					</div>
				)}

				{/* Headers */}
				{Object.keys(parsed.headers).length > 0 && (
					<div className='space-y-2'>
						<Text variant='p' className='text-sm font-semibold text-text-secondary'>
							Headers
						</Text>
						<CodeViewer value={JSON.stringify(parsed.headers, null, 2)} language='json' />
					</div>
				)}

				{/* Cookies */}
				{parsed.cookies && Object.keys(parsed.cookies).length > 0 && (
					<div className='space-y-2'>
						<Text variant='p' className='text-sm font-semibold text-text-secondary'>
							Cookies
						</Text>
						<CodeViewer value={JSON.stringify(parsed.cookies, null, 2)} language='json' />
					</div>
				)}

				{/* Body */}
				{parsed.body && (
					<div className='space-y-2'>
						<Text variant='p' className='text-sm font-semibold text-text-secondary'>
							Body
						</Text>
						{parsed.contentType?.includes('json') ? (
							<CodeViewer
								value={(() => {
									try {
										return JSON.stringify(JSON.parse(parsed.body), null, 2);
									} catch {
										return parsed.body;
									}
								})()}
								language='json'
							/>
						) : (
							<CodeViewer value={parsed.body} />
						)}
					</div>
				)}

				{/* User Agent */}
				{parsed.userAgent && (
					<div className='space-y-2'>
						<Text variant='p' className='text-sm font-semibold text-text-secondary'>
							User Agent
						</Text>
						<div className='p-3 rounded-lg bg-white/5 border border-glass-border'>
							<Text variant='span' className='text-white font-mono text-sm break-all'>
								{parsed.userAgent}
							</Text>
						</div>
					</div>
				)}
			</div>
		);
	};

	return (
		<UtilityToolCard
			title='Curl Parser'
			description='Parse curl commands and extract method, URL, headers, authorization, body, and more'
			input={
				<CodeEditor
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onClear={handleClear}
					placeholder={`curl -X POST https://api.example.com/users -H "Content-Type: application/json" -H "Authorization: Bearer token123" -d \'{"name":"John"}\'`}
				/>
			}
			output={renderOutput()}
			error={<ErrorDisplay error={error} />}
			actions={
				<Button onClick={handleClear} variant='outline' size='sm'>
					Clear
				</Button>
			}
		/>
	);
};

export default CurlParser;
