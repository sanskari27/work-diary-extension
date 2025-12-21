import { cn } from '@/lib/utils';
import { Node } from '@/types/notebooks';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface NodeTokenProps {
	node: Node;
	className?: string;
	truncate?: boolean;
	maxLength?: number;
}

const NodeToken = ({ node, className, truncate = false, maxLength = 100 }: NodeTokenProps) => {
	const renderContent = () => {
		if (truncate && node.content.length > maxLength) {
			return node.content.substring(0, maxLength) + '...';
		}

		switch (node.type) {
			case 'text':
				// Simple markdown-lite rendering
				const lines = node.content.split('\n');
				return (
					<div className='space-y-1'>
						{lines.map((line, idx) => {
							// Handle bullet points
							if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
								return (
									<div key={idx} className='flex items-start gap-2'>
										<span className='text-text-secondary'>•</span>
										<span>{line.replace(/^[-*]\s+/, '')}</span>
									</div>
								);
							}
							// Handle links
							const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
							const parts = [];
							let lastIndex = 0;
							let match;
							while ((match = linkRegex.exec(line)) !== null) {
								if (match.index > lastIndex) {
									parts.push({ type: 'text', content: line.substring(lastIndex, match.index) });
								}
								parts.push({
									type: 'link',
									text: match[1],
									url: match[2],
								});
								lastIndex = match.index + match[0].length;
							}
							if (lastIndex < line.length) {
								parts.push({ type: 'text', content: line.substring(lastIndex) });
							}

							if (parts.length > 0) {
								return (
									<div key={idx}>
										{parts.map((part, partIdx) =>
											part.type === 'link' ? (
												<a
													key={partIdx}
													href={part.url}
													target='_blank'
													rel='noopener noreferrer'
													className='text-primary hover:underline'
													onClick={(e) => e.stopPropagation()}
												>
													{part.text}
												</a>
											) : (
												<span key={partIdx}>{part.content}</span>
											)
										)}
									</div>
								);
							}

							return <div key={idx}>{line || '\u00A0'}</div>;
						})}
					</div>
				);

			case 'code':
				// Extract language from first line if present (```language)
				let code = node.content;
				let language = 'javascript';
				const langMatch = code.match(/^```(\w+)\n/);
				if (langMatch) {
					language = langMatch[1];
					code = code.replace(/^```\w+\n/, '').replace(/\n```$/, '');
				} else if (code.startsWith('```')) {
					code = code.replace(/^```/, '').replace(/```$/, '');
				}

				return (
					<SyntaxHighlighter
						language={language}
						style={vscDarkPlus}
						customStyle={{
							margin: 0,
							padding: '0.5rem',
							background: 'transparent',
							fontSize: '0.875rem',
						}}
						PreTag='div'
					>
						{code}
					</SyntaxHighlighter>
				);

			case 'link':
				try {
					const url = new URL(node.content);
					return (
						<a
							href={node.content}
							target='_blank'
							rel='noopener noreferrer'
							className='text-primary hover:underline break-all'
							onClick={(e) => e.stopPropagation()}
						>
							{url.hostname + url.pathname}
						</a>
					);
				} catch {
					return <span className='break-all'>{node.content}</span>;
				}

			default:
				return <span>{node.content}</span>;
		}
	};

	return <div className={cn('text-sm text-text-primary', className)}>{renderContent()}</div>;
};

export default NodeToken;
