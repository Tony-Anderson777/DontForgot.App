import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { CircleCheck as CheckCircle2, Calendar, Clock, X, TriangleAlert as AlertTriangle, Bell } from 'lucide-react-native';
import { Note } from '@/types/note';

interface ReminderCardProps {
  note: Note;
  onCancelReminder: () => void;
  onMarkComplete: () => void;
  status: 'overdue' | 'today' | 'upcoming';
}

export function ReminderCard({ note, onCancelReminder, onMarkComplete, status }: ReminderCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const getStatusColor = () => {
    switch (status) {
      case 'overdue': return '#EF4444';
      case 'today': return '#F59E0B';
      case 'upcoming': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'overdue': return <AlertTriangle size={20} color="#EF4444" />;
      case 'today': return <Bell size={20} color="#F59E0B" />;
      case 'upcoming': return <Calendar size={20} color="#10B981" />;
      default: return <Bell size={20} color="#6B7280" />;
    }
  };

  return (
    <View style={[styles.container, { borderLeftColor: getStatusColor() }]}>
      <View style={styles.header}>
        <View style={styles.statusContainer}>
          {getStatusIcon()}
          <Text style={[styles.title, { color: getStatusColor() }]}>
            {note.title}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={onCancelReminder}
        >
          <X size={16} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {note.content && (
        <Text style={styles.content}>
          {note.content}
        </Text>
      )}

      <View style={styles.footer}>
        <View style={styles.dateTimeContainer}>
          <View style={styles.dateTime}>
            <Calendar size={14} color="#6B7280" />
            <Text style={styles.dateText}>
              {note.dueDate ? formatDate(note.dueDate) : ''}
            </Text>
          </View>
          {note.reminderTime && (
            <View style={styles.dateTime}>
              <Clock size={14} color="#6B7280" />
              <Text style={styles.timeText}>
                {formatTime(note.reminderTime)}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={styles.completeButton}
          onPress={onMarkComplete}
        >
          <CheckCircle2 size={16} color="#10B981" />
          <Text style={styles.completeText}>Terminé</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
    marginLeft: 28,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  completeText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
});