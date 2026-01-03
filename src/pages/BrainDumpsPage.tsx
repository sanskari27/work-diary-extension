import { SearchBar, Text } from '@/components/atoms';
import { BrainDumpCard } from '@/components/organisms';
import { PageLayout } from '@/components/templates';
import { useAppearanceStyles } from '@/hooks/useAppearanceStyles';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { BrainDumpEntry, deleteEntry, updateEntry } from '@/store/slices/brainDumpSlice';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function BrainDumpsPage() {
	const dispatch = useAppDispatch();
	const entries = useAppSelector((state) => state.brainDump.entries) || [];
	const { appearance, page: spacing } = useAppearanceStyles();
	const [searchQuery, setSearchQuery] = useState('');

	// Sort and filter entries
	const filteredEntries = useMemo(() => {
		let filtered = [...entries];

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase().trim();
			filtered = filtered.filter((entry) => entry.content.toLowerCase().includes(query));
		}

		// Sort by timestamp (newest first)
		return filtered.sort((a, b) => b.timestamp - a.timestamp);
	}, [entries, searchQuery]);

	const handleDelete = (entryId: string) => {
		dispatch(deleteEntry(entryId));
	};

	const handleUpdate = (entryId: string, updates: Partial<BrainDumpEntry>) => {
		dispatch(updateEntry({ id: entryId, updates }));
	};

	return (
		<PageLayout>
			<div className={`min-h-screen ${spacing.padding} flex flex-col`}>
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.2 }}
					className='max-w-7xl mx-auto w-full flex-1 flex flex-col'
				>
					{/* Page Header */}
					<motion.div
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.25 }}
						className={`${spacing.headerMargin} flex items-center justify-between`}
					>
						<div className='flex items-center gap-4'>
							{!appearance.minimalMode && (
								<motion.div
									animate={{
										scale: [1, 1.05, 1],
										rotate: [0, 5, 0],
									}}
									transition={{
										duration: 2,
										repeat: Infinity,
										ease: 'easeInOut',
									}}
									className={`${
										appearance.compactMode ? 'p-3' : 'p-4'
									} rounded-2xl bg-icon-gradient`}
								>
									<Brain className={spacing.iconSize + ' text-white'} />
								</motion.div>
							)}
							<Text
								variant='h1'
								className={`${spacing.titleSize} font-black bg-clip-text text-transparent bg-gradient-text`}
							>
								Brain Dumps
							</Text>
						</div>
					</motion.div>

					{/* Search Bar */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.25, delay: 0.1 }}
						className={`${spacing.headerMargin}`}
					>
						<SearchBar
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							onClear={() => setSearchQuery('')}
							placeholder='Search brain dumps...'
							className='w-full'
						/>
					</motion.div>

					{/* Stats */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.25, delay: 0.125 }}
						className={`${spacing.headerMargin} flex flex-wrap gap-${
							appearance.compactMode ? '4' : '6'
						} items-center`}
					>
						<div className='flex items-center gap-2'>
							<span className='text-sm text-text-secondary'>
								{searchQuery.trim() ? 'Filtered:' : 'Total:'}
							</span>
							<span className='text-2xl font-bold text-white'>
								{searchQuery.trim() ? filteredEntries.length : entries.length}
							</span>
							{searchQuery.trim() && (
								<span className='text-sm text-text-secondary/60'>of {entries.length}</span>
							)}
						</div>
					</motion.div>

					{/* Content Area */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.25, delay: 0.15 }}
						className={`flex-1 ${appearance.compactMode ? 'pb-4' : 'pb-8'}`}
					>
						{filteredEntries.length > 0 ? (
							<div className='columns-1 md:columns-2 lg:columns-3 gap-4'>
								{filteredEntries.map((entry, index) => (
									<motion.div
										key={entry.id}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: index * 0.05 }}
										className='break-inside-avoid mb-4'
									>
										<BrainDumpCard entry={entry} onDelete={handleDelete} onUpdate={handleUpdate} />
									</motion.div>
								))}
							</div>
						) : searchQuery.trim() ? (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.25, delay: 0.2 }}
								className='flex-1 flex items-center justify-center'
							>
								<div className='text-center space-y-4'>
									<Brain className='w-16 h-16 text-text-accent/40 mx-auto' />
									<div className='space-y-2'>
										<h3 className='text-2xl font-semibold text-text-secondary'>No results found</h3>
										<p className='text-text-secondary/50'>Try adjusting your search query</p>
									</div>
								</div>
							</motion.div>
						) : (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.25, delay: 0.2 }}
								className='flex-1 flex items-center justify-center'
							>
								<div className='text-center space-y-4'>
									<Brain className='w-16 h-16 text-text-accent/40 mx-auto' />
									<div className='space-y-2'>
										<h3 className='text-2xl font-semibold text-text-secondary'>
											No brain dumps yet
										</h3>
										<p className='text-text-secondary/50'>
											Use the extension popup or homepage to dump your thoughts
										</p>
									</div>
								</div>
							</motion.div>
						)}
					</motion.div>
				</motion.div>
			</div>
		</PageLayout>
	);
}
