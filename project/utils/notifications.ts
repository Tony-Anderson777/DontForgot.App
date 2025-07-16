import * as Notifications from 'expo-notifications';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Erreur lors de la demande de permissions:', error);
      return false;
    }
  }

  static async checkPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Erreur lors de la vérification des permissions:', error);
      return false;
    }
  }

  static async scheduleNotification(
    noteId: string,
    title: string,
    content: string,
    dueDate: Date,
    reminderTime?: string
  ): Promise<void> {
    try {
      // Vérifier les permissions
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          throw new Error('Permissions de notification refusées');
        }
      }

      // Calculer la date du rappel
      let notificationDate = new Date(dueDate);
      
      if (reminderTime) {
        const [hours, minutes] = reminderTime.split(':').map(Number);
        notificationDate.setHours(hours, minutes, 0, 0);
      }

      // Annuler la notification existante si elle existe
      await this.cancelNotification(noteId);

      // Programmer la nouvelle notification
      await Notifications.scheduleNotificationAsync({
        identifier: noteId,
        content: {
          title: `Rappel: ${title}`,
          body: content,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          date: notificationDate,
        },
      });
    } catch (error) {
      console.error('Erreur lors de la programmation de la notification:', error);
      throw error;
    }
  }

  static async cancelNotification(noteId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(noteId);
    } catch (error) {
      console.error('Erreur lors de l\'annulation de la notification:', error);
    }
  }

  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Erreur lors de l\'annulation de toutes les notifications:', error);
    }
  }

  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      return [];
    }
  }
}