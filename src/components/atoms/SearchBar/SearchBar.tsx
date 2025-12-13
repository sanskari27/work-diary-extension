import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';
import { forwardRef, useState } from 'react';

export interface SearchBarProps extends React.ComponentPropsWithoutRef<'input'> {
	onClear?: () => void;
	showClearButton?: boolean;
	containerClassName?: string;
}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
	(
		{ className, onClear, showClearButton = true, containerClassName, value, onChange, ...props },
		ref
	) => {
		const [isFocused, setIsFocused] = useState(false);
		const hasValue = value && String(value).length > 0;

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

		return (
			<div
				className={cn(
					'relative flex items-center glass-strong rounded-xl border border-white/20 transition-all',
					isFocused && 'border-purple-400/40 shadow-lg shadow-purple-500/20',
					containerClassName
				)}
			>
				<Search className='absolute left-3 h-4 w-4 text-purple-300/60 pointer-events-none' />
				<Input
					ref={ref}
					type='text'
					value={value}
					onChange={onChange}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
					className={cn(
						'pl-10 pr-10 h-10 bg-transparent border-0 text-white placeholder:text-purple-300/50 focus-visible:ring-0 focus-visible:ring-offset-0',
						className
					)}
					placeholder='Search...'
					{...props}
				/>
				{showClearButton && hasValue && (
					<button
						type='button'
						onClick={handleClear}
						className='absolute right-3 h-6 w-6 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-purple-300/60 hover:text-white'
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
