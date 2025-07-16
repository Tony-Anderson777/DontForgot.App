import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { X, Calendar, Clock, Save, CircleAlert as AlertCircle, Flag } from 'lucide-react-native';
import { Note } from '@/types/note';
import { NotificationService } from '@/utils/notifications';

interface AddNoteModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (note: Omit<Note, 'id' | 'createdAt'>) => void;
  initialNote?: Note | null;
  isEditing?: boolean;
}

export function AddNoteModal({ 
  visible, 
  onClose, 
  onSave, 
  initialNote, 
  isEditing = false 
}: AddNoteModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);

  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title);
      setContent(initialNote.content);
      setPriority(initialNote.priority);
      setDueDate(initialNote.dueDate || '');
      setReminderTime(initialNote.reminderTime || '');
    }
  }, [initialNote]);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setPriority('medium');
    setDueDate('');
    setReminderTime('');
  };

  const handleClose = () => {
    if (!isEditing) {
      resetForm();
    }
    onClose();
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Erreur', 'Le titre est obligatoire');
      return;
    }

    try {
      const noteData = {
        title: title.trim(),
        content: content.trim(),
        priority,
        completed: false,
        dueDate: dueDate || undefined,
        reminderTime: reminderTime || undefined,
      };

      // Programmer la notification si une date d'échéance est définie
      if (dueDate && reminderTime) {
        const dueDateTime = new Date(dueDate);
        const noteId = initialNote?.id || Date.now().toString();
        
        await NotificationService.scheduleNotification(
          noteId,
          title.trim(),
          content.trim(),
          dueDateTime,
          reminderTime
        );
      }

      onSave(noteData);
      
      if (!isEditing) {
        resetForm();
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder la note');
    }
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getNextWeekDate = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  };

  const getPriorityColor = (priorityLevel: string) => {
    switch (priorityLevel) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Modifier la note' : 'Nouvelle note'}
          </Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Save size={20} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Titre *</Text>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Entrez le titre de votre note"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contenu</Text>
            <TextInput
              style={styles.contentInput}
              value={content}
              onChangeText={setContent}
              placeholder="Ajoutez le contenu de votre note..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Priorité</Text>
            <View style={styles.priorityContainer}>
              {(['low', 'medium', 'high'] as const).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.priorityButton,
                    priority === level && styles.priorityButtonSelected,
                    { borderColor: getPriorityColor(level) }
                  ]}
                  onPress={() => setPriority(level)}
                >
                  <Flag size={16} color={getPriorityColor(level)} />
                  <Text style={[
                    styles.priorityText,
                    priority === level && styles.priorityTextSelected,
                    { color: getPriorityColor(level) }
                  ]}>
                    {level === 'low' ? 'Basse' : level === 'medium' ? 'Moyenne' : 'Haute'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date d'échéance</Text>
            <View style={styles.dateTimeContainer}>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setDatePickerVisible(true)}
              >
                <Calendar size={16} color="#6B7280" />
                <Text style={styles.dateButtonText}>
                  {dueDate ? formatDateForDisplay(dueDate) : 'Choisir une date'}
                </Text>
              </TouchableOpacity>
              {dueDate && (
                <TouchableOpacity 
                  style={styles.clearButton}
                  onPress={() => setDueDate('')}
                >
                  <X size={16} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.quickDateContainer}>
              <TouchableOpacity 
                style={styles.quickDateButton}
                onPress={() => setDueDate(new Date().toISOString().split('T')[0])}
              >
                <Text style={styles.quickDateText}>Aujourd'hui</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickDateButton}
                onPress={() => setDueDate(getTomorrowDate())}
              >
                <Text style={styles.quickDateText}>Demain</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickDateButton}
                onPress={() => setDueDate(getNextWeekDate())}
              >
                <Text style={styles.quickDateText}>+1 semaine</Text>
              </TouchableOpacity>
            </View>
          </View>

          {dueDate && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Heure de rappel</Text>
              <TouchableOpacity 
                style={styles.timeButton}
                onPress={() => setTimePickerVisible(true)}
              >
                <Clock size={16} color="#6B7280" />
                <Text style={styles.timeButtonText}>
                  {reminderTime || 'Choisir une heure'}
                </Text>
              </TouchableOpacity>

              <View style={styles.quickTimeContainer}>
                <TouchableOpacity 
                  style={styles.quickTimeButton}
                  onPress={() => setReminderTime('09:00')}
                >
                  <Text style={styles.quickTimeText}>9h00</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.quickTimeButton}
                  onPress={() => setReminderTime('12:00')}
                >
                  <Text style={styles.quickTimeText}>12h00</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.quickTimeButton}
                  onPress={() => setReminderTime('18:00')}
                >
                  <Text style={styles.quickTimeText}>18h00</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {dueDate && reminderTime && (
            <View style={styles.reminderInfo}>
              <AlertCircle size={16} color="#3B82F6" />
              <Text style={styles.reminderInfoText}>
                Rappel programmé pour le {formatDateForDisplay(dueDate)} à {reminderTime}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Simulateur de date/heure picker pour le web */}
        {isDatePickerVisible && (
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerTitle}>Choisir une date</Text>
              <TextInput
                style={styles.pickerInput}
                value={dueDate}
                onChangeText={setDueDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9CA3AF"
              />
              <View style={styles.pickerActions}>
                <TouchableOpacity 
                  style={styles.pickerButton}
                  onPress={() => setDatePickerVisible(false)}
                >
                  <Text style={styles.pickerButtonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.pickerButton, styles.pickerButtonPrimary]}
                  onPress={() => setDatePickerVisible(false)}
                >
                  <Text style={styles.pickerButtonTextPrimary}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {isTimePickerVisible && (
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerTitle}>Choisir une heure</Text>
              <TextInput
                style={styles.pickerInput}
                value={reminderTime}
                onChangeText={setReminderTime}
                placeholder="HH:MM"
                placeholderTextColor="#9CA3AF"
              />
              <View style={styles.pickerActions}>
                <TouchableOpacity 
                  style={styles.pickerButton}
                  onPress={() => setTimePickerVisible(false)}
                >
                  <Text style={styles.pickerButtonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.pickerButton, styles.pickerButtonPrimary]}
                  onPress={() => setTimePickerVisible(false)}
                >
                  <Text style={styles.pickerButtonTextPrimary}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  saveButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  titleInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  contentInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 100,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: '#ffffff',
    gap: 6,
  },
  priorityButtonSelected: {
    backgroundColor: '#f8fafc',
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  priorityTextSelected: {
    fontWeight: '700',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#1f2937',
  },
  clearButton: {
    padding: 12,
  },
  quickDateContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  quickDateButton: {
    flex: 1,
    backgroundColor: '#EBF4FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickDateText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  timeButtonText: {
    fontSize: 16,
    color: '#1f2937',
  },
  quickTimeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  quickTimeButton: {
    flex: 1,
    backgroundColor: '#EBF4FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickTimeText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  reminderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    marginBottom: 20,
  },
  reminderInfoText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
    flex: 1,
  },
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 20,
    marginHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  pickerInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  pickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  pickerButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  pickerButtonPrimary: {
    backgroundColor: '#3B82F6',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  pickerButtonTextPrimary: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
});