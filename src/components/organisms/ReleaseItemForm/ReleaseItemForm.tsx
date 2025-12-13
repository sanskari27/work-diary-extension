import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAppSelector } from '@/store/hooks';
import {
	FileText,
	Github,
	Link as LinkIcon,
	ListChecks,
	Plus,
	Sparkles,
	User,
	X,
} from 'lucide-react';
import { useState } from 'react';

interface ReleaseItemFormProps {
	onSubmit: (data: {
		repoName: string;
		repoLink: string;
		prLink?: string;
		leadName?: string;
		description?: string;
		customStatuses?: string[];
	}) => void;
	onCancel: () => void;
}

const ReleaseItemForm = ({ onSubmit, onCancel }: ReleaseItemFormProps) => {
	// Get templates, appearance settings, and default statuses from Redux store
	const templates = useAppSelector((state) => state.settings.templates);
	const appearance = useAppSelector((state) => state.settings.appearanceSettings);
	const globalStatuses = useAppSelector((state) => state.settings.customStatuses);

	const [selectedTemplate, setSelectedTemplate] = useState<string>('');
	const [repoName, setRepoName] = useState('');
	const [repoLink, setRepoLink] = useState('');
	const [prLink, setPrLink] = useState('');
	const [leadName, setLeadName] = useState('');
	const [description, setDescription] = useState('');

	// Status management
	const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
		globalStatuses.filter((s) => s.isVisible).map((s) => s.name)
	);
	const [newStatusInput, setNewStatusInput] = useState('');
	const [showAddStatus, setShowAddStatus] = useState(false);

	// Handle template selection
	const handleTemplateSelect = (templateId: string) => {
		setSelectedTemplate(templateId);
		if (templateId === 'none') {
			// Clear all fields
			setRepoName('');
			setRepoLink('');
			setPrLink('');
			setLeadName('');
			return;
		}

		const template = templates.find((t) => t.id === templateId);
		if (template) {
			setRepoName(template.repoName);
			setRepoLink(template.repoLink);
			setPrLink(template.prLinkFormat || '');
			setLeadName(template.leadName || '');
		}
	};

	const handleAddCustomStatus = () => {
		const trimmedStatus = newStatusInput.trim();
		if (trimmedStatus && !selectedStatuses.includes(trimmedStatus)) {
			setSelectedStatuses([...selectedStatuses, trimmedStatus]);
			setNewStatusInput('');
			setShowAddStatus(false);
		}
	};

	const handleRemoveStatus = (statusToRemove: string) => {
		setSelectedStatuses(selectedStatuses.filter((s) => s !== statusToRemove));
	};

	const handleToggleStatus = (statusName: string) => {
		if (selectedStatuses.includes(statusName)) {
			setSelectedStatuses(selectedStatuses.filter((s) => s !== statusName));
		} else {
			setSelectedStatuses([...selectedStatuses, statusName]);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (repoName.trim() && repoLink.trim()) {
			onSubmit({
				repoName: repoName.trim(),
				repoLink: repoLink.trim(),
				prLink: prLink.trim() || undefined,
				leadName: leadName.trim() || undefined,
				description: description.trim() || undefined,
				customStatuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
			});
		}
	};

	return (
		<form onSubmit={handleSubmit} className='space-y-5'>
			{/* Template Selector */}
			{templates.length > 0 && (
				<div className='space-y-2'>
					<Label className='text-sm font-medium text-text-secondary flex items-center gap-2'>
						<Sparkles className='w-4 h-4' />
						Use Template (Optional)
					</Label>
					<Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
						<SelectTrigger className='w-full bg-white/10 border-white/20 text-white'>
							<SelectValue placeholder='Select a template...' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='none'>None - Enter manually</SelectItem>
							{templates.map((template) => (
								<SelectItem key={template.id} value={template.id}>
									{template.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			)}

			{/* Repo Name */}
			<div className='space-y-2'>
				<Label className='text-sm font-medium text-text-secondary flex items-center gap-2'>
					<Github className='w-4 h-4' />
					Repository Name *
				</Label>
				<Input
					type='text'
					value={repoName}
					onChange={(e) => setRepoName(e.target.value)}
					placeholder='e.g., frontend-app'
					className='w-full bg-white/10 border-white/20 text-white placeholder:text-white/40'
					required
				/>
			</div>

			{/* Repo Link */}
			<div className='space-y-2'>
				<Label className='text-sm font-medium text-text-secondary flex items-center gap-2'>
					<LinkIcon className='w-4 h-4' />
					Repository Link *
				</Label>
				<Input
					type='url'
					value={repoLink}
					onChange={(e) => setRepoLink(e.target.value)}
					placeholder='https://github.com/username/repo'
					className='w-full bg-white/10 border-white/20 text-white placeholder:text-white/40'
					required
				/>
			</div>

			{/* PR Link */}
			{appearance.showPRLinkField && (
				<div className='space-y-2'>
					<Label className='text-sm font-medium text-text-secondary flex items-center gap-2'>
						<LinkIcon className='w-4 h-4' />
						PR Link (Optional)
					</Label>
					<Input
						type='url'
						value={prLink}
						onChange={(e) => setPrLink(e.target.value)}
						placeholder='https://github.com/username/repo/pull/123'
						className='w-full bg-white/10 border-white/20 text-white placeholder:text-white/40'
					/>
				</div>
			)}

			{/* Lead Name */}
			{appearance.showLeadSection && (
				<div className='space-y-2'>
					<Label className='text-sm font-medium text-text-secondary flex items-center gap-2'>
						<User className='w-4 h-4' />
						Lead / Contact Person (Optional)
					</Label>
					<Input
						type='text'
						value={leadName}
						onChange={(e) => setLeadName(e.target.value)}
						placeholder='e.g., John Doe'
						className='w-full bg-white/10 border-white/20 text-white placeholder:text-white/40'
					/>
				</div>
			)}

			{/* Description */}
			{appearance.showDescriptionSection && (
				<div className='space-y-2'>
					<Label className='text-sm font-medium text-text-secondary flex items-center gap-2'>
						<FileText className='w-4 h-4' />
						Description / Notes (Optional)
					</Label>
					<Textarea
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder='Add any context, notes, or important details...'
						rows={4}
						className='w-full bg-white/10 border-white/20 text-white placeholder:text-white/40 resize-none'
					/>
				</div>
			)}

			{/* Status Configuration */}
			<div className='space-y-3'>
				<Label className='text-sm font-medium text-text-secondary flex items-center gap-2'>
					<ListChecks className='w-4 h-4' />
					Statuses for this Item
				</Label>

				{/* Default Statuses Selection */}
				<div className='space-y-2'>
					<div className='text-xs text-white/60 mb-2'>Select from default statuses:</div>
					<div className='flex flex-wrap gap-2'>
						{globalStatuses
							.filter((s) => s.isVisible)
							.map((status) => (
								<button
									key={status.id}
									type='button'
									onClick={() => handleToggleStatus(status.name)}
									className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
										selectedStatuses.includes(status.name)
											? 'bg-primary/80 text-white border border-accent-border'
											: 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
									}`}
								>
									{status.name}
								</button>
							))}
					</div>
				</div>

				{/* Custom Statuses for this item */}
				{selectedStatuses.some(
					(s) => !globalStatuses.find((gs) => gs.name === s && gs.isVisible)
				) && (
					<div className='space-y-2'>
						<div className='text-xs text-white/60'>Custom statuses for this item:</div>
						<div className='flex flex-wrap gap-2'>
							{selectedStatuses
								.filter((s) => !globalStatuses.find((gs) => gs.name === s && gs.isVisible))
								.map((status) => (
									<div
										key={status}
										className='flex items-center gap-1 px-3 py-1.5 rounded-lg bg-pink-500/20 border border-pink-400/30 text-white text-sm'
									>
										<span>{status}</span>
										<button
											type='button'
											onClick={() => handleRemoveStatus(status)}
											className='hover:bg-pink-500/30 rounded p-0.5 transition-colors'
										>
											<X className='w-3 h-3' />
										</button>
									</div>
								))}
						</div>
					</div>
				)}

				{/* Add Custom Status */}
				<div className='space-y-2'>
					{!showAddStatus ? (
						<Button
							type='button'
							onClick={() => setShowAddStatus(true)}
							variant='outline'
							className='w-full bg-white/5 hover:bg-white/10 border-white/20 text-text-secondary flex items-center gap-2'
						>
							<Plus className='w-4 h-4' />
							Add Custom Status (specific to this item)
						</Button>
					) : (
						<div className='flex gap-2'>
							<Input
								type='text'
								value={newStatusInput}
								onChange={(e) => setNewStatusInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault();
										handleAddCustomStatus();
									}
								}}
								placeholder='Enter custom status name...'
								className='flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40'
								autoFocus
							/>
							<Button
								type='button'
								onClick={handleAddCustomStatus}
								disabled={!newStatusInput.trim()}
								className='bg-pink-500 hover:bg-pink-600 text-white'
							>
								Add
							</Button>
							<Button
								type='button'
								onClick={() => {
									setShowAddStatus(false);
									setNewStatusInput('');
								}}
								variant='outline'
								className='bg-white/5 hover:bg-white/10 border-white/20 text-text-secondary'
							>
								Cancel
							</Button>
						</div>
					)}
				</div>

				{selectedStatuses.length === 0 && (
					<p className='text-xs text-yellow-400/80 flex items-center gap-1'>
						<span>⚠️</span>
						No statuses selected. Item will be created without status tracking.
					</p>
				)}
			</div>

			{/* Action Buttons */}
			<div className='flex gap-3 pt-4'>
				<Button
					type='button'
					onClick={onCancel}
					variant='outline'
					className='flex-1 bg-white/10 hover:bg-white/15 border-white/20 text-white'
				>
					Cancel
				</Button>
				<Button type='submit' variant='gradient' className='flex-1'>
					Add Item
				</Button>
			</div>
		</form>
	);
};

export default ReleaseItemForm;
