import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Bell, BellOff } from 'lucide-react';

type Props = {
    isEnable: boolean;
    onClick: () => void;
}
export default function ReminderToggle({ isEnable, onClick }: Props) {
	return (
		<Button
			type='button'
			onClick={onClick}
			variant='ghost'
			className='w-full flex items-center justify-between p-4 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15'
		>
			<span className='text-sm font-medium text-white/80 flex items-center gap-2'>
				{isEnable ? (
					<Bell className='w-4 h-4 text-purple-400' />
				) : (
					<BellOff className='w-4 h-4 text-white/40' />
				)}
				Enable Reminder
			</span>
			<div
				className={`w-12 h-6 rounded-full transition-all ${
					isEnable ? 'bg-purple-500' : 'bg-white/20'
				}`}
			>
				<motion.div
					className='w-5 h-5 bg-white rounded-full shadow-lg'
					animate={{ x: isEnable ? 26 : 2, y: 2 }}
					transition={{ type: 'spring', stiffness: 500, damping: 30 }}
				/>
			</div>
		</Button>
	);
}
