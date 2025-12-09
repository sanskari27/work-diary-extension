import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { removeNotification } from '@/store/slices/uiSlice';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, AlertTriangle, Bell, CheckCircle, Info, X } from 'lucide-react';

const NotificationPanel = () => {
	const dispatch = useAppDispatch();
	const notifications = useAppSelector((state) => state.ui.notifications);
	const appearanceSettings = useAppSelector((state) => state.settings.appearanceSettings);

	// Don't render if no notifications
	if (notifications.length === 0) {
		return null;
	}

	// Determine sizing based on appearance settings
	const getPanelWidth = () => {
		if (appearanceSettings.compactMode) {
			return 'w-full lg:w-72 xl:w-80';
		}
		return 'w-full lg:w-80 xl:w-96';
	};

	const getPadding = () => {
		if (appearanceSettings.compactMode) {
			return 'p-2';
		}
		return 'p-4';
	};

	const getNotificationPadding = () => {
		if (appearanceSettings.compactMode) {
			return 'p-2';
		}
		if (appearanceSettings.cardSize === 'small') {
			return 'p-2';
		}
		if (appearanceSettings.cardSize === 'large') {
			return 'p-4';
		}
		return 'p-4';
	};

	const getSpacing = () => {
		if (appearanceSettings.compactMode) {
			return 'space-y-2';
		}
		return 'space-y-3';
	};

	const getIconSize = () => {
		if (appearanceSettings.compactMode || appearanceSettings.cardSize === 'small') {
			return 'w-4 h-4';
		}
		if (appearanceSettings.cardSize === 'large') {
			return 'w-6 h-6';
		}
		return 'w-5 h-5';
	};

	const getTextSize = () => {
		if (appearanceSettings.compactMode || appearanceSettings.cardSize === 'small') {
			return 'text-xs';
		}
		if (appearanceSettings.cardSize === 'large') {
			return 'text-base';
		}
		return 'text-sm';
	};

	const getIcon = (type: string) => {
		const iconSize = getIconSize();
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

	const getTypeColors = (type: string) => {
		switch (type) {
			case 'error':
				return 'bg-red-500/20 border-red-500/50 text-red-200';
			case 'success':
				return 'bg-green-500/20 border-green-500/50 text-green-200';
			case 'warning':
				return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200';
			case 'info':
			default:
				return 'bg-blue-500/20 border-blue-500/50 text-blue-200';
		}
	};

	const handleRemove = (id: string) => {
		dispatch(removeNotification(id));
	};

	return (
		<motion.div
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.5 }}
			className={getPanelWidth() + ' flex-shrink-0'}
		>
			<div
				className={`glass-strong rounded-2xl ${getPadding()} border border-purple-400/30 sticky top-6`}
			>
				{/* Header */}
				<div
					className={`flex items-center gap-3 ${
						appearanceSettings.compactMode ? 'mb-3 pb-3' : 'mb-4 pb-4'
					} border-b border-purple-400/20`}
				>
					{!appearanceSettings.minimalMode && (
						<motion.div
							animate={{ rotate: [0, 10, -10, 0] }}
							transition={{ duration: 2, repeat: Infinity }}
						>
							<Bell className={`${getIconSize()} text-purple-300`} />
						</motion.div>
					)}
					<h3
						className={`${
							appearanceSettings.compactMode || appearanceSettings.cardSize === 'small'
								? 'text-base'
								: 'text-lg'
						} font-bold text-white`}
					>
						Notifications
					</h3>
					<div className='ml-auto bg-purple-500/30 text-purple-200 text-xs font-bold px-2 py-1 rounded-full'>
						{notifications.length}
					</div>
				</div>

				{/* Notifications List */}
				<div
					className={`${getSpacing()} max-h-[calc(100vh-200px)] overflow-y-auto hidden-scrollbar`}
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
								className={`${getTypeColors(
									notification.type
								)} rounded-xl ${getNotificationPadding()} border relative group`}
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
									className={`flex items-start gap-3 ${
										appearanceSettings.compactMode ? 'pr-4' : 'pr-6'
									}`}
								>
									<div className='flex-shrink-0 mt-0.5'>{getIcon(notification.type)}</div>
									<div className='flex-1'>
										<p className={`${getTextSize()} leading-relaxed break-words`}>
											{notification.message}
										</p>
										{!appearanceSettings.minimalMode && (
											<p className='text-xs opacity-60 mt-2'>
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
