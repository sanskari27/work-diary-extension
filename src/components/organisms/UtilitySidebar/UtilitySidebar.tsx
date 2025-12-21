import { Collapsible } from '@/components/ui/custom-collapsible';
import { TOOL_GROUPS, utilityIconMap } from '@/config/utilities';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface UtilitySidebarProps {
	onToolSelect?: (toolId: string, groupId: string) => void;
}

const UtilitySidebar = ({ onToolSelect }: UtilitySidebarProps) => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const activeToolId = searchParams.get('tool');
	const activeGroupId = searchParams.get('group');

	const handleToolClick = (toolId: string, groupId: string) => {
		navigate(`/utilities?group=${groupId}&tool=${toolId}`);
		if (onToolSelect) {
			onToolSelect(toolId, groupId);
		}
	};

	return (
		<div className='p-4 space-y-2'>
			{/* Back to Home Button */}
			<motion.button
				onClick={() => navigate('/')}
				className={cn(
					'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all mb-4',
					'text-sm font-semibold text-white',
					'bg-white/5 border border-white/10',
					'hover:bg-white/10 hover:border-white/20 hover:text-text-accent',
					'backdrop-blur-sm shadow-sm'
				)}
				whileHover={{ x: 4, scale: 1.02 }}
				whileTap={{ scale: 0.98 }}
			>
				<Home className='w-5 h-5 flex-shrink-0 text-current' />
				<span className='truncate flex-1'>Back to Home</span>
			</motion.button>

			{TOOL_GROUPS.map((group) => {
				const GroupIcon = utilityIconMap[group.icon] || utilityIconMap.code;
				const isGroupActive = activeGroupId === group.id;

				return (
					<Collapsible
						key={group.id}
						defaultOpen={isGroupActive}
						header={
							<div className='flex items-center gap-3'>
								<GroupIcon className='w-5 h-5 text-text-accent flex-shrink-0' />
								<span className='font-semibold text-sm text-white truncate'>{group.name}</span>
								<span className='ml-auto text-xs text-text-secondary bg-white/5 px-2 py-0.5 rounded-full'>
									{group.tools.length}
								</span>
							</div>
						}
						contentClassName='p-2'
						headerClassName='p-2'
						className='mb-2'
					>
						<div className='space-y-1'>
							{group.tools.map((tool) => {
								const ToolIcon = utilityIconMap[tool.icon] || utilityIconMap.code;
								const isActive = activeToolId === tool.id;

								return (
									<motion.button
										key={tool.id}
										onClick={() => handleToolClick(tool.id, group.id)}
										className={cn(
											'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all',
											'text-sm text-text-secondary hover:text-text-accent hover:bg-white/5',
											isActive && 'bg-primary/20 text-text-accent border border-primary/50'
										)}
										whileHover={{ x: 4 }}
										whileTap={{ scale: 0.98 }}
									>
										<ToolIcon className='w-4 h-4 flex-shrink-0 text-current' />
										<span className='truncate flex-1'>{tool.name}</span>
									</motion.button>
								);
							})}
						</div>
					</Collapsible>
				);
			})}
		</div>
	);
};

export default UtilitySidebar;
