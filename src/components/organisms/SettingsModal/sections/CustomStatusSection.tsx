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
import { useState } from 'react';

const CustomStatusSection = () => {
	const dispatch = useAppDispatch();
	const statuses = useAppSelector((state) => state.settings.customStatuses);
	const [isAdding, setIsAdding] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [newStatusName, setNewStatusName] = useState('');
	const [editStatusName, setEditStatusName] = useState('');

	const handleAdd = () => {
		if (newStatusName.trim()) {
			dispatch(addCustomStatus(newStatusName.trim()));
			setNewStatusName('');
			setIsAdding(false);
		}
	};

	const handleUpdate = (id: string) => {
		if (editStatusName.trim()) {
			dispatch(updateCustomStatus({ id, updates: { name: editStatusName.trim() } }));
			setEditingId(null);
			setEditStatusName('');
		}
	};

	const startEdit = (status: any) => {
		setEditingId(status.id);
		setEditStatusName(status.name);
	};

	const cancelEdit = () => {
		setEditingId(null);
		setIsAdding(false);
		setNewStatusName('');
		setEditStatusName('');
	};

	return (
		<div className='space-y-6'>
			<div>
				<h3 className='text-xl font-semibold text-purple-300 mb-2'>
					Custom Status Management
				</h3>
				<p className='text-sm text-slate-400 mb-4'>
					Manage status checkboxes for release elements globally
				</p>
			</div>

			{/* Add New Status Form */}
			{isAdding && (
				<div className='glass-strong rounded-xl p-4 space-y-3 border border-purple-500/30'>
					<h4 className='font-medium text-purple-300'>New Status</h4>
					<div>
						<Label htmlFor='statusName' className='text-slate-300'>
							Status Name *
						</Label>
						<Input
							id='statusName'
							value={newStatusName}
							onChange={(e) => setNewStatusName(e.target.value)}
							className='bg-slate-800/50 border-purple-500/30 text-white'
							placeholder='e.g., Code Review'
							onKeyDown={(e) => {
								if (e.key === 'Enter') handleAdd();
							}}
						/>
					</div>
					<div className='flex gap-2'>
						<Button
							onClick={handleAdd}
							size='sm'
							className='bg-purple-600 hover:bg-purple-700'
						>
							<Save className='w-4 h-4 mr-2' />
							Add Status
						</Button>
						<Button
							onClick={cancelEdit}
							size='sm'
							variant='outline'
							className='border-slate-600 text-slate-300'
						>
							<X className='w-4 h-4 mr-2' />
							Cancel
						</Button>
					</div>
				</div>
			)}

			{/* Add Status Button */}
			{!isAdding && !editingId && (
				<Button
					onClick={() => setIsAdding(true)}
					className='bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 text-purple-300'
				>
					<Plus className='w-4 h-4 mr-2' />
					Add Custom Status
				</Button>
			)}

			{/* Statuses List */}
			<div className='space-y-2'>
				<div className='flex items-center justify-between text-xs text-slate-500 px-4 mb-2'>
					<span>Status Name</span>
					<span>Actions</span>
				</div>
				{statuses.map((status) => (
					<div
						key={status.id}
						className={`glass-strong rounded-xl p-4 border transition-colors ${
							status.isVisible
								? 'border-purple-500/20 hover:border-purple-500/40'
								: 'border-slate-700/50 opacity-60'
						}`}
					>
						{editingId === status.id ? (
							<div className='space-y-3'>
								<div>
									<Label className='text-slate-300'>Status Name</Label>
									<Input
										value={editStatusName}
										onChange={(e) => setEditStatusName(e.target.value)}
										className='bg-slate-800/50 border-purple-500/30 text-white'
										onKeyDown={(e) => {
											if (e.key === 'Enter') handleUpdate(status.id);
										}}
									/>
								</div>
								<div className='flex gap-2'>
									<Button
										onClick={() => handleUpdate(status.id)}
										size='sm'
										className='bg-purple-600 hover:bg-purple-700'
									>
										<Save className='w-4 h-4' />
										Save
									</Button>
									<Button
										onClick={cancelEdit}
										size='sm'
										variant='ghost'
										className='border-slate-600 text-slate-300'
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
											className='text-slate-400 hover:text-purple-300 transition-colors'
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
												status.isVisible ? 'text-purple-200' : 'text-slate-500'
											}`}
										>
											{status.name}
										</h4>
										{status.isDefault && (
											<p className='text-xs text-slate-500'>Default status</p>
										)}
									</div>
								</div>
								<div className='flex gap-2'>
									<Button
										onClick={() => startEdit(status)}
										size='sm'
										variant='ghost'
										className='text-purple-300 hover:text-purple-200 hover:bg-purple-600/20'
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
				<p className='text-sm text-blue-300'>
					<strong>Note:</strong> Default statuses (Handover Completed, Support
					Stamping, etc.) cannot be deleted but can be hidden using the eye icon.
				</p>
			</div>
		</div>
	);
};

export default CustomStatusSection;
