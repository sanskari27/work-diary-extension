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
import { convertCase } from '@/lib/utilityTools';
import { useEffect, useState } from 'react';

const CaseConverter = () => {
	const [input, setInput] = useState('');
	const [targetCase, setTargetCase] = useState<
		'camel' | 'snake' | 'kebab' | 'pascal' | 'upper' | 'lower' | 'sentence'
	>('camel');
	const [output, setOutput] = useState('');

	useEffect(() => {
		if (input) {
			setOutput(convertCase(input, targetCase));
		} else {
			setOutput('');
		}
	}, [input, targetCase]);

	const handleClear = () => {
		setInput('');
		setOutput('');
	};

	return (
		<UtilityToolCard
			title='Case Converter'
			description='Convert between camelCase, snake_case, kebab-case, PascalCase, etc.'
			input={
				<div className='space-y-3 h-full flex flex-col'>
					<CodeEditor
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onClear={handleClear}
					/>
					<Select value={targetCase} onValueChange={(v) => setTargetCase(v as any)}>
						<SelectTrigger className='bg-white/5 border-glass-border text-white'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='camel'>camelCase</SelectItem>
							<SelectItem value='snake'>snake_case</SelectItem>
							<SelectItem value='kebab'>kebab-case</SelectItem>
							<SelectItem value='pascal'>PascalCase</SelectItem>
							<SelectItem value='upper'>UPPER_CASE</SelectItem>
							<SelectItem value='lower'>lowercase</SelectItem>
							<SelectItem value='sentence'>Sentence case</SelectItem>
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

export default CaseConverter;
