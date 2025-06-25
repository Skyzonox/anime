// app/+not-found.tsx
import { Ionicons } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Page introuvable" }} />
      <View style={tw`flex-1 justify-center items-center bg-white px-6`}>
        {/* Icône d'erreur */}
        <View style={tw`bg-red-100 rounded-full p-6 mb-6`}>
          <Ionicons name="help-circle-outline" size={64} color="#EF4444" />
        </View>

        {/* Titre */}
        <Text style={tw`text-2xl font-bold text-gray-800 mb-4 text-center`}>
          Page introuvable
        </Text>

        {/* Description */}
        <Text style={tw`text-gray-600 text-center mb-8 text-lg`}>
          La page que vous cherchez n'existe pas dans AnimeCollect.
        </Text>

        {/* Bouton retour */}
        <Link href="/" asChild>
          <TouchableOpacity style={tw`bg-blue-500 px-8 py-4 rounded-lg flex-row items-center`}>
            <Ionicons name="home" size={20} color="white" />
            <Text style={tw`text-white font-medium ml-2 text-lg`}>
              Retour à l'accueil
            </Text>
          </TouchableOpacity>
        </Link>

        {/* Suggestions */}
        <View style={tw`mt-8 w-full`}>
          <Text style={tw`text-gray-700 font-medium mb-4 text-center`}>
            Que souhaitez-vous faire ?
          </Text>
          
          <View style={tw`space-y-3`}>
            <Link href="/(tabs)" asChild>
              <TouchableOpacity style={tw`bg-green-100 p-4 rounded-lg flex-row items-center`}>
                <Ionicons name="flame" size={20} color="#059669" />
                <Text style={tw`text-green-800 font-medium ml-3`}>
                  Voir les nouveautés
                </Text>
              </TouchableOpacity>
            </Link>

            <Link href="/(tabs)/search" asChild>
              <TouchableOpacity style={tw`bg-blue-100 p-4 rounded-lg flex-row items-center`}>
                <Ionicons name="search" size={20} color="#2563EB" />
                <Text style={tw`text-blue-800 font-medium ml-3`}>
                  Rechercher un anime
                </Text>
              </TouchableOpacity>
            </Link>

            <Link href="/(tabs)/collection" asChild>
              <TouchableOpacity style={tw`bg-purple-100 p-4 rounded-lg flex-row items-center`}>
                <Ionicons name="library" size={20} color="#7C3AED" />
                <Text style={tw`text-purple-800 font-medium ml-3`}>
                  Ma collection
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </>
  );
}