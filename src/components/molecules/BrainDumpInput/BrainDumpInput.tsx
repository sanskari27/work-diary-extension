import TagBasedInput from '@/components/molecules/TagBasedInput/TagBasedInput';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/store/hooks';
import { addEntry } from '@/store/slices/brainDumpSlice';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { useState } from 'react';

const BrainDumpInput = () => {
	const dispatch = useAppDispatch();
	const [content, setContent] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = () => {
		const trimmedContent = content.trim();
		if (!trimmedContent || isSubmitting) return;

		setIsSubmitting(true);
		dispatch(addEntry({ content: trimmedContent }));

		// Reset form after submit
		setTimeout(() => {
			setContent('');
			setIsSubmitting(false);
		}, 300);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			handleSubmit();
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.2 }}
			className='w-full max-w-2xl mx-auto'
		>
			<div className='space-y-3'>
				<div className='flex items-center gap-2 mb-2'>
					<Brain className='w-5 h-5 text-text-accent' />
					<h3 className='text-lg font-semibold text-white'>Instant Brain Dump</h3>
				</div>
				<TagBasedInput
					value={content}
					onChange={setContent}
					onKeyDown={handleKeyDown}
					placeholder="Dump it. We'll deal with it later."
					className='w-full glass-strong text-white placeholder:text-gray-200/50 text-sm resize-none min-h-[120px]'
					disabled={isSubmitting}
				/>
				<div className='flex items-center justify-between'>
					<p className='text-xs text-text-secondary/60'>Press Cmd/Ctrl + Enter to submit</p>
					<Button
						onClick={handleSubmit}
						disabled={!content.trim() || isSubmitting}
						className='bg-primary hover:bg-primary-hover text-white disabled:bg-primary/50 disabled:cursor-not-allowed'
						size='sm'
					>
						{isSubmitting ? (
							<>Dumping...</>
						) : (
							<>
								<Brain className='w-4 h-4 mr-2' />
								Dump It
							</>
						)}
					</Button>
				</div>
			</div>
		</motion.div>
	);
};

export default BrainDumpInput;
