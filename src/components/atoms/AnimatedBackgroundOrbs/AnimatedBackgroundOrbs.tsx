import { motion } from 'framer-motion';

interface AnimatedBackgroundOrbsProps {
	variant?: 'full' | 'popup';
}

const AnimatedBackgroundOrbs = ({ variant = 'full' }: AnimatedBackgroundOrbsProps) => {
	if (variant === 'popup') {
		return (
			<div className='absolute inset-0 overflow-hidden pointer-events-none'>
				<motion.div
					animate={{
						x: [0, 50, 0],
						y: [0, -50, 0],
						scale: [1, 1.1, 1],
					}}
					transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
					className='absolute top-0 left-0 w-64 h-64 rounded-full blur-3xl bg-orb-from'
				/>
				<motion.div
					animate={{
						x: [0, -50, 0],
						y: [0, 50, 0],
						scale: [1, 1.2, 1],
					}}
					transition={{
						duration: 20,
						repeat: Infinity,
						ease: 'easeInOut',
						delay: 1,
					}}
					className='absolute bottom-0 right-0 w-64 h-64 rounded-full blur-3xl bg-orb-to'
				/>
			</div>
		);
	}

	return (
		<div className='absolute inset-0 overflow-hidden pointer-events-none'>
			{/* Orb 1 - Moves from top-left across the page */}
			<motion.div
				animate={{
					x: [0, 1200, 300, 900, 0],
					y: [0, 400, 800, 500, 0],
					scale: [1, 1.3, 1.1, 1.4, 1],
				}}
				transition={{
					duration: 30,
					repeat: Infinity,
					ease: 'easeInOut',
				}}
				className='absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl bg-orb-from'
			/>
			{/* Orb 2 - Moves from bottom-right across the page */}
			<motion.div
				animate={{
					x: [0, -1000, -450, -750, 0],
					y: [0, -800, -250, -1000, 0],
					scale: [1, 1.5, 1.2, 1.3, 1],
				}}
				transition={{
					duration: 35,
					repeat: Infinity,
					ease: 'easeInOut',
					delay: 2,
				}}
				className='absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl bg-orb-to'
			/>
			{/* Orb 3 - Moves in a circular pattern from center */}
			<motion.div
				animate={{
					x: [0, 600, -450, 300, 0],
					y: [0, -600, 400, -300, 0],
					scale: [1, 1.2, 1.4, 1.1, 1],
				}}
				transition={{
					duration: 25,
					repeat: Infinity,
					ease: 'easeInOut',
					delay: 1,
				}}
				className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl bg-orb-primary'
			/>
		</div>
	);
};

export default AnimatedBackgroundOrbs;
