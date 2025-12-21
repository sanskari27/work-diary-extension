import { Collapsible } from '@/components/ui/collapsible';
import { TOOL_GROUPS, utilityIconMap } from '@/config/utilities';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
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
								<span className='font-semibold text-white truncate'>{group.name}</span>
								<span className='ml-auto text-xs text-text-secondary bg-white/10 px-2 py-0.5 rounded-full'>
									{group.tools.length}
								</span>
							</div>
						}
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
											'text-sm text-text-secondary hover:text-white hover:bg-white/10',
											isActive && 'bg-primary/20 text-white border border-primary/50'
										)}
										whileHover={{ x: 4 }}
										whileTap={{ scale: 0.98 }}
									>
										<ToolIcon className='w-4 h-4 flex-shrink-0' />
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
