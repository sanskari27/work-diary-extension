import { CodeEditor, CodeViewer } from '@/components/molecules';
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
import { convertTabsSpaces } from '@/lib/utilityTools';
import { useEffect, useState } from 'react';

const TextTabsSpaces = () => {
	const [input, setInput] = useState('');
	const [from, setFrom] = useState<'tabs' | 'spaces'>('tabs');
	const [to, setTo] = useState<'tabs' | 'spaces'>('spaces');
	const [spacesPerTab, setSpacesPerTab] = useState('4');
	const [output, setOutput] = useState('');

	useEffect(() => {
		if (input) {
			setOutput(convertTabsSpaces(input, from, to, parseInt(spacesPerTab) || 4));
		} else {
			setOutput('');
		}
	}, [input, from, to, spacesPerTab]);

	const handleClear = () => {
		setInput('');
		setOutput('');
	};

	return (
		<UtilityToolCard
			title='Convert tabs ↔ spaces'
			description='Convert between tabs and spaces'
			input={
				<div className='space-y-3'>
					<CodeEditor
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onClear={handleClear}
						rows={25}
					/>
					<div className='grid grid-cols-2 gap-2'>
						<Select value={from} onValueChange={(v) => setFrom(v as 'tabs' | 'spaces')}>
							<SelectTrigger className='bg-white/5 border-glass-border text-white'>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='tabs'>From Tabs</SelectItem>
								<SelectItem value='spaces'>From Spaces</SelectItem>
							</SelectContent>
						</Select>
						<Select value={to} onValueChange={(v) => setTo(v as 'tabs' | 'spaces')}>
							<SelectTrigger className='bg-white/5 border-glass-border text-white'>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='tabs'>To Tabs</SelectItem>
								<SelectItem value='spaces'>To Spaces</SelectItem>
							</SelectContent>
						</Select>
					</div>
					{to === 'spaces' && (
						<Input
							type='number'
							value={spacesPerTab}
							onChange={(e) => setSpacesPerTab(e.target.value)}
							placeholder='Spaces per tab'
							className='bg-white/5 border-glass-border text-white placeholder:text-white/40'
						/>
					)}
				</div>
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

export default TextTabsSpaces;
