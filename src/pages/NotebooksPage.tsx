import { NotebookOverview } from '@/components/organisms';
import { PageLayout } from '@/components/templates';
import { Notebook } from '@/types/notebooks';
import { useNavigate } from 'react-router-dom';

const NotebooksPage = () => {
	const navigate = useNavigate();

	const handleNotebookClick = (notebook: Notebook) => {
		navigate(`/notebooks/${notebook.id}`);
	};

	return (
		<PageLayout>
			<div className='min-h-screen p-6 md:p-12 lg:p-16'>
				<div className='max-w-[1920px] mx-auto'>
					<NotebookOverview onNotebookClick={handleNotebookClick} />
				</div>
			</div>
		</PageLayout>
	);
};

export default NotebooksPage;
