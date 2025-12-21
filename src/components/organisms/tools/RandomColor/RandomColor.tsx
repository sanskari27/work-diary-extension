import { CodeViewer } from '@/components/molecules';
import { UtilityToolCard } from '@/components/organisms';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { generateRandomColor } from '@/lib/utilityTools';
import { useState } from 'react';

const RandomColor = () => {
	const [format, setFormat] = useState<'hex' | 'rgb'>('hex');
	const [output, setOutput] = useState('');

	const handleGenerate = () => {
		setOutput(generateRandomColor(format));
	};

	return (
		<UtilityToolCard
			title='Random color'
			description='Generate random colors (hex / rgb)'
			input={
				<div className='space-y-3'>
					<Select value={format} onValueChange={(v) => setFormat(v as 'hex' | 'rgb')}>
						<SelectTrigger className='bg-white/5 border-glass-border text-white'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='hex'>Hex</SelectItem>
							<SelectItem value='rgb'>RGB</SelectItem>
						</SelectContent>
					</Select>
					{output && (
						<div
							className='w-full h-20 rounded-md border border-glass-border'
							style={{ backgroundColor: output }}
						/>
					)}
				</div>
			}
			output={<CodeViewer value={output} />}
			actions={
				<Button onClick={handleGenerate} variant='gradient' size='sm'>
					Generate Color
				</Button>
			}
		/>
	);
};

export default RandomColor;
