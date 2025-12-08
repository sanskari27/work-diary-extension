import FeatureTile from '@/components/molecules/FeatureTile/FeatureTile';
import { Feature } from '@/config/features';
import { motion } from 'framer-motion';
import _ from 'lodash';

interface FeatureGridProps {
	features: Feature[];
}

const FeatureGrid = ({ features }: FeatureGridProps) => {
	const container = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const item = {
		hidden: { opacity: 0, y: 20 },
		show: { opacity: 1, y: 0 },
	};

	return (
		<motion.div
			variants={container}
			initial='hidden'
			animate='show'
			className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
		>
			{_.map(features, (feature) => (
				<motion.div key={feature.id} variants={item}>
					<FeatureTile
						name={feature.name}
						icon={feature.icon}
						route={feature.route}
					/>
				</motion.div>
			))}
		</motion.div>
	);
};

export default FeatureGrid;
