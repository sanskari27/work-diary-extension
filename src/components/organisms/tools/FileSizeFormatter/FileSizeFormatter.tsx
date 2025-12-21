import { CodeViewer } from '@/components/molecules';
import { UtilityToolCard } from '@/components/organisms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatFileSize } from '@/lib/utilityTools';
import { useState } from 'react';

const FileSizeFormatter = () => {
	const [input, setInput] = useState('');
	const [output, setOutput] = useState('');

	const handleFormat = () => {
		const bytes = parseInt(input) || 0;
		setOutput(formatFileSize(bytes));
	};

	const handleClear = () => {
		setInput('');
		setOutput('');
	};

	return (
		<UtilityToolCard
			title='File size formatter'
			description='Format file sizes'
			input={
				<Input
					type='number'
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder='Bytes'
					className='bg-white/5 border-glass-border text-white placeholder:text-white/40'
				/>
			}
			output={<CodeViewer value={output} />}
			actions={
				<Button onClick={handleFormat} variant='gradient' size='sm'>
					Format
				</Button>
			}
		/>
	);
};

export default FileSizeFormatter;
