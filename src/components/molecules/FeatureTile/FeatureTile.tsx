import { Icon, Text } from '@/components/atoms';
import { useAppearanceStyles } from '@/hooks/useAppearanceStyles';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface FeatureTileProps {
	name: string;
	icon: string;
	route: string;
}

const FeatureTile = ({ name, icon, route }: FeatureTileProps) => {
	const navigate = useNavigate();
	const { card } = useAppearanceStyles();
	return (
		<motion.div
			onClick={() => navigate(route)}
			whileHover={{ scale: 1.05, y: -5 }}
			whileTap={{ scale: 0.95 }}
			tabIndex={-1}
			className='cursor-pointer group h-full'
		>
			<div className={cn('relative h-full rounded-2xl overflow-hidden')}>
				{/* Gradient Background Layer */}
				<div
					className={cn(
						'absolute inset-0 bg-gradient-to-br from-gradient-from/10 to-gradient-to/10 opacity-70'
					)}
				/>

				{/* Strong Frosted Glass Layer */}
				<div className='absolute inset-0 border-2 border-glass-border rounded-2xl shadow-2xl' />

				{/* Additional Frosted Overlay */}
				<div className='absolute inset-0 bg-gradient-to-br from-white/15 via-white/5 to-transparent rounded-2xl' />

				{/* Animated Background Pattern */}
				<motion.div
					className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500'
					style={{
						backgroundImage:
							'radial-gradient(circle at 20px 20px, rgba(255,255,255,0.15) 1px, transparent 0)',
						backgroundSize: '40px 40px',
					}}
				/>

				{/* Content Container */}
				<div
					className={cn('relative z-10 h-full', card.padding, 'flex flex-row gap-4 items-center')}
				>
					<motion.div
						whileHover={{ rotate: 15, scale: 1.15 }}
						transition={{ type: 'spring', stiffness: 400, damping: 10 }}
						className='p-2.5 rounded-xl bg-white/10 backdrop-blur-2xl border-2 border-glass-border shadow-xl'
					>
						<Icon name={icon} className={cn(card.iconSize, 'text-primary drop-shadow-2xl')} />
					</motion.div>

					<div>
						<Text
							variant='h3'
							className={cn(
								'text-primary font-bold',
								card.titleSize,
								'group-hover:translate-x-1 transition-transform duration-200 drop-shadow-lg'
							)}
						>
							{name}
						</Text>
					</div>
				</div>

				{/* Animated Bottom Border */}
				<motion.div
					initial={{ scaleX: 0 }}
					whileHover={{ scaleX: 1 }}
					transition={{ duration: 0.4, ease: 'easeOut' }}
					className='absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary/70 to-primary/0 origin-left z-20'
				/>

				{/* Shine Effect */}
				<motion.div
					className='absolute inset-0 opacity-0 group-hover:opacity-100 rounded-2xl overflow-hidden'
					style={{
						background:
							'linear-gradient(45deg, transparent 0%, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%, transparent 100%)',
						width: '200%',
						height: '200%',
						left: '-50%',
						top: '-50%',
					}}
					animate={{
						rotate: [0, 360],
						x: ['-50%', '50%'],
						y: ['-50%', '50%'],
					}}
					transition={{
						duration: 3,
						repeat: Infinity,
						ease: 'linear',
					}}
				/>
			</div>
		</motion.div>
	);
};

export default FeatureTile;
