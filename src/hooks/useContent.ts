import { useEffect, useState } from 'react';

interface Content {
	greeting: {
		hello: string;
		userName: string;
	};
	features: {
		title: string;
		items: Array<{
			id: string;
			name: string;
			description: string;
			icon: string;
			color: string;
		}>;
	};
}

export const useContent = () => {
	const [content, setContent] = useState<Content | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch('/content.json')
			.then((res) => res.json())
			.then((data) => {
				setContent(data);
				setLoading(false);
			})
			.catch((err) => {
				console.error('Failed to load content:', err);
				setLoading(false);
			});
	}, []);

	return { content, loading };
};
