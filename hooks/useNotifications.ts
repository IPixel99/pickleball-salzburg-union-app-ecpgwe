
import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from '../utils/notificationUtils';

export function useNotifications() {
  const router = useRouter();
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    // Register for push notifications
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        console.log('Push token registered:', token);
        // You can save this token to your backend here
      }
    });

    // Listen for notifications received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Listen for user interactions with notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      
      const data = response.notification.request.content.data;
      
      // Handle navigation based on notification type
      if (data.type === 'event_reminder' && data.eventId) {
        router.push(`/events/${data.eventId}`);
      } else if (data.type === 'news' && data.newsId) {
        router.push(`/news/${data.newsId}`);
      } else if (data.type === 'event_registration') {
        router.push('/(tabs)/events');
      }
    });

    // Check if app was opened from a notification
    Notifications.getLastNotificationResponseAsync().then(response => {
      if (response) {
        const data = response.notification.request.content.data;
        
        if (data.type === 'event_reminder' && data.eventId) {
          router.push(`/events/${data.eventId}`);
        } else if (data.type === 'news' && data.newsId) {
          router.push(`/news/${data.newsId}`);
        }
      }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [router]);
}
