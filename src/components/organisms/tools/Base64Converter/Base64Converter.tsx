import { CodeEditor, CodeViewer, ErrorDisplay } from '@/components/molecules';
import { UtilityToolCard } from '@/components/organisms';
import { Button } from '@/components/ui/button';
import { base64Decode, base64Encode } from '@/lib/utilityTools';
import { useEffect, useState } from 'react';

const Base64Converter = () => {
	const [input, setInput] = useState('');
	const [output, setOutput] = useState('');
	const [error, setError] = useState<string>();
	const [isDecode, setIsDecode] = useState(false);

	useEffect(() => {
		if (input) {
			if (isDecode) {
				const result = base64Decode(input);
				if (result.error) {
					setError(result.error);
					setOutput('');
				} else {
					setError(undefined);
					setOutput(result.result);
				}
			} else {
				setError(undefined);
				setOutput(base64Encode(input));
			}
		} else {
			setError(undefined);
			setOutput('');
		}
	}, [input, isDecode]);

	const handleClear = () => {
		setInput('');
		setOutput('');
		setError(undefined);
	};

	const handleToggle = () => {
		setIsDecode(!isDecode);
	};

	const title = isDecode ? 'Base64 Decode' : 'Base64 Encode';
	const description = isDecode ? 'Decode Base64 to text' : 'Encode text to Base64';

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
				<Button onClick={handleClear} variant='outline' size='sm'>
					Clear
				</Button>
			}
		/>
	);
};

export default Base64Converter;
