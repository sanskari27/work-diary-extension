import { CodeEditor, CodeViewer, ErrorDisplay } from '@/components/molecules';
import { UtilityToolCard } from '@/components/organisms';
import { Button } from '@/components/ui/button';
import { formatIsoString } from '@/lib/utilityTools';
import { useState } from 'react';

const IsoFormatter = () => {
	const [input, setInput] = useState('');
	const [output, setOutput] = useState('');
	const [error, setError] = useState<string>();

	const handleFormat = () => {
		const result = formatIsoString(input);
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
			title='ISO string formatter'
			description='Format and parse ISO date strings'
			input={
				<CodeEditor
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onClear={handleClear}
					rows={30}
				/>
			}
			output={<CodeViewer value={output} />}
			error={<ErrorDisplay error={error} />}
			actions={
				<Button onClick={handleFormat} variant='gradient' size='sm'>
					Format
				</Button>
			}
		/>
	);
};

export default IsoFormatter;
