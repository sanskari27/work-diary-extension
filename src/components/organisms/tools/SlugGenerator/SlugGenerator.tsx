import { CodeEditor, CodeViewer } from '@/components/molecules';
import { UtilityToolCard } from '@/components/organisms';
import { Button } from '@/components/ui/button';
import { generateSlug } from '@/lib/utilityTools';
import { useEffect, useState } from 'react';

const SlugGenerator = () => {
	const [input, setInput] = useState('');
	const [output, setOutput] = useState('');

	useEffect(() => {
		if (input) {
			setOutput(generateSlug(input));
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
			title='Slug generator'
			description='Generate URL-friendly slugs from text'
			input={
				<CodeEditor
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onClear={handleClear}
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

export default SlugGenerator;
