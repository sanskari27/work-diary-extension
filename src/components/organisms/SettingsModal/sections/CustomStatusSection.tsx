import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
	addCustomStatus,
	deleteCustomStatus,
	toggleStatusVisibility,
	updateCustomStatus,
} from '@/store/slices/settingsSlice';
import { Edit2, Eye, EyeOff, Plus, Save, Trash2, X } from 'lucide-react';
import { useReducer } from 'react';

interface CustomStatusSectionState {
	isAdding: boolean;
	editingId: string | null;
	newStatusName: string;
	editStatusName: string;
}

type CustomStatusSectionAction =
	| { type: 'SET_IS_ADDING'; payload: boolean }
	| { type: 'SET_EDITING_ID'; payload: string | null }
	| { type: 'SET_NEW_STATUS_NAME'; payload: string }
	| { type: 'SET_EDIT_STATUS_NAME'; payload: string }
	| { type: 'RESET_FORM' }
	| { type: 'START_EDIT'; payload: { id: string; name: string } };

const initialState: CustomStatusSectionState = {
	isAdding: false,
	editingId: null,
	newStatusName: '',
	editStatusName: '',
};

const customStatusSectionReducer = (
	state: CustomStatusSectionState,
	action: CustomStatusSectionAction
): CustomStatusSectionState => {
	switch (action.type) {
		case 'SET_IS_ADDING':
			return { ...state, isAdding: action.payload };
		case 'SET_EDITING_ID':
			return { ...state, editingId: action.payload };
		case 'SET_NEW_STATUS_NAME':
			return { ...state, newStatusName: action.payload };
		case 'SET_EDIT_STATUS_NAME':
			return { ...state, editStatusName: action.payload };
		case 'RESET_FORM':
			return initialState;
		case 'START_EDIT':
			return {
				...state,
				editingId: action.payload.id,
				editStatusName: action.payload.name,
			};
		default:
			return state;
	}
};

const CustomStatusSection = () => {
	const dispatch = useAppDispatch();
	const statuses = useAppSelector((state) => state.settings.customStatuses);
	const [state, formDispatch] = useReducer(customStatusSectionReducer, initialState);

	const handleAdd = () => {
		if (state.newStatusName.trim()) {
			dispatch(addCustomStatus(state.newStatusName.trim()));
			formDispatch({ type: 'RESET_FORM' });
		}
	};

	const handleUpdate = (id: string) => {
		if (state.editStatusName.trim()) {
			dispatch(updateCustomStatus({ id, updates: { name: state.editStatusName.trim() } }));
			formDispatch({ type: 'RESET_FORM' });
		}
	};

	const startEdit = (status: any) => {
		formDispatch({ type: 'START_EDIT', payload: { id: status.id, name: status.name } });
	};

	const cancelEdit = () => {
		formDispatch({ type: 'RESET_FORM' });
	};

	return (
		<div className='space-y-6'>
			<div>
				<h3 className='text-xl font-semibold text-text-primary mb-2'>Custom Status Management</h3>
				<p className='text-sm text-text-secondary mb-4'>
					Manage status checkboxes for release elements globally
				</p>
			</div>

			{/* Add New Status Form */}
			{state.isAdding && (
				<div className='glass-strong rounded-xl p-4 space-y-3 border border-glass-border-strong'>
					<h4 className='font-medium text-text-primary'>New Status</h4>
					<div>
						<Label htmlFor='statusName' className='text-text-secondary'>
							Status Name *
						</Label>
						<Input
							id='statusName'
							value={state.newStatusName}
							onChange={(e) =>
								formDispatch({ type: 'SET_NEW_STATUS_NAME', payload: e.target.value })
							}
							className='bg-slate-800/50 border-glass-border text-white'
							placeholder='e.g., Code Review'
							onKeyDown={(e) => {
								if (e.key === 'Enter') handleAdd();
							}}
						/>
					</div>
					<div className='flex gap-2'>
						<Button onClick={handleAdd} size='sm' variant='default'>
							<Save className='w-4 h-4 mr-2' />
							Add Status
						</Button>
						<Button onClick={cancelEdit} size='sm' variant='ghost'>
							<X className='w-4 h-4 mr-2' />
							Cancel
						</Button>
					</div>
				</div>
			)}

			{/* Add Status Button */}
			{!state.isAdding && !state.editingId && (
				<Button
					onClick={() => formDispatch({ type: 'SET_IS_ADDING', payload: true })}
					className='bg-primary/20 hover:bg-primary/30 border border-glass-border-strong text-text-primary'
				>
					<Plus className='w-4 h-4 mr-2' />
					Add Custom Status
				</Button>
			)}

			{/* Statuses List */}
			<div className='space-y-2'>
				<div className='flex items-center justify-between text-xs text-text-muted px-4 mb-2'>
					<span>Status Name</span>
					<span>Actions</span>
				</div>
				{statuses.map((status) => (
					<div
						key={status.id}
						className={`glass rounded-xl p-4 border transition-colors ${
							status.isVisible
								? 'border-glass-border hover:border-glass-border-strong'
								: 'border-slate-700/50 opacity-60'
						}`}
					>
						{state.editingId === status.id ? (
							<div className='space-y-3'>
								<div>
									<Label className='text-text-secondary'>Status Name</Label>
									<Input
										value={state.editStatusName}
										onChange={(e) =>
											formDispatch({ type: 'SET_EDIT_STATUS_NAME', payload: e.target.value })
										}
										className='bg-slate-800/50 border-glass-border text-white'
										onKeyDown={(e) => {
											if (e.key === 'Enter') handleUpdate(status.id);
										}}
									/>
								</div>
								<div className='flex gap-2'>
									<Button onClick={() => handleUpdate(status.id)} size='sm' variant='default'>
										<Save className='w-4 h-4' />
										Save
									</Button>
									<Button
										onClick={cancelEdit}
										size='sm'
										variant='ghost'
										className='border-slate-600 text-text-secondary'
									>
										<X className='w-4 h-4' />
										Cancel
									</Button>
								</div>
							</div>
						) : (
							<div className='flex items-center justify-between'>
								<div className='flex items-center gap-3 flex-1'>
									<div className='flex items-center gap-2'>
										<button
											onClick={() => dispatch(toggleStatusVisibility(status.id))}
											className='text-text-secondary hover:text-text-primary transition-colors'
											title={status.isVisible ? 'Hide status' : 'Show status'}
										>
											{status.isVisible ? (
												<Eye className='w-4 h-4' />
											) : (
												<EyeOff className='w-4 h-4' />
											)}
										</button>
									</div>
									<div className='flex-1'>
										<h4
											className={`font-medium ${
												status.isVisible ? 'text-text-primary' : 'text-text-muted'
											}`}
										>
											{status.name}
										</h4>
										{status.isDefault && <p className='text-xs text-text-muted'>Default status</p>}
									</div>
								</div>
								<div className='flex gap-2'>
									<Button
										onClick={() => startEdit(status)}
										size='sm'
										variant='ghost'
										className='text-text-primary hover:text-text-primary hover:bg-primary/20'
									>
										<Edit2 className='w-4 h-4' />
									</Button>
									{!status.isDefault && (
										<Button
											onClick={() => dispatch(deleteCustomStatus(status.id))}
											size='sm'
											variant='ghost'
											className='text-red-400 hover:text-red-300 hover:bg-red-600/20'
										>
											<Trash2 className='w-4 h-4' />
										</Button>
									)}
								</div>
							</div>
						)}
					</div>
				))}
			</div>

			<div className='glass-strong rounded-xl p-4 border border-blue-500/30 bg-blue-500/5'>
				<p className='text-sm text-text-accent'>
					<strong>Note:</strong> Default statuses (Handover Completed, Support Stamping, etc.)
					cannot be deleted but can be hidden using the eye icon.
				</p>
			</div>
		</div>
	);
};

export default CustomStatusSection;
