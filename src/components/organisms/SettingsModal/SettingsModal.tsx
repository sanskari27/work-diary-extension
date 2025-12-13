import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import { useState } from 'react';
import AppearanceSection from './sections/AppearanceSection';
import BackupSyncSection from './sections/BackupSyncSection';
import CustomStatusSection from './sections/CustomStatusSection';
import ReleaseEventDefaultsSection from './sections/ReleaseEventDefaultsSection';
import ReminderPreferencesSection from './sections/ReminderPreferencesSection';
import TemplatesSection from './sections/TemplatesSection';

interface SettingsModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const SettingsModal = ({ open, onOpenChange }: SettingsModalProps) => {
	const [activeTab, setActiveTab] = useState('templates');

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-w-5xl h-[85vh] backdrop-blur-xl border-glass-border text-white flex flex-col bg-background-gradient'>
				<DialogHeader className='flex-shrink-0'>
					<DialogTitle className='flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent'>
						<Settings className='w-7 h-7 text-primary' />
						Settings
					</DialogTitle>
				</DialogHeader>

				<Tabs
					value={activeTab}
					onValueChange={setActiveTab}
					className='w-full flex-1 flex flex-col min-h-0'
				>
					<TabsList className='w-full bg-slate-800/50 border border-glass-border grid grid-cols-6 h-auto p-1 flex-shrink-0'>
						<TabsTrigger
							value='templates'
							className='text-xs data-[state=active]:bg-primary/30 data-[state=active]:text-primary'
						>
							Templates
						</TabsTrigger>
						<TabsTrigger
							value='statuses'
							className='text-xs data-[state=active]:bg-primary/30 data-[state=active]:text-primary'
						>
							Statuses
						</TabsTrigger>
						<TabsTrigger
							value='reminders'
							className='text-xs data-[state=active]:bg-primary/30 data-[state=active]:text-primary'
						>
							Reminders
						</TabsTrigger>
						<TabsTrigger
							value='defaults'
							className='text-xs data-[state=active]:bg-primary/30 data-[state=active]:text-primary'
						>
							Defaults
						</TabsTrigger>
						<TabsTrigger
							value='appearance'
							className='text-xs data-[state=active]:bg-primary/30 data-[state=active]:text-primary'
						>
							Appearance
						</TabsTrigger>
						<TabsTrigger
							value='backup'
							className='text-xs data-[state=active]:bg-primary/30 data-[state=active]:text-primary'
						>
							Backup
						</TabsTrigger>
					</TabsList>

					<div className='flex-1 overflow-y-auto mt-4 pr-2 custom-scrollbar min-h-0'>
						<motion.div
							key={activeTab}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.2 }}
						>
							<TabsContent value='templates' className='mt-0'>
								<TemplatesSection />
							</TabsContent>

							<TabsContent value='statuses' className='mt-0'>
								<CustomStatusSection />
							</TabsContent>

							<TabsContent value='reminders' className='mt-0'>
								<ReminderPreferencesSection />
							</TabsContent>

							<TabsContent value='defaults' className='mt-0'>
								<ReleaseEventDefaultsSection />
							</TabsContent>

							<TabsContent value='appearance' className='mt-0'>
								<AppearanceSection />
							</TabsContent>

							<TabsContent value='backup' className='mt-0'>
								<BackupSyncSection />
							</TabsContent>
						</motion.div>
					</div>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
};

export default SettingsModal;
