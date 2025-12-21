import { CodeEditor, CodeViewer, ErrorDisplay } from '@/components/molecules';
import { UtilityToolCard } from '@/components/organisms';
import { Button } from '@/components/ui/button';
import { urlDecode, urlEncode } from '@/lib/utilityTools';
import { useEffect, useState } from 'react';

const UrlConverter = () => {
	const [input, setInput] = useState('');
	const [output, setOutput] = useState('');
	const [error, setError] = useState<string>();
	const [isDecode, setIsDecode] = useState(false);

	useEffect(() => {
		if (input) {
			if (isDecode) {
				const result = urlDecode(input);
				if (result.error) {
					setError(result.error);
					setOutput('');
				} else {
					setError(undefined);
					setOutput(result.result);
				}
			} else {
				setError(undefined);
				setOutput(urlEncode(input));
			}
		} else {
			setError(undefined);
			setOutput('');
		}
	}, [input, isDecode]);

	const handleClear = () => {
		setInput('');
		setOutput('');
		setError(undefined);
	};

	const handleToggle = () => {
		setIsDecode(!isDecode);
	};

	const title = isDecode ? 'URL Decode' : 'URL Encode';
	const description = isDecode ? 'Decode URL encoded text' : 'Encode text for URL';

	return (
		<UtilityToolCard
			title={title}
			description={description}
			input={
				<CodeEditor
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onClear={handleClear}
					rows={12}
				/>
			}
			output={<CodeViewer value={output} />}
			error={<ErrorDisplay error={error} />}
			canToggle={true}
			onToggle={handleToggle}
			actions={
				<Button onClick={handleClear} variant='outline' size='sm'>
					Clear
				</Button>
			}
		/>
	);
};

export default UrlConverter;
