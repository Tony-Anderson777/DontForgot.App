import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Search, CreditCard as Edit3, Trash2, Calendar } from 'lucide-react-native';
import { NotesStorage } from '@/utils/storage';
import { Note } from '@/types/note';
import { NoteCard } from '@/components/NoteCard';
import { AddNoteModal } from '@/components/AddNoteModal';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function NotesTab() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
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

  const handleAddNote = async (noteData: Omit<Note, 'id' | 'createdAt'>) => {
    try {
      const newNote: Note = {
        ...noteData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      
      const updatedNotes = [...notes, newNote];
      await NotesStorage.saveNotes(updatedNotes);
      setNotes(updatedNotes);
      setIsAddModalVisible(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la note:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter la note');
    }
  };

  const handleEditNote = async (noteData: Omit<Note, 'id' | 'createdAt'>) => {
    if (!editingNote) return;

    try {
      const updatedNote: Note = {
        ...editingNote,
        ...noteData,
      };
      
      const updatedNotes = notes.map(note => 
        note.id === editingNote.id ? updatedNote : note
      );
      
      await NotesStorage.saveNotes(updatedNotes);
      setNotes(updatedNotes);
      setEditingNote(null);
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      Alert.alert('Erreur', 'Impossible de modifier la note');
    }
  };

  const handleDeleteNote = async (id: string) => {
    Alert.alert(
      'Supprimer la note',
      'Êtes-vous sûr de vouloir supprimer cette note ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedNotes = notes.filter(note => note.id !== id);
              await NotesStorage.saveNotes(updatedNotes);
              setNotes(updatedNotes);
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer la note');
            }
          },
        },
      ]
    );
  };

  const toggleNoteCompletion = async (id: string) => {
    try {
      const updatedNotes = notes.map(note =>
        note.id === id ? { ...note, completed: !note.completed } : note
      );
      
      await NotesStorage.saveNotes(updatedNotes);
      setNotes(updatedNotes);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingNotes = filteredNotes.filter(note => !note.completed);
  const completedNotes = filteredNotes.filter(note => note.completed);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Mes Notes</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAddModalVisible(true)}
        >
          <Plus size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une note..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {pendingNotes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>En cours ({pendingNotes.length})</Text>
            {pendingNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={() => setEditingNote(note)}
                onDelete={() => handleDeleteNote(note.id)}
                onToggleComplete={() => toggleNoteCompletion(note.id)}
              />
            ))}
          </View>
        )}

        {completedNotes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Terminées ({completedNotes.length})</Text>
            {completedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={() => setEditingNote(note)}
                onDelete={() => handleDeleteNote(note.id)}
                onToggleComplete={() => toggleNoteCompletion(note.id)}
              />
            ))}
          </View>
        )}

        {filteredNotes.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'Aucune note trouvée' : 'Aucune note pour le moment'}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery ? 'Essayez avec d\'autres mots-clés' : 'Appuyez sur + pour créer votre première note'}
            </Text>
          </View>
        )}
      </ScrollView>

      <AddNoteModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onSave={handleAddNote}
      />

      <AddNoteModal
        visible={!!editingNote}
        onClose={() => setEditingNote(null)}
        onSave={handleEditNote}
        initialNote={editingNote}
        isEditing={true}
      />
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
  addButton: {
    backgroundColor: '#3B82F6',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
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
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});