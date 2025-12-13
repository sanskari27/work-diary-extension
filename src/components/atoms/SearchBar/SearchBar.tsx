import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';
import { forwardRef, useState } from 'react';

export interface SearchBarProps extends React.ComponentPropsWithoutRef<'input'> {
	onClear?: () => void;
	showClearButton?: boolean;
	containerClassName?: string;
	actions?: React.ReactNode[];
	onComplete?: (query: string) => void;
}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
	(
		{
			className,
			onClear,
			showClearButton = true,
			containerClassName,
			value,
			onChange,
			actions = [],
			onComplete,
			onKeyDown,
			...props
		},
		ref
	) => {
		const [isFocused, setIsFocused] = useState(false);
		const hasValue = value && String(value).length > 0;
		const hasActions = actions.length > 0;
		const showClear = showClearButton && hasValue;

		const handleClear = () => {
			if (onClear) {
				onClear();
			} else if (onChange) {
				// Create a synthetic event to clear the input
				const syntheticEvent = {
					target: { value: '' },
					currentTarget: { value: '' },
				} as React.ChangeEvent<HTMLInputElement>;
				onChange(syntheticEvent);
			}
		};

		const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === 'Enter' && onComplete) {
				const inputValue = value ? String(value) : '';
				onComplete(inputValue);
			}
			// Call the original onKeyDown if provided
			onKeyDown?.(e);
		};

		// Calculate right padding based on actions and clear button
		let rightPadding = 'pr-10'; // Default padding
		if (hasActions && showClear) {
			rightPadding = 'pr-20'; // Space for actions + clear button
		} else if (hasActions) {
			rightPadding = 'pr-28'; // Space for actions
		} else if (showClear) {
			rightPadding = 'pr-10'; // Space for clear button
		}

		return (
			<div
				className={cn(
					'relative flex items-center glass-strong rounded-xl border border-white/20 transition-all',
					isFocused && 'border-accent-border shadow-lg shadow-gradient',
					containerClassName
				)}
			>
				<Search className='absolute left-3 h-4 w-4 text-text-accent/60 pointer-events-none' />
				<Input
					ref={ref}
					type='text'
					value={value}
					onChange={onChange}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
					onKeyDown={handleKeyDown}
					className={cn(
						'pl-10 bg-transparent border-0 text-white placeholder:text-text-accent/50 focus-visible:ring-0 focus-visible:ring-offset-0',
						rightPadding,
						className
					)}
					placeholder='Search...'
					{...props}
				/>
				{/* Actions */}
				{hasActions && (
					<div className='absolute right-2 flex items-center gap-2'>
						{actions.map((action, index) => (
							<div key={index} className='rounded-full overflow-hidden'>
								{action}
							</div>
						))}
					</div>
				)}
				{/* Clear Button */}
				{showClear && !hasActions && (
					<button
						type='button'
						onClick={handleClear}
						className={cn(
							'absolute h-6 w-6 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-text-accent/60 hover:text-white',
							hasActions ? 'right-12' : 'right-3'
						)}
					>
						<X className='h-3.5 w-3.5' />
					</button>
				)}
			</div>
		);
	}
);

SearchBar.displayName = 'SearchBar';

export default SearchBar;
