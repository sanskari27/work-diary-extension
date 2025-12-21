import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { forwardRef } from 'react';

interface CodeEditorProps extends React.ComponentProps<'textarea'> {
	onClear?: () => void;
	showClearButton?: boolean;
	error?: boolean;
}

const CodeEditor = forwardRef<HTMLTextAreaElement, CodeEditorProps>(
	({ className, onClear, showClearButton = true, error = false, ...props }, ref) => {
		return (
			<div className='relative h-full flex flex-col'>
				<Textarea
					ref={ref}
					className={cn(
						'font-mono text-sm resize-none h-full',
						'bg-white/5 border-glass-border text-white placeholder:text-white/40',
						'focus-visible:ring-primary/50 focus-visible:border-primary/50',
						error &&
							'border-red-500/50 focus-visible:border-red-500/50 focus-visible:ring-red-500/50',
						className
					)}
					{...props}
				/>
				{showClearButton && props.value && (
					<button
						type='button'
						onClick={onClear}
						className='absolute top-2 right-2 p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors'
						title='Clear'
					>
						<X className='w-4 h-4' />
					</button>
				)}
			</div>
		);
	}
);

CodeEditor.displayName = 'CodeEditor';

export default CodeEditor;
