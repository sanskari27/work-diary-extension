import { CodeEditor, CodeViewer, ErrorDisplay } from '@/components/molecules';
import { UtilityToolCard } from '@/components/organisms';
import { Button } from '@/components/ui/button';
import { checkJwtExpiry, decodeJwt, getJwtIssuedAt } from '@/lib/utilityTools';
import { useState } from 'react';

const JwtAnalyzer = () => {
	const [input, setInput] = useState('');
	const [output, setOutput] = useState('');
	const [error, setError] = useState<string>();

	const handleAnalyze = () => {
		// Decode JWT
		const decoded = decodeJwt(input);
		if (decoded.error) {
			setError(decoded.error);
			setOutput('');
			return;
		}

		// Check expiry
		const expiry = checkJwtExpiry(input);

		// Get issued-at
		const issuedAt = getJwtIssuedAt(input);

		// Build comprehensive output
		let result = '=== JWT Header ===\n';
		result += JSON.stringify(decoded.header, null, 2);
		result += '\n\n=== JWT Payload ===\n';
		result += JSON.stringify(decoded.payload, null, 2);

		result += '\n\n=== Token Information ===\n';

		if (expiry.error) {
			result += `Expiry Check: ${expiry.error}\n`;
		} else {
			result += `Expired: ${expiry.expired ? 'Yes' : 'No'}\n`;
			if (expiry.expiresAt) {
				result += `Expires At: ${new Date(expiry.expiresAt).toISOString()}\n`;
			}
		}

		if (issuedAt.error) {
			result += `Issued At: ${issuedAt.error}\n`;
		} else if (issuedAt.issuedAt) {
			result += `Issued At: ${new Date(issuedAt.issuedAt).toISOString()}\n`;
		}

		setError(undefined);
		setOutput(result);
	};

	const handleClear = () => {
		setInput('');
		setOutput('');
		setError(undefined);
	};

	return (
		<UtilityToolCard
			title='JWT Analyzer'
			description='Decode JWT, check expiry, and show issued-at time'
			input={
				<CodeEditor
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onClear={handleClear}
					placeholder='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
				/>
			}
			output={<CodeViewer value={output} />}
			error={<ErrorDisplay error={error} />}
			actions={
				<Button onClick={handleAnalyze} variant='gradient' size='sm'>
					Analyze JWT
				</Button>
			}
		/>
	);
};

export default JwtAnalyzer;
