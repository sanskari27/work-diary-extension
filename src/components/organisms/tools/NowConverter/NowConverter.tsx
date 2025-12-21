import { CodeViewer } from '@/components/molecules';
import { UtilityToolCard } from '@/components/organisms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getNowInTimezone } from '@/lib/utilityTools';
import { useEffect, useState } from 'react';

const NowConverter = () => {
	const [timezone, setTimezone] = useState('UTC');
	const [output, setOutput] = useState('');

	useEffect(() => {
		const result = getNowInTimezone(timezone);
		if (result.error) {
			setOutput(`Error: ${result.error}`);
		} else {
			setOutput(result.result);
		}
	}, [timezone]);

	const handleRefresh = () => {
		const result = getNowInTimezone(timezone);
		if (result.error) {
			setOutput(`Error: ${result.error}`);
		} else {
			setOutput(result.result);
		}
	};

	return (
		<UtilityToolCard
			title='Now → UTC / IST / Custom TZ'
			description='Convert current time to different timezones'
			input={
				<div className='space-y-3'>
					<Input
						value={timezone}
						onChange={(e) => setTimezone(e.target.value)}
						placeholder='UTC, Asia/Kolkata, America/New_York'
						className='bg-white/5 border-glass-border text-white placeholder:text-white/40'
					/>
					<div className='flex gap-2'>
						<Button onClick={() => setTimezone('UTC')} variant='outline' size='sm'>
							UTC
						</Button>
						<Button onClick={() => setTimezone('Asia/Kolkata')} variant='outline' size='sm'>
							IST
						</Button>
						<Button onClick={() => setTimezone('America/New_York')} variant='outline' size='sm'>
							EST
						</Button>
					</div>
				</div>
			}
			output={<CodeViewer value={output} />}
			actions={
				<Button onClick={handleRefresh} variant='gradient' size='sm'>
					Refresh
				</Button>
			}
		/>
	);
};

export default NowConverter;
