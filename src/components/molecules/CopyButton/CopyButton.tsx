import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

interface CopyButtonProps {
	text: string;
	className?: string;
	size?: 'sm' | 'default' | 'lg' | 'icon';
	variant?: 'default' | 'outline' | 'ghost';
}

const CopyButton = ({ text, className, size = 'icon', variant = 'outline' }: CopyButtonProps) => {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (error) {
			console.error('Failed to copy:', error);
		}
	};

	return (
		<Button
			onClick={handleCopy}
			size={size}
			variant={variant}
			className={cn('transition-all', className)}
			title={copied ? 'Copied!' : 'Copy to clipboard'}
		>
			{copied ? <Check className='w-4 h-4 text-green-400' /> : <Copy className='w-4 h-4' />}
		</Button>
	);
};

export default CopyButton;
