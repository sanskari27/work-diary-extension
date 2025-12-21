import { LoadingSpinner, Text } from '@/components/atoms';
import { UtilitySidebar } from '@/components/organisms';
import { UtilitiesPageTemplate } from '@/components/templates';
import { getToolById, getToolGroupById, TOOL_GROUPS, utilityIconMap } from '@/config/utilities';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { lazy, Suspense } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Lazy load all tool components
const toolComponents: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
	// JSON Tools
	JsonPrettyMinify: lazy(
		() => import('@/components/organisms/tools/JsonPrettyMinify/JsonPrettyMinify')
	),
	JsonValidator: lazy(() => import('@/components/organisms/tools/JsonValidator/JsonValidator')),
	JsonSortKeys: lazy(() => import('@/components/organisms/tools/JsonSortKeys/JsonSortKeys')),
	JsonRemoveNulls: lazy(
		() => import('@/components/organisms/tools/JsonRemoveNulls/JsonRemoveNulls')
	),
	JsonPickOmit: lazy(() => import('@/components/organisms/tools/JsonPickOmit/JsonPickOmit')),
	JsonStringConverter: lazy(
		() => import('@/components/organisms/tools/JsonStringConverter/JsonStringConverter')
	),
	JavascriptToJson: lazy(
		() => import('@/components/organisms/tools/JavascriptToJson/JavascriptToJson')
	),

	// JWT Tools
	JwtAnalyzer: lazy(() => import('@/components/organisms/tools/JwtAnalyzer/JwtAnalyzer')),

	// Encoding Tools
	Base64Converter: lazy(
		() => import('@/components/organisms/tools/Base64Converter/Base64Converter')
	),
	UrlConverter: lazy(() => import('@/components/organisms/tools/UrlConverter/UrlConverter')),
	HexConverter: lazy(() => import('@/components/organisms/tools/HexConverter/HexConverter')),

	// Time Tools
	EpochDateConverter: lazy(
		() => import('@/components/organisms/tools/EpochDateConverter/EpochDateConverter')
	),
	NowConverter: lazy(() => import('@/components/organisms/tools/NowConverter/NowConverter')),
	TimeCalculator: lazy(() => import('@/components/organisms/tools/TimeCalculator/TimeCalculator')),
	IsoFormatter: lazy(() => import('@/components/organisms/tools/IsoFormatter/IsoFormatter')),
	CronToHuman: lazy(() => import('@/components/organisms/tools/CronToHuman/CronToHuman')),
	HumanToCron: lazy(() => import('@/components/organisms/tools/HumanToCron/HumanToCron')),

	// Text Tools
	TextTrim: lazy(() => import('@/components/organisms/tools/TextTrim/TextTrim')),
	TextRemoveNewlines: lazy(
		() => import('@/components/organisms/tools/TextRemoveNewlines/TextRemoveNewlines')
	),
	TextNormalizeLineEndings: lazy(
		() => import('@/components/organisms/tools/TextNormalizeLineEndings/TextNormalizeLineEndings')
	),
	TextTabsSpaces: lazy(() => import('@/components/organisms/tools/TextTabsSpaces/TextTabsSpaces')),
	SlugGenerator: lazy(() => import('@/components/organisms/tools/SlugGenerator/SlugGenerator')),
	RandomString: lazy(() => import('@/components/organisms/tools/RandomString/RandomString')),

	// Case Tools
	CaseConverter: lazy(() => import('@/components/organisms/tools/CaseConverter/CaseConverter')),

	// HTTP Tools
	CurlParser: lazy(() => import('@/components/organisms/tools/CurlParser/CurlParser')),
	HttpHeadersFormatter: lazy(
		() => import('@/components/organisms/tools/HttpHeadersFormatter/HttpHeadersFormatter')
	),
	QueryParamsConverter: lazy(
		() => import('@/components/organisms/tools/QueryParamsConverter/QueryParamsConverter')
	),

	// Misc Tools
	UuidGenerator: lazy(() => import('@/components/organisms/tools/UuidGenerator/UuidGenerator')),
	NanoIdGenerator: lazy(
		() => import('@/components/organisms/tools/NanoIdGenerator/NanoIdGenerator')
	),
	RandomColor: lazy(() => import('@/components/organisms/tools/RandomColor/RandomColor')),
	FileSizeFormatter: lazy(
		() => import('@/components/organisms/tools/FileSizeFormatter/FileSizeFormatter')
	),
	BytesConverter: lazy(() => import('@/components/organisms/tools/BytesConverter/BytesConverter')),
};

const UtilitiesPage = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const toolId = searchParams.get('tool');

	// Get the tool
	const tool = toolId ? getToolById(toolId) : null;

	// Get the tool component
	const ToolComponent =
		tool && toolComponents[tool.component] ? toolComponents[tool.component] : null;

	const handleGroupClick = (groupId: string) => {
		const selectedGroup = getToolGroupById(groupId);
		if (selectedGroup && selectedGroup.tools.length > 0) {
			navigate(`/utilities?group=${groupId}&tool=${selectedGroup.tools[0].id}`);
		}
	};

	return (
		<UtilitiesPageTemplate sidebar={<UtilitySidebar />}>
			{!toolId || !ToolComponent ? (
				// Show all tool groups if no specific tool is selected
				<div className='space-y-12'>
					{/* Welcome Section */}
					<motion.div
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className='space-y-4'
					>
						<Text
							variant='h1'
							className='text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-text'
						>
							Developer Utilities
						</Text>
						<Text variant='p' className='text-text-secondary text-lg max-w-2xl'>
							Browse through our collection of powerful developer tools. Select a tool group from
							the sidebar or click on any group below to get started.
						</Text>
					</motion.div>

					{/* Tool Groups Grid */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
					>
						{TOOL_GROUPS.map((group, index) => {
							const GroupIcon = utilityIconMap[group.icon] || utilityIconMap.code;

							return (
								<motion.button
									key={group.id}
									onClick={() => handleGroupClick(group.id)}
									className={cn(
										'p-6 rounded-xl text-left transition-all',
										'bg-white/5 border border-white/10',
										'hover:bg-white/10 hover:border-white/20',
										'backdrop-blur-sm shadow-sm',
										'group'
									)}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.4, delay: 0.1 * index }}
									whileHover={{ scale: 1.02, y: -4 }}
									whileTap={{ scale: 0.98 }}
								>
									<div className='flex items-start gap-4 mb-3'>
										<div className='p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors'>
											<GroupIcon className='w-6 h-6 text-text-accent' />
										</div>
										<div className='flex-1 min-w-0'>
											<Text
												variant='h3'
												className='text-white mb-1 group-hover:text-text-accent transition-colors'
											>
												{group.name}
											</Text>
											<Text variant='p' className='text-text-secondary text-sm line-clamp-2'>
												{group.description}
											</Text>
										</div>
									</div>
									<div className='flex items-center justify-between mt-4 pt-4 border-t border-white/10'>
										<Text variant='span' className='text-xs text-text-secondary'>
											{group.tools.length} {group.tools.length === 1 ? 'tool' : 'tools'}
										</Text>
										<Text
											variant='span'
											className='text-xs text-text-accent group-hover:translate-x-1 transition-transform inline-block'
										>
											Explore →
										</Text>
									</div>
								</motion.button>
							);
						})}
					</motion.div>
				</div>
			) : (
				// Show specific tool
				<Suspense fallback={<LoadingSpinner />}>
					<ToolComponent />
				</Suspense>
			)}
		</UtilitiesPageTemplate>
	);
};

export default UtilitiesPage;
