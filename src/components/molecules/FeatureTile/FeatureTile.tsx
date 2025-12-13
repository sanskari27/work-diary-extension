import { Icon, Text } from '@/components/atoms';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FeatureTileProps {
	name: string;
	icon: string;
	route: string;
}

const FeatureTile = ({ name, icon, route }: FeatureTileProps) => {
	const navigate = useNavigate();
	return (
		<motion.div
			onClick={() => navigate(route)}
			whileHover={{ scale: 1.05, y: -5 }}
			whileTap={{ scale: 0.95 }}
			className='cursor-pointer group h-full'
		>
			<div className={`relative h-full rounded-2xl overflow-hidden min-h-[140px]`}>
				{/* Gradient Background Layer */}
				<div className={`absolute inset-0 bg-gradient-to-br opacity-70`} />

				{/* Strong Frosted Glass Layer */}
				<div className='absolute inset-0 bg-white/15 backdrop-blur-3xl border-2 border-white/30 rounded-2xl shadow-2xl' />

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
				<div className='relative z-10 h-full p-5 flex flex-col justify-between'>
					<div className='flex items-start justify-between mb-3'>
						<motion.div
							whileHover={{ rotate: 15, scale: 1.15 }}
							transition={{ type: 'spring', stiffness: 400, damping: 10 }}
							className='p-2.5 rounded-xl bg-white/30 backdrop-blur-2xl border-2 border-white/50 shadow-xl'
						>
							<Icon name={icon} size={20} className='text-white drop-shadow-2xl' />
						</motion.div>

						<motion.div
							initial={{ x: -5, y: 5, opacity: 0 }}
							whileHover={{ x: 0, y: 0, opacity: 1 }}
							transition={{ duration: 0.2 }}
						>
							<ArrowUpRight className='w-4 h-4 text-white/60' />
						</motion.div>
					</div>

					<div>
						<Text
							variant='h3'
							className='text-white font-bold text-base group-hover:translate-x-1 transition-transform duration-200 drop-shadow-lg'
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
					className='absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-white/0 via-white/70 to-white/0 origin-left z-20'
				/>

				{/* Shine Effect */}
				<motion.div
					className='absolute inset-0 opacity-0 group-hover:opacity-100 rounded-2xl'
					animate={{
						background: [
							'linear-gradient(90deg, transparent 0%, transparent 100%)',
							'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
							'linear-gradient(90deg, transparent 0%, transparent 100%)',
						],
					}}
					transition={{ duration: 1.5, repeat: Infinity }}
				/>
			</div>
		</motion.div>
	);
};

export default FeatureTile;
