import { CodeViewer } from '@/components/molecules';
import { UtilityToolCard } from '@/components/organisms';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generateRandomString } from '@/lib/utilityTools';
import { useState } from 'react';

const RandomString = () => {
	const [length, setLength] = useState('16');
	const [includeNumbers, setIncludeNumbers] = useState(true);
	const [includeSymbols, setIncludeSymbols] = useState(false);
	const [output, setOutput] = useState('');

	const handleGenerate = () => {
		const len = parseInt(length) || 16;
		setOutput(generateRandomString(len, includeNumbers, includeSymbols));
	};

	return (
		<UtilityToolCard
			title='Random string generator'
			description='Generate random strings'
			input={
				<div className='space-y-3'>
					<div>
						<Label className='text-text-secondary text-sm mb-1 block'>Length</Label>
						<Input
							type='number'
							value={length}
							onChange={(e) => setLength(e.target.value)}
							className='bg-white/5 border-glass-border text-white'
						/>
					</div>
					<div className='space-y-2'>
						<div className='flex items-center gap-2'>
							<Checkbox
								id='numbers'
								checked={includeNumbers}
								onCheckedChange={(checked) => setIncludeNumbers(checked === true)}
							/>
							<Label htmlFor='numbers' className='text-text-secondary text-sm cursor-pointer'>
								Include numbers
							</Label>
						</div>
						<div className='flex items-center gap-2'>
							<Checkbox
								id='symbols'
								checked={includeSymbols}
								onCheckedChange={(checked) => setIncludeSymbols(checked === true)}
							/>
							<Label htmlFor='symbols' className='text-text-secondary text-sm cursor-pointer'>
								Include symbols
							</Label>
						</div>
					</div>
				</div>
			}
			output={<CodeViewer value={output} />}
			actions={
				<Button onClick={handleGenerate} variant='gradient' size='sm'>
					Generate
				</Button>
			}
		/>
	);
};

export default RandomString;
