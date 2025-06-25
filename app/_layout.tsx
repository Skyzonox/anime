// app/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import tw from 'twrnc';
import { initDatabase, isDatabaseReady } from '../db/index';

export default function RootLayout() {
  const [isDatabaseInitialized, setIsDatabaseInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        console.log('🚀 Démarrage de l\'application...');
        
        // Initialiser la base de données
        await initDatabase();
        
        // Vérifier que la base de données est prête
        const isReady = await isDatabaseReady();
        if (!isReady) {
          throw new Error('La base de données n\'est pas accessible');
        }
        
        setIsDatabaseInitialized(true);
        console.log('✅ Application prête');
      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
        setError('Impossible d\'initialiser la base de données');
      } finally {
        setIsLoading(false);
      }
    };

    setupDatabase();
  }, []);

  // Écran de chargement pendant l'initialisation
  if (isLoading) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-white`}>
        <StatusBar style="dark" backgroundColor="#f8fafc" />
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={tw`mt-4 text-gray-600 text-center`}>
          Initialisation d'AnimeCollect...
        </Text>
      </View>
    );
  }

  // Écran d'erreur si l'initialisation a échoué
  if (error || !isDatabaseInitialized) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-white px-6`}>
        <StatusBar style="dark" backgroundColor="#f8fafc" />
        <View style={tw`bg-red-100 rounded-full p-4 mb-4`}>
          <Text style={tw`text-red-600 text-2xl text-center`}>⚠️</Text>
        </View>
        <Text style={tw`text-xl font-bold text-gray-800 mb-2 text-center`}>
          Erreur d'initialisation
        </Text>
        <Text style={tw`text-gray-600 text-center mb-4`}>
          {error || 'Une erreur est survenue lors du démarrage de l\'application'}
        </Text>
        <Text style={tw`text-gray-500 text-sm text-center`}>
          Veuillez redémarrer l'application
        </Text>
      </View>
    );
  }

  // Application normale une fois la base de données initialisée
  return (
    <>
      <StatusBar style="dark" backgroundColor="#f8fafc" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f8fafc',
          },
          headerTintColor: '#1f2937',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackTitle: 'Retour',
        }}
      >
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="anime/[id]" 
          options={{ 
            title: 'Détails de l\'anime',
            presentation: 'modal'
          }} 
        />
        <Stack.Screen 
          name="anime/[id]/[episode]" 
          options={{ 
            title: 'Détails de l\'épisode',
            presentation: 'modal'
          }} 
        />
        <Stack.Screen 
          name="collection/[id]" 
          options={{ 
            title: 'Ma collection',
            presentation: 'modal'
          }} 
        />
      </Stack>
    </>
  );
}