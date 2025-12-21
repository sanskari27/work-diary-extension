import { LoadingSpinner } from '@/components/atoms';
import { Button } from '@/components/ui/button';
import { Collapsible } from '@/components/ui/collapsible';
import { CommandItem } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { MultiSelect } from '@/components/ui/multiselect';
import { getCurrentWindowTabs } from '@/lib/chromeUtils';
import { useAppDispatch } from '@/store/hooks';
import { addBookmarkGroup } from '@/store/slices/bookmarksSlice';
import { FolderPlus } from 'lucide-react';
import { useEffect, useMemo, useReducer } from 'react';

interface Tab {
	id: number;
	title: string;
	url: string;
}

interface BookmarkGroupFormState {
	tabs: Tab[];
	selectedTabIds: number[];
	groupName: string;
	isLoading: boolean;
	isCreating: boolean;
	showNameInput: boolean;
}

type BookmarkGroupFormAction =
	| { type: 'SET_TABS'; payload: Tab[] }
	| { type: 'SET_SELECTED_TAB_IDS'; payload: number[] }
	| { type: 'SET_GROUP_NAME'; payload: string }
	| { type: 'SET_IS_LOADING'; payload: boolean }
	| { type: 'SET_IS_CREATING'; payload: boolean }
	| { type: 'SET_SHOW_NAME_INPUT'; payload: boolean }
	| { type: 'RESET' };

const initialState: BookmarkGroupFormState = {
	tabs: [],
	selectedTabIds: [],
	groupName: '',
	isLoading: true,
	isCreating: false,
	showNameInput: false,
};

const bookmarkGroupFormReducer = (
	state: BookmarkGroupFormState,
	action: BookmarkGroupFormAction
): BookmarkGroupFormState => {
	switch (action.type) {
		case 'SET_TABS':
			return { ...state, tabs: action.payload };
		case 'SET_SELECTED_TAB_IDS':
			return { ...state, selectedTabIds: action.payload };
		case 'SET_GROUP_NAME':
			return { ...state, groupName: action.payload };
		case 'SET_IS_LOADING':
			return { ...state, isLoading: action.payload };
		case 'SET_IS_CREATING':
			return { ...state, isCreating: action.payload };
		case 'SET_SHOW_NAME_INPUT':
			return { ...state, showNameInput: action.payload };
		case 'RESET':
			return {
				...initialState,
				isLoading: state.isLoading,
				tabs: state.tabs, // Keep tabs, only reset form fields
			};
		default:
			return state;
	}
};

const BookmarkGroupForm = () => {
	const dispatch = useAppDispatch();
	const [formState, formDispatch] = useReducer(bookmarkGroupFormReducer, initialState);

	// Convert tabs to multiselect items format
	const multiselectItems = useMemo(
		() =>
			formState.tabs.map((tab) => ({
				value: tab.id.toString(),
				label: tab.title.length > 35 ? tab.title.slice(0, 35) + '...' : tab.title,
			})),
		[formState.tabs]
	);

	// Convert selectedTabIds to string array for multiselect
	const selectedValues = useMemo(
		() => formState.selectedTabIds.map((id) => id.toString()),
		[formState.selectedTabIds]
	);

	// Fetch all tabs in current window
	useEffect(() => {
		getCurrentWindowTabs()
			.then((formattedTabs) => {
				formDispatch({ type: 'SET_TABS', payload: formattedTabs });
				formDispatch({ type: 'SET_IS_LOADING', payload: false });
			})
			.catch((error) => {
				console.error('Error fetching tabs:', error);
				formDispatch({ type: 'SET_IS_LOADING', payload: false });
			});
	}, []);

	const handleMultiselectChange = (values: string[]) => {
		formDispatch({ type: 'SET_SELECTED_TAB_IDS', payload: values.map((v) => parseInt(v, 10)) });
	};

	const handleSelectAll = () => {
		if (formState.selectedTabIds.length === formState.tabs.length) {
			formDispatch({ type: 'SET_SELECTED_TAB_IDS', payload: [] });
		} else {
			formDispatch({ type: 'SET_SELECTED_TAB_IDS', payload: formState.tabs.map((tab) => tab.id) });
		}
	};

	const handleContinue = () => {
		if (formState.selectedTabIds.length === 0) return;
		formDispatch({ type: 'SET_SHOW_NAME_INPUT', payload: true });
	};

	const handleCancel = () => {
		formDispatch({ type: 'RESET' });
	};

	const handleCreateGroup = () => {
		if (
			!formState.groupName.trim() ||
			formState.selectedTabIds.length === 0 ||
			formState.isCreating
		)
			return;

		formDispatch({ type: 'SET_IS_CREATING', payload: true });

		const selectedTabs = formState.tabs.filter((t) => formState.selectedTabIds.includes(t.id));

		// Create items array directly from selected tabs
		const items = selectedTabs.map((tab) => ({
			title: tab.title,
			url: tab.url,
		}));

		// Create the group directly with items
		dispatch(
			addBookmarkGroup({
				name: formState.groupName.trim(),
				items,
			})
		);

		// Reset form
		formDispatch({ type: 'SET_IS_CREATING', payload: false });
		handleCancel();
	};

	return (
		<Collapsible
			header={
				<h3 className='text-white font-semibold flex items-center gap-2'>
					<FolderPlus className='w-4 h-4 text-text-accent' />
					Create Bookmark Group
				</h3>
			}
			defaultOpen={false}
		>
			{!formState.showNameInput ? (
				<div className='space-y-3'>
					{formState.isLoading ? (
						<div className='flex items-center justify-center py-8'>
							<LoadingSpinner size='sm' />
						</div>
					) : (
						<>
							{/* Multiselect Dropdown */}
							<MultiSelect
								placeholder='Select tabs...'
								items={multiselectItems}
								value={selectedValues}
								onChange={handleMultiselectChange}
								buttonVariant='outline'
								disabled={formState.isLoading}
								buttonText={
									selectedValues.length > 0
										? `${selectedValues.length} tabs selected`
										: 'Select tabs...'
								}
							>
								<CommandItem onSelect={() => handleSelectAll()} className='cursor-pointer'>
									{formState.selectedTabIds.length === formState.tabs.length
										? 'Deselect All'
										: 'Select All'}
								</CommandItem>
							</MultiSelect>

							<Button
								onClick={handleContinue}
								disabled={formState.selectedTabIds.length === 0}
								className='w-full bg-primary hover:bg-primary-hover text-white disabled:bg-primary/50 disabled:cursor-not-allowed'
								size='sm'
							>
								Continue
							</Button>
						</>
					)}
				</div>
			) : (
				<div className='space-y-3'>
					<Input
						type='text'
						value={formState.groupName}
						onChange={(e) => formDispatch({ type: 'SET_GROUP_NAME', payload: e.target.value })}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								handleCreateGroup();
							} else if (e.key === 'Escape') {
								handleCancel();
							}
						}}
						placeholder='Enter group name...'
						className='w-full glass-strong text-white placeholder:text-text-secondary/50 text-sm'
						autoFocus
					/>
					<div className='flex gap-2'>
						<Button
							onClick={handleCancel}
							variant='outline'
							className='flex-1'
							size='sm'
							disabled={formState.isCreating}
						>
							Cancel
						</Button>
						<Button
							onClick={handleCreateGroup}
							disabled={!formState.groupName.trim() || formState.isCreating}
							className='flex-1 bg-primary hover:bg-primary-hover text-white disabled:bg-primary/50 disabled:cursor-not-allowed'
							size='sm'
						>
							{formState.isCreating ? (
								<>
									<LoadingSpinner size='sm' />
									Creating...
								</>
							) : (
								<>
									<FolderPlus className='w-4 h-4' />
									Create Group
								</>
							)}
						</Button>
					</div>
				</div>
			)}
		</Collapsible>
	);
};

export default BookmarkGroupForm;
