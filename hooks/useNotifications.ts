
import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from '../utils/notificationUtils';

export function useNotifications() {
  const router = useRouter();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Register for push notifications with proper error handling
    registerForPushNotificationsAsync()
      .then(token => {
        if (token) {
          console.log('Push token registered:', token);
          // You can save this token to your backend here
        }
      })
      .catch(error => {
        console.error('Error registering for push notifications:', error);
      });

    // Listen for notifications received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Listen for user interactions with notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      try {
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
      } catch (error) {
        console.error('Error handling notification response:', error);
      }
    });

    // Check if app was opened from a notification with proper error handling
    Notifications.getLastNotificationResponseAsync()
      .then(response => {
        if (response) {
          try {
            const data = response.notification.request.content.data;
            
            if (data.type === 'event_reminder' && data.eventId) {
              router.push(`/events/${data.eventId}`);
            } else if (data.type === 'news' && data.newsId) {
              router.push(`/news/${data.newsId}`);
            }
          } catch (error) {
            console.error('Error processing last notification:', error);
          }
        }
      })
      .catch(error => {
        console.error('Error getting last notification response:', error);
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [router]);
}
