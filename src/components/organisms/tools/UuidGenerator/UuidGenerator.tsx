import { CodeViewer } from '@/components/molecules';
import { UtilityToolCard } from '@/components/organisms';
import { Button } from '@/components/ui/button';
import { generateUuid } from '@/lib/utilityTools';
import { useState } from 'react';

const UuidGenerator = () => {
	const [output, setOutput] = useState('');

	const handleGenerate = () => {
		setOutput(generateUuid());
	};

	return (
		<UtilityToolCard
			title='UUID v4 generator'
			description='Generate UUID v4'
			input={
				<div className='p-4 rounded-md bg-white/5 border border-glass-border text-center'>
					<p className='text-text-secondary text-sm'>Click generate to create a new UUID</p>
				</div>
			}
			output={<CodeViewer value={output} />}
			actions={
				<Button onClick={handleGenerate} variant='gradient' size='sm'>
					Generate UUID
				</Button>
			}
		/>
	);
};

export default UuidGenerator;
