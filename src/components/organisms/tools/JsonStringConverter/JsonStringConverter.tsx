import { CodeEditor, CodeViewer, ErrorDisplay } from '@/components/molecules';
import { UtilityToolCard } from '@/components/organisms';
import { Button } from '@/components/ui/button';
import { jsonToString, stringToJson } from '@/lib/utilityTools';
import { useState } from 'react';

const JsonStringConverter = () => {
	const [input, setInput] = useState('');
	const [output, setOutput] = useState('');
	const [error, setError] = useState<string>();
	const [isStringToJson, setIsStringToJson] = useState(false);

	const handleTransform = () => {
		const result = isStringToJson ? stringToJson(input) : jsonToString(input);
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
		setIsStringToJson(!isStringToJson);
	};

	const title = isStringToJson ? 'String → JSON' : 'JSON → String';
	const description = isStringToJson
		? 'Convert escaped string to JSON'
		: 'Convert JSON to escaped string';

	return (
		<UtilityToolCard
			title={title}
			description={description}
			input={
				<CodeEditor
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onClear={handleClear}
					placeholder={isStringToJson ? 'Escaped string...' : 'JSON object...'}
				/>
			}
			output={<CodeViewer value={output} />}
			error={<ErrorDisplay error={error} />}
			canToggle={true}
			onToggle={handleToggle}
			actions={
				<Button onClick={handleTransform} variant='gradient' size='sm'>
					Convert
				</Button>
			}
		/>
	);
};

export default JsonStringConverter;
