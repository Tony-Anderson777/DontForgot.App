import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Bell, 
  Trash2, 
  Info, 
  Shield, 
  Smartphone,
  ChevronRight 
} from 'lucide-react-native';
import { NotesStorage } from '@/utils/storage';
import { NotificationService } from '@/utils/notifications';

export default function SettingsTab() {
  const handleClearAllNotes = () => {
    Alert.alert(
      'Supprimer toutes les notes',
      'Cette action supprimera définitivement toutes vos notes et ne peut pas être annulée.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await NotesStorage.clearAllNotes();
              Alert.alert('Succès', 'Toutes les notes ont été supprimées');
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer les notes');
            }
          },
        },
      ]
    );
  };

  const handleCheckNotificationPermissions = async () => {
    try {
      const hasPermission = await NotificationService.checkPermissions();
      if (hasPermission) {
        Alert.alert('Notifications', 'Les notifications sont activées');
      } else {
        Alert.alert(
          'Notifications désactivées',
          'Voulez-vous activer les notifications pour recevoir vos rappels ?',
          [
            { text: 'Plus tard', style: 'cancel' },
            {
              text: 'Activer',
              onPress: async () => {
                await NotificationService.requestPermissions();
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Erreur permissions:', error);
      Alert.alert('Erreur', 'Impossible de vérifier les permissions');
    }
  };

  const showAppInfo = () => {
    Alert.alert(
      'À propos',
      'Application de notes avec rappels\nVersion 1.0.0\n\nCréée avec React Native et Expo',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Paramètres</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleCheckNotificationPermissions}
          >
            <View style={styles.settingItemLeft}>
              <Bell size={20} color="#3B82F6" />
              <Text style={styles.settingItemText}>Gérer les notifications</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Données</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleClearAllNotes}
          >
            <View style={styles.settingItemLeft}>
              <Trash2 size={20} color="#EF4444" />
              <Text style={[styles.settingItemText, { color: '#EF4444' }]}>
                Supprimer toutes les notes
              </Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={showAppInfo}
          >
            <View style={styles.settingItemLeft}>
              <Info size={20} color="#6B7280" />
              <Text style={styles.settingItemText}>À propos</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <Shield size={20} color="#10B981" />
            <Text style={styles.infoCardTitle}>Confidentialité</Text>
          </View>
          <Text style={styles.infoCardText}>
            Toutes vos notes sont stockées localement sur votre appareil. 
            Aucune donnée n'est envoyée vers des serveurs externes.
          </Text>
        </View>

        <View style={styles.footer}>
          <Smartphone size={24} color="#D1D5DB" />
          <Text style={styles.footerText}>
            Application optimisée pour mobile
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
  },
  infoCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
    marginLeft: 8,
  },
  infoCardText: {
    fontSize: 14,
    color: '#047857',
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
});