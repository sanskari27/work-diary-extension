import CopyButton from '@/components/molecules/CopyButton/CopyButton';
import { cn } from '@/lib/utils';

interface CodeViewerProps {
	value: string;
	className?: string;
	showCopyButton?: boolean;
	language?: string;
}

const CodeViewer = ({ value, className, showCopyButton = true, language }: CodeViewerProps) => {
	return (
		<div className='relative h-full flex flex-col'>
			<pre
				className={cn(
					'font-mono text-sm p-4 rounded-md h-full',
					'bg-white/5 border border-glass-border text-white',
					'overflow-auto whitespace-pre-wrap break-words',
					className
				)}
			>
				<code>{value || <span className='text-white/40'>Output will appear here...</span>}</code>
			</pre>
			{showCopyButton && value && (
				<div className='absolute top-2 right-2'>
					<CopyButton text={value} />
				</div>
			)}
		</div>
	);
};

export default CodeViewer;
