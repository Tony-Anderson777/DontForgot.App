import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Notebook } from 'lucide-react-native';

export function LoadingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Notebook size={48} color="#3B82F6" />
        <Text style={styles.title}>Notes App</Text>
        <Text style={styles.subtitle}>Chargement en cours...</Text>
        <ActivityIndicator 
          size="large" 
          color="#3B82F6" 
          style={styles.spinner}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  spinner: {
    marginTop: 16,
  },
});