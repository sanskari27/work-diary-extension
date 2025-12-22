import { CodeViewer, ErrorDisplay } from '@/components/molecules';
import { UtilityToolCard } from '@/components/organisms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { convertBytes } from '@/lib/utilityTools';
import { useState } from 'react';

const BytesConverter = () => {
	const [value, setValue] = useState('');
	const [from, setFrom] = useState('B');
	const [to, setTo] = useState('KB');
	const [output, setOutput] = useState('');
	const [error, setError] = useState<string>();

	const handleConvert = () => {
		const numValue = parseFloat(value) || 0;
		const result = convertBytes(numValue, from, to);
		if (result.error) {
			setError(result.error);
			setOutput('');
		} else {
			setError(undefined);
			setOutput(`${result.result} ${to}`);
		}
	};

	return (
		<UtilityToolCard
			title='Bytes ↔ KB / MB / GB'
			description='Convert between bytes and units'
			input={
				<div className='space-y-3'>
					<Input
						type='number'
						value={value}
						onChange={(e) => setValue(e.target.value)}
						placeholder='Value'
						className='bg-white/5 border-glass-border text-white placeholder:text-white/40'
					/>
					<div className='grid grid-cols-2 gap-2'>
						<Select value={from} onValueChange={setFrom}>
							<SelectTrigger className='bg-white/5 border-glass-border text-white'>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='B'>Bytes</SelectItem>
								<SelectItem value='KB'>KB</SelectItem>
								<SelectItem value='MB'>MB</SelectItem>
								<SelectItem value='GB'>GB</SelectItem>
								<SelectItem value='TB'>TB</SelectItem>
							</SelectContent>
						</Select>
						<Select value={to} onValueChange={setTo}>
							<SelectTrigger className='bg-white/5 border-glass-border text-white'>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='B'>Bytes</SelectItem>
								<SelectItem value='KB'>KB</SelectItem>
								<SelectItem value='MB'>MB</SelectItem>
								<SelectItem value='GB'>GB</SelectItem>
								<SelectItem value='TB'>TB</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			}
			output={<CodeViewer value={output} />}
			error={<ErrorDisplay error={error} />}
			actions={
				<Button onClick={handleConvert} variant='gradient' size='sm'>
					Convert
				</Button>
			}
		/>
	);
};

export default BytesConverter;
