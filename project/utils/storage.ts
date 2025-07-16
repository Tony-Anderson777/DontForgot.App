import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note } from '@/types/note';

const NOTES_KEY = '@notes_storage';

export class NotesStorage {
  static async getNotes(): Promise<Note[]> {
    try {
      const notesJson = await AsyncStorage.getItem(NOTES_KEY);
      return notesJson ? JSON.parse(notesJson) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des notes:', error);
      return [];
    }
  }

  static async saveNotes(notes: Note[]): Promise<void> {
    try {
      await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des notes:', error);
      throw error;
    }
  }

  static async clearAllNotes(): Promise<void> {
    try {
      await AsyncStorage.removeItem(NOTES_KEY);
    } catch (error) {
      console.error('Erreur lors de la suppression des notes:', error);
      throw error;
    }
  }
}