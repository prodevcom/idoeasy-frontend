'use client';

import { InlineNotification, ToastNotification } from '@carbon/react';

import { useNotifications } from '@/shared/contexts';
import './NotificationsContainer.scss';

type NotificationsContainerProps = {
  variant?: 'toast' | 'inline';
  maxNotifications?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
};

export function NotificationsContainer({
  variant = 'toast',
  maxNotifications = 5,
  position = 'top-right',
}: NotificationsContainerProps) {
  const { notifications, removeNotification } = useNotifications();

  const visibleNotifications = notifications.slice(-maxNotifications);
  if (visibleNotifications.length === 0) return null;

  const containerClass = `notifications-container notifications-container--${position}`;

  return (
    <div className={containerClass}>
      {visibleNotifications.map((notification) => {
        const { id, kind, title, subtitle, caption, timeout } = notification;

        if (variant === 'toast') {
          return (
            <ToastNotification
              key={id}
              kind={kind}
              title={title}
              subtitle={subtitle}
              caption={caption}
              timeout={timeout || 0}
              hideCloseButton={false}
              onClose={() => removeNotification(id)}
              onCloseButtonClick={() => removeNotification(id)}
            />
          );
        }

        return (
          <InlineNotification
            key={id}
            kind={kind}
            title={title}
            subtitle={subtitle}
            hideCloseButton={false}
            onClose={() => removeNotification(id)}
            onCloseButtonClick={() => removeNotification(id)}
            // actions={actions?.map((action) => ({
            //   label: action.label,
            //   onClick: action.onClick,
            // }))}
          />
        );
      })}
    </div>
  );
}
