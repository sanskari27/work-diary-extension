import { CodeEditor, CodeViewer } from '@/components/molecules';
import { UtilityToolCard } from '@/components/organisms';
import { Button } from '@/components/ui/button';
import { trimWhitespace } from '@/lib/utilityTools';
import { useEffect, useState } from 'react';

const TextTrim = () => {
	const [input, setInput] = useState('');
	const [output, setOutput] = useState('');

	useEffect(() => {
		if (input) {
			setOutput(trimWhitespace(input));
		} else {
			setOutput('');
		}
	}, [input]);

	const handleClear = () => {
		setInput('');
		setOutput('');
	};

	return (
		<UtilityToolCard
			title='Trim whitespace'
			description='Remove leading and trailing whitespace'
			input={
				<CodeEditor
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onClear={handleClear}
					rows={30}
				/>
			}
			output={<CodeViewer value={output} />}
			actions={
				<Button onClick={handleClear} variant='outline' size='sm'>
					Clear
				</Button>
			}
		/>
	);
};

export default TextTrim;
