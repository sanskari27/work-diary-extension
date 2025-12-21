import { Text } from '@/components/atoms';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ArrowLeftRight } from 'lucide-react';
import { ReactNode } from 'react';

interface UtilityToolCardProps {
	title: string;
	description?: string;
	input: ReactNode;
	output: ReactNode;
	error?: ReactNode;
	actions?: ReactNode;
	canToggle?: boolean;
	onToggle?: () => void;
	className?: string;
}

const UtilityToolCard = ({
	title,
	description,
	input,
	output,
	error,
	actions,
	canToggle = false,
	onToggle,
	className,
}: UtilityToolCardProps) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className={cn(
				'glass-strong rounded-2xl border border-glass-border p-6 flex flex-col space-y-4 h-full',
				className
			)}
		>
			{/* Header */}
			<div className='space-y-1 flex-shrink-0'>
				<Text variant='h3' className='text-xl font-bold text-white'>
					{title}
				</Text>
				{description && (
					<Text variant='p' className='text-sm text-text-secondary'>
						{description}
					</Text>
				)}
			</div>

			{/* Split View */}
			<div className='flex gap-4 relative flex-1 min-h-0'>
				{/* Input Section */}
				<div className='space-y-2 flex-1 flex flex-col min-h-0'>
					<Text variant='p' className='text-sm font-semibold text-text-secondary flex-shrink-0'>
						Input
					</Text>
					<div className='flex-1 min-h-0'>{input}</div>
				</div>

				<div className='flex flex-col items-center gap-2 my-auto flex-shrink-0'>
					{/* Toggle Button - Between panels */}
					{canToggle && onToggle && (
						<Button
							onClick={onToggle}
							variant='outline'
							className='glass-strong border-glass-border hover:bg-white/20 flex h-10 w-10 items-center justify-center rounded-full'
							title='Toggle mode'
						>
							<ArrowLeftRight className='w-4 h-4' />
						</Button>
					)}

					{/* Actions */}
					{actions && <div className='flex items-center gap-2'>{actions}</div>}
				</div>
				{/* Output Section */}
				<div className='space-y-2 flex-1 flex flex-col min-h-0'>
					<Text variant='p' className='text-sm font-semibold text-text-secondary flex-shrink-0'>
						Output
					</Text>
					<div className='flex-1 min-h-0'>{output}</div>
				</div>
			</div>

			{/* Error Display */}
			{error}
		</motion.div>
	);
};

export default UtilityToolCard;
