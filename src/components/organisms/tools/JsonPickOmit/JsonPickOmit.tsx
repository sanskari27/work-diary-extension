import { CodeEditor, CodeViewer, ErrorDisplay } from '@/components/molecules';
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
import { pickOmitJsonFields } from '@/lib/utilityTools';
import { useState } from 'react';

const JsonPickOmit = () => {
	const [input, setInput] = useState('');
	const [fields, setFields] = useState('');
	const [mode, setMode] = useState<'pick' | 'omit'>('pick');
	const [output, setOutput] = useState('');
	const [error, setError] = useState<string>();

	const handleTransform = () => {
		const fieldList = fields
			.split(',')
			.map((f) => f.trim())
			.filter((f) => f);
		const result = pickOmitJsonFields(input, fieldList, mode);
		if (result.error) {
			setError(result.error);
			setOutput('');
		} else {
			setError(undefined);
			setOutput(result.result);
		}
	};

	const handleClear = () => {
		setInput('');
		setFields('');
		setOutput('');
		setError(undefined);
	};

	return (
		<UtilityToolCard
			title='Pick / omit fields'
			description='Select or exclude specific fields from JSON. Supports nested paths like "users[].address.coordinates.lat"'
			input={
				<div className='space-y-3'>
					<CodeEditor
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onClear={handleClear}
						rows={25}
					/>
					<div className='space-y-2'>
						<Select value={mode} onValueChange={(v) => setMode(v as 'pick' | 'omit')}>
							<SelectTrigger className='bg-white/5 border-glass-border text-white'>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='pick'>Pick fields</SelectItem>
								<SelectItem value='omit'>Omit fields</SelectItem>
							</SelectContent>
						</Select>
						<Input
							value={fields}
							onChange={(e) => setFields(e.target.value)}
							placeholder='users[].address.coordinates.lat, name, id'
							className='bg-white/5 border-glass-border text-white placeholder:text-white/40'
						/>
					</div>
				</div>
			}
			output={<CodeViewer value={output} />}
			error={<ErrorDisplay error={error} />}
			actions={
				<Button onClick={handleTransform} variant='gradient' size='sm'>
					Transform
				</Button>
			}
		/>
	);
};

export default JsonPickOmit;
