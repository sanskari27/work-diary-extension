'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface MultiSelectOption {
	value: string;
	label: string;
}

export interface MultiSelectProps {
	placeholder: string;
	items: MultiSelectOption[];
	value: string[];
	onChange: (value: string[]) => void;
	disabled?: boolean;
	buttonText?: string;
	buttonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
	children?: React.ReactNode;
	emptyMessage?: string;
}

export function MultiSelect({
	placeholder,
	items,
	value,
	disabled,
	onChange,
	buttonText,
	buttonVariant = 'outline',
	children,
	emptyMessage = 'No entries found.',
}: MultiSelectProps) {
	const [open, setOpen] = React.useState(false);

	const selectedLabels = React.useMemo(() => {
		return buttonText
			? buttonText
			: value
					.map((v) => {
						const item = items.find((item) => item.value === v);
						return item?.label ?? '';
					})
					.filter(Boolean)
					.join(', ');
	}, [value, items, buttonText]);

	const handleSelect = React.useCallback(
		(currentValue: string) => {
			if (value.includes(currentValue)) {
				onChange(value.filter((v) => v !== currentValue));
			} else {
				onChange([...value, currentValue]);
			}
		},
		[value, onChange]
	);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant={buttonVariant}
					role='combobox'
					disabled={disabled}
					aria-expanded={open}
					size='sm'
					className={cn(
						'w-full justify-between glass-strong',
						value.length > 0 ? 'text-white' : 'text-gray-300'
					)}
				>
					{selectedLabels || placeholder}
					<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
				</Button>
			</PopoverTrigger>
			<PopoverContent className='min-w-max p-0' align='start'>
				<Command>
					<CommandInput placeholder={placeholder} />
					<CommandEmpty>{emptyMessage}</CommandEmpty>
					<CommandList>
						<CommandGroup>
							{items.map((item) => {
								const isSelected = value.includes(item.value);
								return (
									<CommandItem key={item.value} value={item.value} onSelect={handleSelect}>
										<Check
											className={cn('mr-2 h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')}
										/>
										{item.label}
									</CommandItem>
								);
							})}
							{children}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
