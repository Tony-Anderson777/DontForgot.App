import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { CreditCard as Edit3, Trash2, Calendar, Clock, CircleCheck as CheckCircle2, Circle, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { Note } from '@/types/note';

interface NoteCardProps {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
}

export function NoteCard({ note, onEdit, onDelete, onToggleComplete }: NoteCardProps) {
  const isOverdue = note.dueDate && new Date(note.dueDate) < new Date() && !note.completed;
  const isToday = note.dueDate && new Date(note.dueDate).toDateString() === new Date().toDateString();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Haute';
      case 'medium': return 'Moyenne';
      case 'low': return 'Basse';
      default: return 'Normale';
    }
  };

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

  return (
    <View style={[
      styles.container,
      note.completed && styles.completedContainer,
      isOverdue && styles.overdueContainer,
    ]}>
      <TouchableOpacity 
        style={styles.checkbox}
        onPress={onToggleComplete}
      >
        {note.completed ? (
          <CheckCircle2 size={24} color="#10B981" />
        ) : (
          <Circle size={24} color="#9CA3AF" />
        )}
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[
            styles.title,
            note.completed && styles.completedText,
          ]}>
            {note.title}
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
              <Edit3 size={16} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
              <Trash2 size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        {note.content && (
          <Text style={[
            styles.noteContent,
            note.completed && styles.completedText,
          ]}>
            {note.content}
          </Text>
        )}

        <View style={styles.footer}>
          <View style={styles.metadata}>
            <View style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityColor(note.priority) + '20' }
            ]}>
              <Text style={[
                styles.priorityText,
                { color: getPriorityColor(note.priority) }
              ]}>
                {getPriorityLabel(note.priority)}
              </Text>
            </View>

            {note.dueDate && (
              <View style={styles.dateContainer}>
                {isOverdue && !note.completed && (
                  <AlertTriangle size={14} color="#EF4444" />
                )}
                <Calendar size={14} color={isOverdue ? '#EF4444' : isToday ? '#F59E0B' : '#6B7280'} />
                <Text style={[
                  styles.dateText,
                  isOverdue && styles.overdueText,
                  isToday && styles.todayText,
                ]}>
                  {formatDate(note.dueDate)}
                </Text>
                {note.reminderTime && (
                  <>
                    <Clock size={14} color="#6B7280" />
                    <Text style={styles.timeText}>
                      {formatTime(note.reminderTime)}
                    </Text>
                  </>
                )}
              </View>
            )}
          </View>
        </View>
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
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  completedContainer: {
    backgroundColor: '#f8f9fa',
    opacity: 0.8,
  },
  overdueContainer: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginRight: 12,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
  noteContent: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  overdueText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  todayText: {
    color: '#F59E0B',
    fontWeight: '600',
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
  },
});