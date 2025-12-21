import { CodeEditor, CodeViewer, ErrorDisplay } from '@/components/molecules';
import { UtilityToolCard } from '@/components/organisms';
import { Button } from '@/components/ui/button';
import { humanToCron } from '@/lib/utilityTools';
import { useState } from 'react';

const HumanToCron = () => {
	const [input, setInput] = useState('');
	const [output, setOutput] = useState('');
	const [error, setError] = useState<string>();

	const handleConvert = () => {
		const result = humanToCron(input);
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
			title='Human text → cron'
			description='Convert human text to cron expression (basic)'
			input={
				<CodeEditor
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onClear={handleClear}
					rows={8}
					placeholder='every minute'
				/>
			}
			output={<CodeViewer value={output} />}
			error={<ErrorDisplay error={error} />}
			actions={
				<Button onClick={handleConvert} variant='gradient' size='sm'>
					Convert
				</Button>
			}
		/>
	);
};

export default HumanToCron;
