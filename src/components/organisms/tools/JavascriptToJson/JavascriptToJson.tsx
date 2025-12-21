import { CodeEditor, CodeViewer, ErrorDisplay } from '@/components/molecules';
import { UtilityToolCard } from '@/components/organisms';
import { Button } from '@/components/ui/button';
import { javascriptToJson } from '@/lib/utilityTools';
import { useState } from 'react';

const JavascriptToJson = () => {
	const [input, setInput] = useState('');
	const [output, setOutput] = useState('');
	const [error, setError] = useState<string>();

	const handleTransform = () => {
		const result = javascriptToJson(input);
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

	return (
		<UtilityToolCard
			title='JavaScript to JSON object'
			description='Convert JavaScript object literal to JSON'
			input={
				<CodeEditor
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onClear={handleClear}
					rows={12}
					placeholder='const obj = { key: "value", num: 123 }'
				/>
			}
			output={<CodeViewer value={output} />}
			error={<ErrorDisplay error={error} />}
			actions={
				<Button onClick={handleTransform} variant='gradient' size='sm'>
					Convert
				</Button>
			}
		/>
	);
};

export default JavascriptToJson;
