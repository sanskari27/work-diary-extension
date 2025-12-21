import { CodeViewer } from '@/components/molecules';
import { UtilityToolCard } from '@/components/organisms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateNanoId } from '@/lib/utilityTools';
import { useState } from 'react';

const NanoIdGenerator = () => {
	const [length, setLength] = useState('21');
	const [output, setOutput] = useState('');

	const handleGenerate = () => {
		const len = parseInt(length) || 21;
		setOutput(generateNanoId(len));
	};

	return (
		<UtilityToolCard
			title='NanoID generator'
			description='Generate NanoID'
			input={
				<div className='space-y-3'>
					<Input
						type='number'
						value={length}
						onChange={(e) => setLength(e.target.value)}
						placeholder='Length'
						className='bg-white/5 border-glass-border text-white placeholder:text-white/40'
					/>
				</div>
			}
			output={<CodeViewer value={output} />}
			actions={
				<Button onClick={handleGenerate} variant='gradient' size='sm'>
					Generate NanoID
				</Button>
			}
		/>
	);
};

export default NanoIdGenerator;
