import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchContent } from '../store/slices/contentSlice';

export const useContent = () => {
	const dispatch = useAppDispatch();
	const { content, loading, error } = useAppSelector((state) => state.content);

	useEffect(() => {
		// Only fetch if we don't have content yet
		if (!content && !loading) {
			dispatch(fetchContent());
		}
	}, [dispatch, content, loading]);

	return { content, loading, error };
};
