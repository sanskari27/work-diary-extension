import { CodeEditor, CodeViewer, ErrorDisplay } from '@/components/molecules';
import { UtilityToolCard } from '@/components/organisms';
import { Button } from '@/components/ui/button';
import { minifyJson, prettyPrintJson } from '@/lib/utilityTools';
import { useState } from 'react';

const JsonPrettyMinify = () => {
	const [input, setInput] = useState('');
	const [output, setOutput] = useState('');
	const [error, setError] = useState<string>();
	const [isMinify, setIsMinify] = useState(false);

	const handleTransform = () => {
		const result = isMinify ? minifyJson(input) : prettyPrintJson(input);
		if (result.error) {
			setError(result.error);
			setOutput('');
		} else {
			setError(undefined);
			setOutput(result.result);
		}
	};

	const handleClear = () => {
		setInput('');
		setOutput('');
		setError(undefined);
	};

	const handleToggle = () => {
		setIsMinify(!isMinify);
	};

	const title = isMinify ? 'Minify JSON' : 'Pretty Print JSON';
	const description = isMinify
		? 'Remove whitespace from JSON'
		: 'Format JSON with proper indentation';

	return (
		<UtilityToolCard
			title={title}
			description={description}
			input={
				<CodeEditor
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onClear={handleClear}
					rows={12}
				/>
			}
			output={<CodeViewer value={output} />}
			error={<ErrorDisplay error={error} />}
			canToggle={true}
			onToggle={handleToggle}
			actions={
				<Button onClick={handleTransform} variant='gradient' size='sm'>
					{isMinify ? 'Minify' : 'Format'} JSON
				</Button>
			}
		/>
	);
};

export default JsonPrettyMinify;
