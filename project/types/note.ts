export interface Note {
  id: string;
  title: string;
  content: string;
  completed: boolean;
  dueDate?: string;
  reminderTime?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface ReminderSettings {
  enabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}