import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
	variant?: 'card' | 'badge' | 'text' | 'list';
	className?: string;
	count?: number;
}

export const SkeletonLoader = ({ variant = 'card', className, count = 1 }: SkeletonLoaderProps) => {
	const renderSkeleton = () => {
		switch (variant) {
			case 'card':
				return (
					<div
						className={cn(
							'rounded-2xl border border-white/20 glass-strong p-4 space-y-3',
							className
						)}
					>
						<Skeleton className='h-6 w-3/4' />
						<Skeleton className='h-4 w-1/2' />
						<Skeleton className='h-4 w-full' />
						<div className='flex gap-2'>
							<Skeleton className='h-6 w-16 rounded-full' />
							<Skeleton className='h-6 w-20 rounded-full' />
						</div>
					</div>
				);
			case 'badge':
				return <Skeleton className={cn('h-8 w-24 rounded-full', className)} />;
			case 'text':
				return (
					<div className={cn('space-y-2', className)}>
						<Skeleton className='h-4 w-full' />
						<Skeleton className='h-4 w-5/6' />
						<Skeleton className='h-4 w-4/6' />
					</div>
				);
			case 'list':
				return (
					<div className={cn('space-y-3', className)}>
						{Array.from({ length: count }).map((_, i) => (
							<div key={i} className='flex items-center gap-3'>
								<Skeleton className='h-12 w-12 rounded-lg' />
								<div className='flex-1 space-y-2'>
									<Skeleton className='h-4 w-3/4' />
									<Skeleton className='h-3 w-1/2' />
								</div>
							</div>
						))}
					</div>
				);
			default:
				return <Skeleton className={className} />;
		}
	};

	if (variant === 'list' || variant === 'card') {
		return (
			<div className='space-y-4'>
				{Array.from({ length: count }).map((_, i) => (
					<div key={i}>{renderSkeleton()}</div>
				))}
			</div>
		);
	}

	return renderSkeleton();
};

export default SkeletonLoader;
