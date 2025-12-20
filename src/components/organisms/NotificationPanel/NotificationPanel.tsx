import { useAppearanceStyles } from '@/hooks/useAppearanceStyles';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearNotifications, removeNotification } from '@/store/slices/uiSlice';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, AlertTriangle, Bell, CheckCircle, Info, X } from 'lucide-react';

const NotificationPanel = () => {
	const dispatch = useAppDispatch();
	const notifications = useAppSelector((state) => state.ui.notifications);
	const { appearance: appearanceSettings, notification: notificationStyles } =
		useAppearanceStyles();

	// Don't render if no notifications
	if (notifications.length === 0) {
		return null;
	}

	const getIcon = (type: string) => {
		const iconSize = notificationStyles.iconSize;
		switch (type) {
			case 'error':
				return <AlertCircle className={iconSize} />;
			case 'success':
				return <CheckCircle className={iconSize} />;
			case 'warning':
				return <AlertTriangle className={iconSize} />;
			case 'info':
			default:
				return <Info className={iconSize} />;
		}
	};

	const handleRemove = (id: string) => {
		dispatch(removeNotification(id));
	};

	const handleClearAll = () => {
		dispatch(clearNotifications());
	};

	return (
		<motion.div
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.5 }}
			className={notificationStyles.panelWidth + ' flex-shrink-0'}
		>
			<div
				className={`glass-strong rounded-2xl ${notificationStyles.panelPadding} border border-glass-border-strong`}
			>
				{/* Header */}
				<div
					className={`flex items-center gap-3 ${
						appearanceSettings.compactMode ? 'mb-3 pb-3' : 'mb-4 pb-4'
					} border-b border-glass-border`}
				>
					{!appearanceSettings.minimalMode && (
						<motion.div
							animate={{ rotate: [0, 10, -10, 0] }}
							transition={{ duration: 2, repeat: Infinity }}
						>
							<Bell className={`${notificationStyles.iconSize} text-text-primary`} />
						</motion.div>
					)}
					<h3 className={`${notificationStyles.headerTextSize} font-bold text-white`}>
						Notifications
					</h3>
					<div className='ml-auto flex items-center gap-2'>
						<div className='bg-primary/30 text-text-primary text-xs font-bold px-2 py-1 rounded-full'>
							{notifications.length}
						</div>
						<button
							onClick={handleClearAll}
							className='opacity-70 hover:opacity-100 transition-opacity duration-200 hover:bg-white/10 rounded-full p-1.5'
							aria-label='Clear all notifications'
							title='Clear all notifications'
						>
							<X className='w-4 h-4 text-white' />
						</button>
					</div>
				</div>

				{/* Notifications List */}
				<div
					className={cn(
						notificationStyles.spacing,
						'max-h-[calc(100vh-200px)] overflow-y-auto hidden-scrollbar'
					)}
				>
					<AnimatePresence mode='popLayout'>
						{notifications.map((notification) => (
							<motion.div
								key={notification.id}
								layout
								initial={{ opacity: 0, scale: 0.9, y: -10 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.9, x: 100 }}
								transition={{ duration: 0.3 }}
								className={cn(
									notificationStyles.getTypeColors(notification.type),
									notificationStyles.notificationPadding,
									'rounded-xl',
									'border relative group'
								)}
							>
								{/* Remove button */}
								<button
									onClick={() => handleRemove(notification.id)}
									className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white/20 rounded-full p-1'
									aria-label='Remove notification'
								>
									<X className='w-4 h-4' />
								</button>

								{/* Icon and Message */}
								<div
									className={cn(
										'flex items-start gap-3',
										appearanceSettings.compactMode ? 'pr-4' : 'pr-6'
									)}
								>
									<div className='flex-shrink-0 mt-0.5'>{getIcon(notification.type)}</div>
									<div className='flex-1'>
										<p className={cn(notificationStyles.textSize, 'leading-relaxed break-words')}>
											{notification.message}
										</p>
										{!appearanceSettings.minimalMode && (
											<p className={cn('text-xs opacity-60 mt-2')}>
												{new Date(notification.timestamp).toLocaleTimeString([], {
													hour: '2-digit',
													minute: '2-digit',
												})}
											</p>
										)}
									</div>
								</div>
							</motion.div>
						))}
					</AnimatePresence>
				</div>
			</div>
		</motion.div>
	);
};

export default NotificationPanel;
