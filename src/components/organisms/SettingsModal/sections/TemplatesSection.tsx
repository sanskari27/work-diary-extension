import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addTemplate, deleteTemplate, updateTemplate } from '@/store/slices/settingsSlice';
import { Edit2, Plus, Save, Trash2, X } from 'lucide-react';
import { useState } from 'react';

const TemplatesSection = () => {
	const dispatch = useAppDispatch();
	const templates = useAppSelector((state) => state.settings.templates);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [isAdding, setIsAdding] = useState(false);
	const [formData, setFormData] = useState({
		name: '',
		repoName: '',
		repoLink: '',
		leadName: '',
	});

	const handleAdd = () => {
		if (formData.name && formData.repoName && formData.repoLink) {
			dispatch(addTemplate(formData));
			setFormData({
				name: '',
				repoName: '',
				repoLink: '',
				leadName: '',
			});
			setIsAdding(false);
		}
	};

	const handleUpdate = (id: string) => {
		dispatch(updateTemplate({ id, updates: formData }));
		setEditingId(null);
		setFormData({
			name: '',
			repoName: '',
			repoLink: '',
			leadName: '',
		});
	};

	const startEdit = (template: any) => {
		setEditingId(template.id);
		setFormData({
			name: template.name,
			repoName: template.repoName,
			repoLink: template.repoLink,
			leadName: template.leadName || '',
		});
	};

	const cancelEdit = () => {
		setEditingId(null);
		setIsAdding(false);
		setFormData({
			name: '',
			repoName: '',
			repoLink: '',
			leadName: '',
		});
	};

	return (
		<div className='space-y-6'>
			<div>
				<h3 className='text-xl font-semibold text-text-primary mb-2'>Presaved Templates</h3>
				<p className='text-sm text-text-secondary mb-4'>
					Create templates for faster element creation
				</p>
			</div>

			{/* Add New Template Form */}
			{isAdding && (
				<div className='glass rounded-xl p-4 space-y-3 border border-glass-border'>
					<h4 className='font-medium text-text-primary'>New Template</h4>
					<div className='grid grid-cols-2 gap-3'>
						<div>
							<Label htmlFor='name' className='text-text-secondary'>
								Template Name *
							</Label>
							<Input
								id='name'
								value={formData.name}
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								className='bg-slate-800/50 border-glass-border text-white'
								placeholder='My Template'
							/>
						</div>
						<div>
							<Label htmlFor='repoName' className='text-text-secondary'>
								Repo Name *
							</Label>
							<Input
								id='repoName'
								value={formData.repoName}
								onChange={(e) => setFormData({ ...formData, repoName: e.target.value })}
								className='bg-slate-800/50 border-glass-border text-white'
								placeholder='my-repo'
							/>
						</div>
						<div>
							<Label htmlFor='repoLink' className='text-text-secondary'>
								Repo Link *
							</Label>
							<Input
								id='repoLink'
								value={formData.repoLink}
								onChange={(e) => setFormData({ ...formData, repoLink: e.target.value })}
								className='bg-slate-800/50 border-glass-border text-white'
								placeholder='https://github.com/...'
							/>
						</div>
						<div>
							<Label htmlFor='leadName' className='text-text-secondary'>
								Lead Name
							</Label>
							<Input
								id='leadName'
								value={formData.leadName}
								onChange={(e) => setFormData({ ...formData, leadName: e.target.value })}
								className='bg-slate-800/50 border-glass-border text-white'
								placeholder='John Doe'
							/>
						</div>
					</div>
					<div className='flex gap-2'>
						<Button onClick={handleAdd} size='sm' variant='default'>
							<Save className='w-4 h-4' />
							Save Template
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
			)}

			{/* Add Template Button */}
			{!isAdding && !editingId && (
				<Button
					onClick={() => setIsAdding(true)}
					className='bg-primary/20 hover:bg-primary/30 border border-glass-border-strong text-text-primary'
				>
					<Plus className='w-4 h-4 mr-2' />
					Add Template
				</Button>
			)}

			{/* Templates List */}
			<div className='space-y-3'>
				{templates.map((template) => (
					<div
						key={template.id}
						className='glass rounded-xl p-4 border border-glass-border hover:border-glass-border-strong transition-colors'
					>
						{editingId === template.id ? (
							<div className='space-y-3'>
								<div className='grid grid-cols-2 gap-3'>
									<div>
										<Label className='text-text-secondary'>Template Name</Label>
										<Input
											value={formData.name}
											onChange={(e) => setFormData({ ...formData, name: e.target.value })}
											className='bg-slate-800/50 border-glass-border text-white'
										/>
									</div>
									<div>
										<Label className='text-text-secondary'>Repo Name</Label>
										<Input
											value={formData.repoName}
											onChange={(e) => setFormData({ ...formData, repoName: e.target.value })}
											className='bg-slate-800/50 border-glass-border text-white'
										/>
									</div>
									<div>
										<Label className='text-text-secondary'>Repo Link</Label>
										<Input
											value={formData.repoLink}
											onChange={(e) => setFormData({ ...formData, repoLink: e.target.value })}
											className='bg-slate-800/50 border-glass-border text-white'
										/>
									</div>
									<div>
										<Label className='text-text-secondary'>Lead Name</Label>
										<Input
											value={formData.leadName}
											onChange={(e) => setFormData({ ...formData, leadName: e.target.value })}
											className='bg-slate-800/50 border-glass-border text-white'
										/>
									</div>
								</div>
								<div className='flex gap-2'>
									<Button onClick={() => handleUpdate(template.id)} size='sm' variant='default'>
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
							<div className='flex items-start justify-between'>
								<div className='flex-1 space-y-1'>
									<h4 className='font-semibold text-text-primary'>{template.name}</h4>
									<p className='text-sm text-text-secondary'>
										<span className='font-medium'>Repo:</span> {template.repoName}
									</p>
									<p className='text-xs text-slate-500 truncate'>{template.repoLink}</p>
									{template.leadName && (
										<p className='text-xs text-slate-500'>
											<span className='font-medium'>Lead:</span> {template.leadName}
										</p>
									)}
								</div>
								<div className='flex gap-2'>
									<Button
										onClick={() => startEdit(template)}
										size='sm'
										variant='ghost'
										className='text-text-primary hover:text-text-primary hover:bg-primary/20'
									>
										<Edit2 className='w-4 h-4' />
									</Button>
									<Button
										onClick={() => dispatch(deleteTemplate(template.id))}
										size='sm'
										variant='ghost'
										className='text-red-400 hover:text-red-300 hover:bg-red-600/20'
									>
										<Trash2 className='w-4 h-4' />
									</Button>
								</div>
							</div>
						)}
					</div>
				))}

				{templates.length === 0 && !isAdding && (
					<div className='text-center py-8 text-slate-500'>
						<p>No templates yet. Create your first template!</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default TemplatesSection;
