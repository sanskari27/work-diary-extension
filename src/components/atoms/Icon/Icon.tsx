import { cn } from '@/lib/utils';
import { iconMap } from '@/config/features';
import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';

interface IconProps {
	name: string;
	className?: string;
	size?: number;
	animate?: boolean;
}

const Icon = ({ name, className, size = 24, animate = false }: IconProps) => {
	const IconComponent = iconMap[name] || Rocket;

	if (animate) {
		return (
			<motion.div
				initial={{ rotate: 0, scale: 1 }}
				whileHover={{ rotate: 5, scale: 1.1 }}
				transition={{ duration: 0.2 }}
			>
				<IconComponent size={size} className={cn('text-current', className)} />
			</motion.div>
		);
	}

	return <IconComponent size={size} className={cn('text-current', className)} />;
};

export default Icon;

