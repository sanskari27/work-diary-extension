import { CodeViewer, ErrorDisplay } from '@/components/molecules';
import { UtilityToolCard } from '@/components/organisms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { calculateTime } from '@/lib/utilityTools';
import { useState } from 'react';

const TimeCalculator = () => {
	const [baseTime, setBaseTime] = useState('now');
	const [offset, setOffset] = useState('');
	const [output, setOutput] = useState('');
	const [error, setError] = useState<string>();

	const handleCalculate = () => {
		const result = calculateTime(baseTime, offset);
		if (result.error) {
			setError(result.error);
			setOutput('');
		} else {
			setError(undefined);
			setOutput(result.result);
		}
	};

	const handleClear = () => {
		setBaseTime('now');
		setOffset('');
		setOutput('');
		setError(undefined);
	};

	return (
		<UtilityToolCard
			title='Add / subtract time'
			description='Calculate time with offsets (e.g., now + 2h 15m)'
			input={
				<div className='space-y-3'>
					<div>
						<p className='text-xs text-text-secondary mb-1'>Base Time</p>
						<Input
							value={baseTime}
							onChange={(e) => setBaseTime(e.target.value)}
							placeholder='now or ISO date string'
							className='bg-white/5 border-glass-border text-white placeholder:text-white/40'
						/>
					</div>
					<div>
						<p className='text-xs text-text-secondary mb-1'>Offset (e.g., +2h 15m or -1h)</p>
						<Input
							value={offset}
							onChange={(e) => setOffset(e.target.value)}
							placeholder='+2h 15m'
							className='bg-white/5 border-glass-border text-white placeholder:text-white/40'
						/>
					</div>
				</div>
			}
			output={<CodeViewer value={output} />}
			error={<ErrorDisplay error={error} />}
			actions={
				<Button onClick={handleCalculate} variant='gradient' size='sm'>
					Calculate
				</Button>
			}
		/>
	);
};

export default TimeCalculator;
