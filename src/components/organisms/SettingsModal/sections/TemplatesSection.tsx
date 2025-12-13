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
		prLinkFormat: '',
		leadName: '',
	});

	const handleAdd = () => {
		if (formData.name && formData.repoName && formData.repoLink) {
			dispatch(addTemplate(formData));
			setFormData({
				name: '',
				repoName: '',
				repoLink: '',
				prLinkFormat: '',
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
			prLinkFormat: '',
			leadName: '',
		});
	};

	const startEdit = (template: any) => {
		setEditingId(template.id);
		setFormData({
			name: template.name,
			repoName: template.repoName,
			repoLink: template.repoLink,
			prLinkFormat: template.prLinkFormat || '',
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
			prLinkFormat: '',
			leadName: '',
		});
	};

	return (
		<div className='space-y-6'>
			<div>
				<h3 className='text-xl font-semibold text-purple-300 mb-2'>Presaved Templates</h3>
				<p className='text-sm text-slate-400 mb-4'>Create templates for faster element creation</p>
			</div>

			{/* Add New Template Form */}
			{isAdding && (
				<div className='glass rounded-xl p-4 space-y-3 border border-purple-500/30'>
					<h4 className='font-medium text-purple-300'>New Template</h4>
					<div className='grid grid-cols-2 gap-3'>
						<div>
							<Label htmlFor='name' className='text-slate-300'>
								Template Name *
							</Label>
							<Input
								id='name'
								value={formData.name}
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								className='bg-slate-800/50 border-purple-500/30 text-white'
								placeholder='My Template'
							/>
						</div>
						<div>
							<Label htmlFor='repoName' className='text-slate-300'>
								Repo Name *
							</Label>
							<Input
								id='repoName'
								value={formData.repoName}
								onChange={(e) => setFormData({ ...formData, repoName: e.target.value })}
								className='bg-slate-800/50 border-purple-500/30 text-white'
								placeholder='my-repo'
							/>
						</div>
						<div>
							<Label htmlFor='repoLink' className='text-slate-300'>
								Repo Link *
							</Label>
							<Input
								id='repoLink'
								value={formData.repoLink}
								onChange={(e) => setFormData({ ...formData, repoLink: e.target.value })}
								className='bg-slate-800/50 border-purple-500/30 text-white'
								placeholder='https://github.com/...'
							/>
						</div>
						<div>
							<Label htmlFor='prLinkFormat' className='text-slate-300'>
								PR Link Format
							</Label>
							<Input
								id='prLinkFormat'
								value={formData.prLinkFormat}
								onChange={(e) => setFormData({ ...formData, prLinkFormat: e.target.value })}
								className='bg-slate-800/50 border-purple-500/30 text-white'
								placeholder='https://github.com/.../pull/{number}'
							/>
						</div>
						<div>
							<Label htmlFor='leadName' className='text-slate-300'>
								Lead Name
							</Label>
							<Input
								id='leadName'
								value={formData.leadName}
								onChange={(e) => setFormData({ ...formData, leadName: e.target.value })}
								className='bg-slate-800/50 border-purple-500/30 text-white'
								placeholder='John Doe'
							/>
						</div>
					</div>
					<div className='flex gap-2'>
						<Button onClick={handleAdd} size='sm' className='bg-purple-600 hover:bg-purple-700'>
							<Save className='w-4 h-4' />
							Save Template
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
			)}

			{/* Add Template Button */}
			{!isAdding && !editingId && (
				<Button
					onClick={() => setIsAdding(true)}
					className='bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 text-purple-300'
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
						className='glass rounded-xl p-4 border border-purple-500/20 hover:border-purple-500/40 transition-colors'
					>
						{editingId === template.id ? (
							<div className='space-y-3'>
								<div className='grid grid-cols-2 gap-3'>
									<div>
										<Label className='text-slate-300'>Template Name</Label>
										<Input
											value={formData.name}
											onChange={(e) => setFormData({ ...formData, name: e.target.value })}
											className='bg-slate-800/50 border-purple-500/30 text-white'
										/>
									</div>
									<div>
										<Label className='text-slate-300'>Repo Name</Label>
										<Input
											value={formData.repoName}
											onChange={(e) => setFormData({ ...formData, repoName: e.target.value })}
											className='bg-slate-800/50 border-purple-500/30 text-white'
										/>
									</div>
									<div>
										<Label className='text-slate-300'>Repo Link</Label>
										<Input
											value={formData.repoLink}
											onChange={(e) => setFormData({ ...formData, repoLink: e.target.value })}
											className='bg-slate-800/50 border-purple-500/30 text-white'
										/>
									</div>
									<div>
										<Label className='text-slate-300'>Lead Name</Label>
										<Input
											value={formData.leadName}
											onChange={(e) => setFormData({ ...formData, leadName: e.target.value })}
											className='bg-slate-800/50 border-purple-500/30 text-white'
										/>
									</div>
								</div>
								<div className='flex gap-2'>
									<Button
										onClick={() => handleUpdate(template.id)}
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
							<div className='flex items-start justify-between'>
								<div className='flex-1 space-y-1'>
									<h4 className='font-semibold text-purple-200'>{template.name}</h4>
									<p className='text-sm text-slate-400'>
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
										className='text-purple-300 hover:text-purple-200 hover:bg-purple-600/20'
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
