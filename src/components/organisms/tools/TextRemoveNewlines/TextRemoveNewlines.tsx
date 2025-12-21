import { CodeEditor, CodeViewer } from '@/components/molecules';
import { UtilityToolCard } from '@/components/organisms';
import { Button } from '@/components/ui/button';
import { removeNewlines } from '@/lib/utilityTools';
import { useEffect, useState } from 'react';

const TextRemoveNewlines = () => {
	const [input, setInput] = useState('');
	const [output, setOutput] = useState('');

	useEffect(() => {
		if (input) {
			setOutput(removeNewlines(input));
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
			title='Remove newlines'
			description='Remove all newline characters'
			input={
				<CodeEditor
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onClear={handleClear}
					rows={12}
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

export default TextRemoveNewlines;
