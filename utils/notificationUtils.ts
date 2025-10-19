
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import Constants from 'expo-constants';

// Set notification handler for foreground notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Register for push notifications and get the Expo push token
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      // Create channels for different notification types
      await Notifications.setNotificationChannelAsync('events', {
        name: 'Event Notifications',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4CAF50',
      });

      await Notifications.setNotificationChannelAsync('news', {
        name: 'News Notifications',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250],
        lightColor: '#2196F3',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }

      try {
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        
        if (!projectId) {
          console.warn('Project ID not found - push notifications may not work');
          return null;
        }

        const pushToken = await Notifications.getExpoPushTokenAsync({
          projectId,
        });
        
        token = pushToken.data;
        console.log('Expo push token:', token);
      } catch (e) {
        console.error('Error getting push token:', e);
        return null;
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }
  } catch (error) {
    console.error('Error in registerForPushNotificationsAsync:', error);
  }

  return token;
}

/**
 * Schedule a local notification for an event reminder
 */
export async function scheduleEventReminderNotification(
  eventTitle: string,
  eventStartTime: Date,
  eventId: string
): Promise<string | null> {
  try {
    // Schedule notification 1 hour before the event
    const reminderTime = new Date(eventStartTime.getTime() - 60 * 60 * 1000);
    const now = new Date();

    // Only schedule if the reminder time is in the future
    if (reminderTime <= now) {
      console.log('Event is too soon to schedule reminder');
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Event Erinnerung 🏓',
        body: `${eventTitle} beginnt in 1 Stunde!`,
        data: { eventId, type: 'event_reminder' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminderTime,
        channelId: 'events',
      },
    });

    console.log('Scheduled event reminder notification:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('Error scheduling event reminder:', error);
    return null;
  }
}

/**
 * Schedule a notification for event registration confirmation
 */
export async function scheduleEventRegistrationNotification(
  eventTitle: string
): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Anmeldung bestätigt! ✅',
        body: `Du bist für "${eventTitle}" angemeldet`,
        data: { type: 'event_registration' },
        sound: true,
      },
      trigger: null, // Immediate notification
    });
  } catch (error) {
    console.error('Error scheduling registration notification:', error);
  }
}

/**
 * Schedule a notification for new news posts
 */
export async function scheduleNewsNotification(
  newsTitle: string,
  newsId: string
): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Neue Nachricht 📰',
        body: newsTitle,
        data: { newsId, type: 'news' },
        sound: true,
      },
      trigger: null, // Immediate notification
    });
  } catch (error) {
    console.error('Error scheduling news notification:', error);
  }
}

/**
 * Cancel a scheduled notification
 */
export async function cancelScheduledNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log('Cancelled notification:', notificationId);
  } catch (error) {
    console.error('Error cancelling notification:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllScheduledNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('Cancelled all scheduled notifications');
  } catch (error) {
    console.error('Error cancelling all notifications:', error);
  }
}

/**
 * Get all scheduled notifications
 */
export async function getAllScheduledNotifications(): Promise<Notifications.Notification[]> {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log('Scheduled notifications:', notifications.length);
    return notifications;
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}

/**
 * Check notification permissions
 */
export async function checkNotificationPermissions(): Promise<boolean> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking notification permissions:', error);
    return false;
  }
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}
