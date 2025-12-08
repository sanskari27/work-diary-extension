import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Github, Link as LinkIcon, User } from 'lucide-react';
import { useState } from 'react';

interface ReleaseItemFormProps {
	onSubmit: (data: {
		repoName: string;
		repoLink: string;
		prLink?: string;
		leadName?: string;
		description?: string;
	}) => void;
	onCancel: () => void;
}

const ReleaseItemForm = ({ onSubmit, onCancel }: ReleaseItemFormProps) => {
	const [repoName, setRepoName] = useState('');
	const [repoLink, setRepoLink] = useState('');
	const [prLink, setPrLink] = useState('');
	const [leadName, setLeadName] = useState('');
	const [description, setDescription] = useState('');

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (repoName.trim() && repoLink.trim()) {
			onSubmit({
				repoName: repoName.trim(),
				repoLink: repoLink.trim(),
				prLink: prLink.trim() || undefined,
				leadName: leadName.trim() || undefined,
				description: description.trim() || undefined,
			});
		}
	};

	return (
		<form onSubmit={handleSubmit} className='space-y-5'>
			{/* Repo Name */}
			<div className='space-y-2'>
				<Label className='text-sm font-medium text-white/80 flex items-center gap-2'>
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
				<Label className='text-sm font-medium text-white/80 flex items-center gap-2'>
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
			<div className='space-y-2'>
				<Label className='text-sm font-medium text-white/80 flex items-center gap-2'>
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

			{/* Lead Name */}
			<div className='space-y-2'>
				<Label className='text-sm font-medium text-white/80 flex items-center gap-2'>
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

			{/* Description */}
			<div className='space-y-2'>
				<Label className='text-sm font-medium text-white/80 flex items-center gap-2'>
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
				<Button
					type='submit'
					className='flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/30'
				>
					Add Item
				</Button>
			</div>
		</form>
	);
};

export default ReleaseItemForm;
