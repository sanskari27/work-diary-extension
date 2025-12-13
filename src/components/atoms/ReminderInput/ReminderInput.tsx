import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

interface ReminderInputProps {
	value: string;
	onValueChange: (value: string) => void;
	className?: string;
	placeholder?: string;
}

/**
 * ReminderInput - A reusable select component for choosing reminder time delta
 * Provides options from 1-7 days before an event
 */
export default function ReminderInput({
	value,
	onValueChange,
	className = 'w-full bg-white/10 border-white/20 text-white',
	placeholder,
}: ReminderInputProps) {
	return (
		<Select value={value} onValueChange={onValueChange}>
			<SelectTrigger className={className}>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value='1d'>1 day before</SelectItem>
				<SelectItem value='2d'>2 days before</SelectItem>
				<SelectItem value='3d'>3 days before</SelectItem>
				<SelectItem value='4d'>4 days before</SelectItem>
				<SelectItem value='5d'>5 days before</SelectItem>
				<SelectItem value='6d'>6 days before</SelectItem>
				<SelectItem value='7d'>7 days before</SelectItem>
			</SelectContent>
		</Select>
	);
}
