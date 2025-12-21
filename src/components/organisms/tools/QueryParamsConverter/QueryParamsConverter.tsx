import { CodeEditor, CodeViewer, ErrorDisplay } from '@/components/molecules';
import { UtilityToolCard } from '@/components/organisms';
import { Button } from '@/components/ui/button';
import { objectToQueryParams, queryParamsToObject } from '@/lib/utilityTools';
import { useState } from 'react';

const QueryParamsConverter = () => {
	const [input, setInput] = useState('');
	const [output, setOutput] = useState('');
	const [error, setError] = useState<string>();
	const [isObjectToParams, setIsObjectToParams] = useState(false);

	const handleConvert = () => {
		const result = isObjectToParams ? objectToQueryParams(input) : queryParamsToObject(input);
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
		setIsObjectToParams(!isObjectToParams);
	};

	const title = isObjectToParams ? 'Object → Query Params' : 'Query Params → Object';
	const description = isObjectToParams
		? 'Convert object to query string'
		: 'Parse query string to object';

	return (
		<UtilityToolCard
			title={title}
			description={description}
			input={
				<CodeEditor
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onClear={handleClear}
					placeholder={
						isObjectToParams ? '{"key1":"value1","key2":"value2"}' : '?key1=value1&key2=value2'
					}
				/>
			}
			output={<CodeViewer value={output} />}
			error={<ErrorDisplay error={error} />}
			canToggle={true}
			onToggle={handleToggle}
			actions={
				<Button onClick={handleConvert} variant='gradient' size='sm'>
					Convert
				</Button>
			}
		/>
	);
};

export default QueryParamsConverter;
