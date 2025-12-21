import { AnimatedBackgroundOrbs } from '@/components/atoms';
import {
	Sidebar,
	SidebarContent,
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
	useSidebar,
} from '@/components/ui/sidebar';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface UtilitiesPageTemplateProps {
	children: ReactNode;
	sidebar: ReactNode;
}

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

const UtilitiesPageTemplate = ({ children, sidebar }: UtilitiesPageTemplateProps) => {
	return (
		<div className='min-h-screen relative bg-background-gradient'>
			<AnimatedBackgroundOrbs variant='full' />

			{/* Content */}
			<div className='relative z-10 min-h-screen'>
				<SidebarProvider defaultOpen={true}>
					<Sidebar
						side='left'
						variant='sidebar'
						collapsible='offcanvas'
						className='bg-background-gradient border-r border-glass-border'
					>
						<SidebarContent>{sidebar}</SidebarContent>
					</Sidebar>

					{/* Desktop Sidebar Toggle - Beside Sidebar */}
					<SidebarToggleButton />

					{/* Main Content */}
					<SidebarInset className='overflow-y-auto h-screen bg-transparent'>
						<div className='w-full mx-auto p-6 h-full'>{children}</div>
					</SidebarInset>
				</SidebarProvider>
			</div>
		</div>
	);
};

export default UtilitiesPageTemplate;
