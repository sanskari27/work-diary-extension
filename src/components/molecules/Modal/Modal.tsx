import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { ReactNode, useEffect } from 'react';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}

		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [isOpen]);

	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener('keydown', handleEscape);
		}

		return () => {
			document.removeEventListener('keydown', handleEscape);
		};
	}, [isOpen, onClose]);

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className='fixed inset-0 bg-black/60 backdrop-blur-sm z-40'
					/>

					{/* Modal */}
					<div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 20 }}
							transition={{ duration: 0.2 }}
							className='glass-strong rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-white/30'
							onClick={(e) => e.stopPropagation()}
						>
							{/* Header */}
							<div className='flex items-center justify-between p-6 border-b border-white/20'>
								<h2 className='text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent'>
									{title}
								</h2>
								<button
									onClick={onClose}
									className='p-2 rounded-xl hover:bg-white/10 transition-colors'
								>
									<X className='w-5 h-5 text-white/70' />
								</button>
							</div>

							{/* Content */}
							<div className='p-6 overflow-y-auto max-h-[calc(90vh-140px)]'>{children}</div>
						</motion.div>
					</div>
				</>
			)}
		</AnimatePresence>
	);
};

export default Modal;



