import { AnimatedBackgroundOrbs } from '@/components/atoms';
import VisualNotesCanvas from '@/components/organisms/VisualNotesCanvas/VisualNotesCanvas';
import VisualNotesSidebar from '@/components/organisms/VisualNotesSidebar/VisualNotesSidebar';
import VisualNotesToolbar from '@/components/organisms/VisualNotesToolbar/VisualNotesToolbar';
import {
	Sidebar,
	SidebarContent,
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
	useSidebar,
} from '@/components/ui/sidebar';
import { useAppSelector } from '@/store/hooks';
import { ReactFlowProvider } from '@xyflow/react';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

const SidebarToggleButton = () => {
	const { state } = useSidebar();
	const isOpen = state === 'expanded';

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.8 }}
			animate={{
				opacity: 1,
				scale: 1,
				left: isOpen ? 'calc(var(--sidebar-width) + 1rem)' : '0px',
			}}
			transition={{ duration: 0.2, ease: 'easeInOut' }}
			className='fixed top-8 z-30 hidden md:block'
		>
			<SidebarTrigger className='glass-strong p-2 hover:bg-white/10 text-white transition-all duration-300 h-10 w-10' />
		</motion.div>
	);
};

const VisualNotesPage = () => {
	const selectedNoteId = useAppSelector((state) => state.visualNotes.selectedNoteId);
	const notes = useAppSelector((state) => state.visualNotes.notes);
	const selectedNote = useMemo(
		() => notes.find((n) => n.id === selectedNoteId),
		[notes, selectedNoteId]
	);

	return (
		<div className='min-h-screen relative bg-background-gradient'>
			<AnimatedBackgroundOrbs variant='full' />

			{/* Content */}
			<div className='relative z-10 min-h-screen'>
				<SidebarProvider defaultOpen={true} width='24rem'>
					<Sidebar
						side='left'
						variant='sidebar'
						collapsible='offcanvas'
						className='bg-background-gradient border-r border-glass-border'
					>
						<SidebarContent>
							<VisualNotesSidebar />
						</SidebarContent>
					</Sidebar>

					{/* Desktop Sidebar Toggle */}
					<SidebarToggleButton />

					{/* Main Content */}
					<SidebarInset className='overflow-hidden h-screen bg-transparent flex flex-col'>
						<div className='flex-1 flex flex-col relative'>
							{selectedNote && (
								<ReactFlowProvider>
									{/* Toolbar with Search */}
									<div className='p-4 z-20'>
										<VisualNotesToolbar noteId={selectedNote.id} />
									</div>

									{/* Canvas */}
									<div className='flex-1 min-h-0 relative'>
										<VisualNotesCanvas noteId={selectedNote.id} />
									</div>
								</ReactFlowProvider>
							)}
							{!selectedNote && (
								<div className='flex-1 flex items-center justify-center'>
									<div className='text-center'>
										<h2 className='text-2xl font-bold text-text-primary mb-2'>No note selected</h2>
										<p className='text-text-secondary'>
											Select a note from the sidebar to start editing
										</p>
									</div>
								</div>
							)}
						</div>
					</SidebarInset>
				</SidebarProvider>
			</div>
		</div>
	);
};

export default VisualNotesPage;
