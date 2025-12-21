import { CodeEditor, CodeViewer, ErrorDisplay } from '@/components/molecules';
import { UtilityToolCard } from '@/components/organisms';
import { Button } from '@/components/ui/button';
import { validateJson } from '@/lib/utilityTools';
import { useState } from 'react';

const JsonValidator = () => {
	const [input, setInput] = useState('');
	const [output, setOutput] = useState('');
	const [error, setError] = useState<string>();
	const [line, setLine] = useState<number>();
	const [column, setColumn] = useState<number>();

	const handleValidate = () => {
		const result = validateJson(input);
		if (result.valid) {
			setError(undefined);
			setLine(undefined);
			setColumn(undefined);
			setOutput('✓ Valid JSON');
		} else {
			setError(result.error);
			setLine(result.line);
			setColumn(result.column);
			setOutput('');
		}
	};

	const handleClear = () => {
		setInput('');
		setOutput('');
		setError(undefined);
		setLine(undefined);
		setColumn(undefined);
	};

	return (
		<UtilityToolCard
			title='JSON Validator'
			description='Validate JSON and show error line'
			input={
				<CodeEditor
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onClear={handleClear}
					rows={30}
					error={!!error}
				/>
			}
			output={
				output ? (
					<div className='p-4 rounded-md bg-green-500/10 border border-green-500/30'>
						<p className='text-green-300'>{output}</p>
					</div>
				) : (
					<CodeViewer value='' />
				)
			}
			error={<ErrorDisplay error={error} line={line} column={column} />}
			actions={
				<Button onClick={handleValidate} variant='gradient' size='sm'>
					Validate JSON
				</Button>
			}
		/>
	);
};

export default JsonValidator;
