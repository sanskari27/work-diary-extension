import { CodeEditor, CodeViewer, ErrorDisplay } from '@/components/molecules';
import { UtilityToolCard } from '@/components/organisms';
import { Button } from '@/components/ui/button';
import { hexDecode, hexEncode } from '@/lib/utilityTools';
import { useEffect, useState } from 'react';

const HexConverter = () => {
	const [input, setInput] = useState('');
	const [output, setOutput] = useState('');
	const [error, setError] = useState<string>();
	const [isDecode, setIsDecode] = useState(false);

	useEffect(() => {
		if (input) {
			if (isDecode) {
				const result = hexDecode(input);
				if (result.error) {
					setError(result.error);
					setOutput('');
				} else {
					setError(undefined);
					setOutput(result.result);
				}
			} else {
				setError(undefined);
				setOutput(hexEncode(input));
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

	const title = isDecode ? 'Hex Decode' : 'Hex Encode';
	const description = isDecode ? 'Decode hexadecimal to text' : 'Encode text to hexadecimal';

	return (
		<UtilityToolCard
			title={title}
			description={description}
			input={
				<CodeEditor
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onClear={handleClear}
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

export default HexConverter;
