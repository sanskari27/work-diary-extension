import { CalendarIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatRelativeTime } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';

function formatDateToISO(date: Date | undefined): string {
	if (!date) {
		return '';
	}

	// Return ISO date format (YYYY-MM-DD)
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');

	return `${year}-${month}-${day}`;
}

interface DatePickerProps {
	value: string;
	onChange: (value: string) => void;
	date?: Date;
	onDateChange?: (date: Date | undefined) => void;
	placeholder?: string;
	className?: string;
}

export default function DatePicker({
	value,
	onChange,
	date,
	onDateChange,
	placeholder = 'Select a date',
	className,
}: DatePickerProps) {
	const [open, setOpen] = React.useState(false);
	const [month, setMonth] = React.useState<Date | undefined>(date);

	// Parse the value string to a Date object if available
	const selectedDate = React.useMemo(() => {
		if (date) return date;
		if (value) {
			const parsed = new Date(value);
			return isNaN(parsed.getTime()) ? undefined : parsed;
		}
		return undefined;
	}, [value, date]);

	React.useEffect(() => {
		if (selectedDate) {
			setMonth(selectedDate);
		}
	}, [selectedDate]);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant='outline' className={cn(`justify-start text-left font-normal`, className)}>
					<CalendarIcon className='mr-2 h-4 w-4' />
					{formatRelativeTime(value) || placeholder}
				</Button>
			</PopoverTrigger>
			<PopoverContent className='w-auto overflow-hidden p-0' align='end'>
				<Calendar
					mode='single'
					selected={selectedDate}
					captionLayout='dropdown'
					month={month}
					onMonthChange={setMonth}
					onSelect={(newDate) => {
						if (onDateChange) {
							onDateChange(newDate);
						}
						onChange(formatDateToISO(newDate));
						setOpen(false);
					}}
				/>
			</PopoverContent>
		</Popover>
	);
}
