import { CodeEditor, CodeViewer, ErrorDisplay } from '@/components/molecules';
import { UtilityToolCard } from '@/components/organisms';
import { Button } from '@/components/ui/button';
import { dateToEpoch, epochToDate } from '@/lib/utilityTools';
import { useState } from 'react';

const EpochDateConverter = () => {
	const [input, setInput] = useState('');
	const [output, setOutput] = useState('');
	const [error, setError] = useState<string>();
	const [isDateToEpoch, setIsDateToEpoch] = useState(false);

	const handleConvert = () => {
		const result = isDateToEpoch ? dateToEpoch(input) : epochToDate(input);
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
		setIsDateToEpoch(!isDateToEpoch);
	};

	const title = isDateToEpoch ? 'Date → Epoch' : 'Epoch → Date';
	const description = isDateToEpoch
		? 'Convert date to Unix timestamp'
		: 'Convert Unix timestamp to readable date';

	return (
		<UtilityToolCard
			title={title}
			description={description}
			input={
				<CodeEditor
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onClear={handleClear}
					rows={30}
					placeholder={isDateToEpoch ? '2024-01-01T00:00:00Z' : '1699123456'}
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

export default EpochDateConverter;
