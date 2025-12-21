import { CodeEditor, CodeViewer, ErrorDisplay } from '@/components/molecules';
import { UtilityToolCard } from '@/components/organisms';
import { Button } from '@/components/ui/button';
import { cronToHuman } from '@/lib/utilityTools';
import { useState } from 'react';

const CronToHuman = () => {
	const [input, setInput] = useState('');
	const [output, setOutput] = useState('');
	const [error, setError] = useState<string>();

	const handleConvert = () => {
		const result = cronToHuman(input);
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
			title='Cron expression → human text'
			description='Convert cron expression to human readable'
			input={
				<CodeEditor
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onClear={handleClear}
					rows={8}
					placeholder='0 0 * * *'
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

export default CronToHuman;
