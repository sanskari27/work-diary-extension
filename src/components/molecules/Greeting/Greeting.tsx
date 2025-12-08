import Text from '@/components/atoms/Text/Text';
import { getGreeting, getGreetingIcon } from '@/lib/utils';
import { motion } from 'framer-motion';
import _ from 'lodash';

interface GreetingProps {
	userName: string;
}

const Greeting = ({ userName }: GreetingProps) => {
	const greeting = getGreeting();
	const GreetingIcon = getGreetingIcon();

	return (
		<motion.div
			className='mb-12 flex items-center justify-center gap-4'
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: 'easeOut' }}
		>
			<motion.div
				animate={{
					rotate: [0, 10, -10, 0],
					scale: [1, 1.1, 1],
				}}
				transition={{
					duration: 3,
					repeat: Infinity,
					ease: 'easeInOut',
				}}
			>
				<GreetingIcon className='w-10 h-10 text-yellow-400' />
			</motion.div>

			<Text
				variant='h2'
				className='text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent'
			>
				{greeting}, {_.upperFirst(userName)}
			</Text>
		</motion.div>
	);
};

export default Greeting;

