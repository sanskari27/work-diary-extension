import { LoadingSpinner } from '@/components/atoms';
import { UtilitySidebar } from '@/components/organisms';
import { ToolGroupTemplate, UtilitiesPageTemplate } from '@/components/templates';
import { getToolById, getToolGroupById, TOOL_GROUPS } from '@/config/utilities';
import { lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';

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
	const toolId = searchParams.get('tool');
	const groupId = searchParams.get('group');

	// Get the tool and group
	const tool = toolId ? getToolById(toolId) : null;
	const group = groupId ? getToolGroupById(groupId) : null;

	// Get the tool component
	const ToolComponent =
		tool && toolComponents[tool.component] ? toolComponents[tool.component] : null;

	return (
		<UtilitiesPageTemplate sidebar={<UtilitySidebar />}>
			{!toolId || !ToolComponent ? (
				// Show all tool groups if no specific tool is selected
				<div className='space-y-12'>
					{TOOL_GROUPS.map((toolGroup) => (
						<ToolGroupTemplate
							key={toolGroup.id}
							title={toolGroup.name}
							description={toolGroup.description}
						>
							<div className='grid grid-cols-1 gap-6'>
								{toolGroup.tools.map((t) => {
									const ToolComp = toolComponents[t.component];
									if (!ToolComp) return null;
									return (
										<Suspense key={t.id} fallback={<LoadingSpinner />}>
											<ToolComp />
										</Suspense>
									);
								})}
							</div>
						</ToolGroupTemplate>
					))}
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
