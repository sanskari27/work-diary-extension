import { LoadingSpinner } from '@/components/atoms';
import TagBasedInput from '@/components/molecules/TagBasedInput/TagBasedInput';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addEntry } from '@/store/slices/brainDumpSlice';
import { AnimatePresence, motion } from 'framer-motion';
import { Brain, Check } from 'lucide-react';
import { useState } from 'react';

const BrainDumpForm = () => {
	const dispatch = useAppDispatch();
	const entries = useAppSelector((state) => state.brainDump.entries);
	const [content, setContent] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);

	const mostRecentEntry = entries[0];

	const handleSubmit = () => {
		const trimmedContent = content.trim();
		if (!trimmedContent || isSubmitting) return;

		setIsSubmitting(true);
		dispatch(addEntry({ content: trimmedContent }));

		// Reset form and hide after submit
		setTimeout(() => {
			setContent('');
			setIsSubmitting(false);
			setIsSubmitted(true);
			// Hide the form after a brief success animation
			setTimeout(() => {
				setIsSubmitted(false);
			}, 1000);
		}, 300);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			handleSubmit();
		}
	};

	return (
		<div className='space-y-3'>
			<AnimatePresence mode='wait'>
				{!isSubmitted ? (
					<motion.div
						key='form'
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.2 }}
					>
						<div className='space-y-2'>
							<TagBasedInput
								value={content}
								onChange={setContent}
								onKeyDown={handleKeyDown}
								placeholder={"Dump it. We'll deal with it later.\nPress Cmd/Ctrl + Enter to submit"}
								className='w-full glass-strong text-white placeholder:text-gray-200/50 text-sm resize-none min-h-[80px]'
								disabled={isSubmitting}
							/>
							<Button
								onClick={handleSubmit}
								disabled={!content.trim() || isSubmitting}
								className='w-full bg-primary hover:bg-primary-hover text-white disabled:bg-primary/50 disabled:cursor-not-allowed'
								size='sm'
							>
								{isSubmitting ? (
									<>
										<LoadingSpinner size='sm' />
										Dumping...
									</>
								) : (
									<>
										<Brain className='w-4 h-4' />
										Dump It
									</>
								)}
							</Button>
						</div>
					</motion.div>
				) : (
					<motion.div
						key='success'
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.9 }}
						transition={{ duration: 0.15 }}
						className='flex items-center justify-center py-4'
					>
						<div className='flex items-center gap-2 text-text-accent'>
							<Check className='w-5 h-5' />
							<span className='text-sm font-medium'>Dumped!</span>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Most Recent Entry Preview */}
			{mostRecentEntry && !isSubmitted && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className='mt-3 p-2 rounded-lg glass-strong border border-white/10'
				>
					<p className='text-sm text-white/80 line-clamp-2'>
						{mostRecentEntry.content?.slice(0, 100)}{' '}
						{mostRecentEntry.content?.length > 100 ? '...' : ''}
					</p>
				</motion.div>
			)}
		</div>
	);
};

export default BrainDumpForm;
