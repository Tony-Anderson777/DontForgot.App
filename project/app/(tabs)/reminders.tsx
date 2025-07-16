import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Calendar, Clock, CircleAlert as AlertCircle } from 'lucide-react-native';
import { NotesStorage } from '@/utils/storage';
import { Note } from '@/types/note';
import { NotificationService } from '@/utils/notifications';
import { ReminderCard } from '@/components/ReminderCard';

export default function RemindersTab() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const savedNotes = await NotesStorage.getNotes();
      setNotes(savedNotes);
    } catch (error) {
      console.error('Erreur lors du chargement des notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReminder = async (noteId: string) => {
    Alert.alert(
      'Annuler le rappel',
      'Voulez-vous annuler le rappel pour cette note ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui',
          onPress: async () => {
            try {
              await NotificationService.cancelNotification(noteId);
              
              const updatedNotes = notes.map(note =>
                note.id === noteId 
                  ? { ...note, dueDate: undefined, reminderTime: undefined }
                  : note
              );
              
              await NotesStorage.saveNotes(updatedNotes);
              setNotes(updatedNotes);
            } catch (error) {
              console.error('Erreur lors de l\'annulation:', error);
              Alert.alert('Erreur', 'Impossible d\'annuler le rappel');
            }
          },
        },
      ]
    );
  };

  const handleMarkAsComplete = async (noteId: string) => {
    try {
      const updatedNotes = notes.map(note =>
        note.id === noteId ? { ...note, completed: true } : note
      );
      
      await NotesStorage.saveNotes(updatedNotes);
      setNotes(updatedNotes);
      
      // Annuler la notification
      await NotificationService.cancelNotification(noteId);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      Alert.alert('Erreur', 'Impossible de marquer comme terminé');
    }
  };

  const notesWithReminders = notes.filter(note => 
    note.dueDate && !note.completed
  );

  const overdueTasks = notesWithReminders.filter(note => {
    if (!note.dueDate) return false;
    const dueDate = new Date(note.dueDate);
    const now = new Date();
    return dueDate < now;
  });

  const todayTasks = notesWithReminders.filter(note => {
    if (!note.dueDate) return false;
    const dueDate = new Date(note.dueDate);
    const today = new Date();
    return dueDate.toDateString() === today.toDateString();
  });

  const upcomingTasks = notesWithReminders.filter(note => {
    if (!note.dueDate) return false;
    const dueDate = new Date(note.dueDate);
    const today = new Date();
    return dueDate > today && dueDate.toDateString() !== today.toDateString();
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Rappels</Text>
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Bell size={16} color="#3B82F6" />
            <Text style={styles.statText}>{notesWithReminders.length}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {overdueTasks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AlertCircle size={20} color="#EF4444" />
              <Text style={[styles.sectionTitle, { color: '#EF4444' }]}>
                En retard ({overdueTasks.length})
              </Text>
            </View>
            {overdueTasks.map((note) => (
              <ReminderCard
                key={note.id}
                note={note}
                onCancelReminder={() => handleCancelReminder(note.id)}
                onMarkComplete={() => handleMarkAsComplete(note.id)}
                status="overdue"
              />
            ))}
          </View>
        )}

        {todayTasks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Calendar size={20} color="#F59E0B" />
              <Text style={[styles.sectionTitle, { color: '#F59E0B' }]}>
                Aujourd'hui ({todayTasks.length})
              </Text>
            </View>
            {todayTasks.map((note) => (
              <ReminderCard
                key={note.id}
                note={note}
                onCancelReminder={() => handleCancelReminder(note.id)}
                onMarkComplete={() => handleMarkAsComplete(note.id)}
                status="today"
              />
            ))}
          </View>
        )}

        {upcomingTasks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Clock size={20} color="#10B981" />
              <Text style={[styles.sectionTitle, { color: '#10B981' }]}>
                À venir ({upcomingTasks.length})
              </Text>
            </View>
            {upcomingTasks.map((note) => (
              <ReminderCard
                key={note.id}
                note={note}
                onCancelReminder={() => handleCancelReminder(note.id)}
                onMarkComplete={() => handleMarkAsComplete(note.id)}
                status="upcoming"
              />
            ))}
          </View>
        )}

        {notesWithReminders.length === 0 && (
          <View style={styles.emptyState}>
            <Bell size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>Aucun rappel programmé</Text>
            <Text style={styles.emptyStateSubtext}>
              Créez des notes avec des dates d'échéance pour voir vos rappels ici
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statsContainer: {
    flexDirection: 'row',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
});