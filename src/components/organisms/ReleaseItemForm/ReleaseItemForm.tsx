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
import { useReducer } from 'react';

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

interface ReleaseItemFormState {
	selectedTemplate: string;
	repoName: string;
	repoLink: string;
	prLink: string;
	leadName: string;
	description: string;
	selectedStatuses: string[];
	newStatusInput: string;
	showAddStatus: boolean;
}

type ReleaseItemFormAction =
	| { type: 'SET_SELECTED_TEMPLATE'; payload: string }
	| { type: 'SET_REPO_NAME'; payload: string }
	| { type: 'SET_REPO_LINK'; payload: string }
	| { type: 'SET_PR_LINK'; payload: string }
	| { type: 'SET_LEAD_NAME'; payload: string }
	| { type: 'SET_DESCRIPTION'; payload: string }
	| { type: 'SET_SELECTED_STATUSES'; payload: string[] }
	| { type: 'SET_NEW_STATUS_INPUT'; payload: string }
	| { type: 'SET_SHOW_ADD_STATUS'; payload: boolean }
	| { type: 'ADD_CUSTOM_STATUS'; payload: string }
	| { type: 'REMOVE_STATUS'; payload: string }
	| { type: 'TOGGLE_STATUS'; payload: string }
	| { type: 'LOAD_TEMPLATE'; payload: { repoName: string; repoLink: string; leadName: string } }
	| { type: 'CLEAR_TEMPLATE' }
	| { type: 'INIT_STATUSES'; payload: string[] };

const createInitialState = (defaultStatuses: string[]): ReleaseItemFormState => ({
	selectedTemplate: '',
	repoName: '',
	repoLink: '',
	prLink: '',
	leadName: '',
	description: '',
	selectedStatuses: defaultStatuses,
	newStatusInput: '',
	showAddStatus: false,
});

const releaseItemFormReducer = (
	state: ReleaseItemFormState,
	action: ReleaseItemFormAction
): ReleaseItemFormState => {
	switch (action.type) {
		case 'SET_SELECTED_TEMPLATE':
			return { ...state, selectedTemplate: action.payload };
		case 'SET_REPO_NAME':
			return { ...state, repoName: action.payload };
		case 'SET_REPO_LINK':
			return { ...state, repoLink: action.payload };
		case 'SET_PR_LINK':
			return { ...state, prLink: action.payload };
		case 'SET_LEAD_NAME':
			return { ...state, leadName: action.payload };
		case 'SET_DESCRIPTION':
			return { ...state, description: action.payload };
		case 'SET_SELECTED_STATUSES':
			return { ...state, selectedStatuses: action.payload };
		case 'SET_NEW_STATUS_INPUT':
			return { ...state, newStatusInput: action.payload };
		case 'SET_SHOW_ADD_STATUS':
			return { ...state, showAddStatus: action.payload };
		case 'ADD_CUSTOM_STATUS':
			if (action.payload && !state.selectedStatuses.includes(action.payload)) {
				return {
					...state,
					selectedStatuses: [...state.selectedStatuses, action.payload],
					newStatusInput: '',
					showAddStatus: false,
				};
			}
			return state;
		case 'REMOVE_STATUS':
			return {
				...state,
				selectedStatuses: state.selectedStatuses.filter((s) => s !== action.payload),
			};
		case 'TOGGLE_STATUS':
			if (state.selectedStatuses.includes(action.payload)) {
				return {
					...state,
					selectedStatuses: state.selectedStatuses.filter((s) => s !== action.payload),
				};
			} else {
				return {
					...state,
					selectedStatuses: [...state.selectedStatuses, action.payload],
				};
			}
		case 'LOAD_TEMPLATE':
			return {
				...state,
				repoName: action.payload.repoName,
				repoLink: action.payload.repoLink,
				leadName: action.payload.leadName,
			};
		case 'CLEAR_TEMPLATE':
			return {
				...state,
				repoName: '',
				repoLink: '',
				prLink: '',
				leadName: '',
			};
		case 'INIT_STATUSES':
			return { ...state, selectedStatuses: action.payload };
		default:
			return state;
	}
};

const ReleaseItemForm = ({ onSubmit, onCancel }: ReleaseItemFormProps) => {
	// Get templates, appearance settings, and default statuses from Redux store
	const templates = useAppSelector((state) => state.settings.templates);
	const appearance = useAppSelector((state) => state.settings.appearanceSettings);
	const globalStatuses = useAppSelector((state) => state.settings.customStatuses);

	const [formState, formDispatch] = useReducer(
		releaseItemFormReducer,
		createInitialState(globalStatuses.filter((s) => s.isVisible).map((s) => s.name))
	);

	// Handle template selection
	const handleTemplateSelect = (templateId: string) => {
		formDispatch({ type: 'SET_SELECTED_TEMPLATE', payload: templateId });
		if (templateId === 'none') {
			// Clear all fields
			formDispatch({ type: 'CLEAR_TEMPLATE' });
			return;
		}

		const template = templates.find((t) => t.id === templateId);
		if (template) {
			formDispatch({
				type: 'LOAD_TEMPLATE',
				payload: {
					repoName: template.repoName,
					repoLink: template.repoLink,
					leadName: template.leadName || '',
				},
			});
		}
	};

	const handleAddCustomStatus = () => {
		const trimmedStatus = formState.newStatusInput.trim();
		if (trimmedStatus) {
			formDispatch({ type: 'ADD_CUSTOM_STATUS', payload: trimmedStatus });
		}
	};

	const handleRemoveStatus = (statusToRemove: string) => {
		formDispatch({ type: 'REMOVE_STATUS', payload: statusToRemove });
	};

	const handleToggleStatus = (statusName: string) => {
		formDispatch({ type: 'TOGGLE_STATUS', payload: statusName });
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (formState.repoName.trim() && formState.repoLink.trim()) {
			onSubmit({
				repoName: formState.repoName.trim(),
				repoLink: formState.repoLink.trim(),
				prLink: formState.prLink.trim() || undefined,
				leadName: formState.leadName.trim() || undefined,
				description: formState.description.trim() || undefined,
				customStatuses:
					formState.selectedStatuses.length > 0 ? formState.selectedStatuses : undefined,
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
					<Select value={formState.selectedTemplate} onValueChange={handleTemplateSelect}>
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
					value={formState.repoName}
					onChange={(e) => formDispatch({ type: 'SET_REPO_NAME', payload: e.target.value })}
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
					value={formState.repoLink}
					onChange={(e) => formDispatch({ type: 'SET_REPO_LINK', payload: e.target.value })}
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
						value={formState.prLink}
						onChange={(e) => formDispatch({ type: 'SET_PR_LINK', payload: e.target.value })}
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
						value={formState.leadName}
						onChange={(e) => formDispatch({ type: 'SET_LEAD_NAME', payload: e.target.value })}
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
						value={formState.description}
						onChange={(e) => formDispatch({ type: 'SET_DESCRIPTION', payload: e.target.value })}
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
										formState.selectedStatuses.includes(status.name)
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
				{formState.selectedStatuses.some(
					(s) => !globalStatuses.find((gs) => gs.name === s && gs.isVisible)
				) && (
					<div className='space-y-2'>
						<div className='text-xs text-white/60'>Custom statuses for this item:</div>
						<div className='flex flex-wrap gap-2'>
							{formState.selectedStatuses
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
					{!formState.showAddStatus ? (
						<Button
							type='button'
							onClick={() => formDispatch({ type: 'SET_SHOW_ADD_STATUS', payload: true })}
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
								value={formState.newStatusInput}
								onChange={(e) =>
									formDispatch({ type: 'SET_NEW_STATUS_INPUT', payload: e.target.value })
								}
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
								disabled={!formState.newStatusInput.trim()}
								className='bg-pink-500 hover:bg-pink-600 text-white'
							>
								Add
							</Button>
							<Button
								type='button'
								onClick={() => {
									formDispatch({ type: 'SET_SHOW_ADD_STATUS', payload: false });
									formDispatch({ type: 'SET_NEW_STATUS_INPUT', payload: '' });
								}}
								variant='outline'
								className='bg-white/5 hover:bg-white/10 border-white/20 text-text-secondary'
							>
								Cancel
							</Button>
						</div>
					)}
				</div>

				{formState.selectedStatuses.length === 0 && (
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
