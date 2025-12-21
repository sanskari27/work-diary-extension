import { CodeEditor, CodeViewer } from '@/components/molecules';
import { UtilityToolCard } from '@/components/organisms';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { normalizeLineEndings } from '@/lib/utilityTools';
import { useEffect, useState } from 'react';

const TextNormalizeLineEndings = () => {
	const [input, setInput] = useState('');
	const [target, setTarget] = useState<'lf' | 'crlf' | 'cr'>('lf');
	const [output, setOutput] = useState('');

	useEffect(() => {
		if (input) {
			setOutput(normalizeLineEndings(input, target));
		} else {
			setOutput('');
		}
	}, [input, target]);

	const handleClear = () => {
		setInput('');
		setOutput('');
	};

	return (
		<UtilityToolCard
			title='Normalize line endings'
			description='Convert line endings to consistent format'
			input={
				<div className='space-y-3 h-full flex flex-col'>
					<CodeEditor
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onClear={handleClear}
					/>
					<Select value={target} onValueChange={(v) => setTarget(v as 'lf' | 'crlf' | 'cr')}>
						<SelectTrigger className='bg-white/5 border-glass-border text-white'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='lf'>LF (Unix)</SelectItem>
							<SelectItem value='crlf'>CRLF (Windows)</SelectItem>
							<SelectItem value='cr'>CR (Mac)</SelectItem>
						</SelectContent>
					</Select>
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

export default TextNormalizeLineEndings;
