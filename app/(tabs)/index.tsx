// app/(tabs)/index.tsx - Version corrigée
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import tw from 'twrnc';
import { useCollectionAnimes } from '../../hooks/useDatabase';
import {
  fetchLatestAnime,
  getBestTitle,
  getImageUrl,
  type KitsuAnime
} from '../../services/apiService';

export default function NouveautesScreen() {
  const router = useRouter();
  const { addAnimeToCollection, isAnimeInCollection } = useCollectionAnimes();
  
  const [animes, setAnimes] = useState<KitsuAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnimes();
  }, []);

  const loadAnimes = async () => {
    try {
      setError(null);
      const data = await fetchLatestAnime();
      setAnimes(data);
    } catch (error) {
      console.error('Erreur lors du chargement des animes:', error);
      setError('Impossible de charger les nouveautés');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnimes();
    setRefreshing(false);
  };

  const handleAnimePress = (anime: KitsuAnime) => {
    router.push(`/anime/${anime.id}`);
  };

  const handleAddToCollection = async (anime: KitsuAnime) => {
    try {
      const inCollection = await isAnimeInCollection(anime.id);
      
      if (inCollection) {
        Alert.alert('Information', 'Cet anime est déjà dans votre collection');
        return;
      }

      const title = getBestTitle(anime.attributes.titles, anime.attributes.canonicalTitle);
      const success = await addAnimeToCollection({
        kitsuId: anime.id,
        title: title,
        episodeCount: anime.attributes.episodeCount || 0,
        posterImage: getImageUrl(anime.attributes.posterImage, 'large', title),
        synopsis: anime.attributes.synopsis || '',
        averageRating: anime.attributes.averageRating || 0,
        startDate: anime.attributes.startDate || '',
      });

      if (success) {
        Alert.alert('Succès', 'Anime ajouté à votre collection !');
      } else {
        Alert.alert('Erreur', 'Impossible d\'ajouter l\'anime à la collection');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      Alert.alert('Erreur', 'Une erreur s\'est produite');
    }
  };

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-gray-100`}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={tw`mt-4 text-gray-600`}>Chargement des nouveautés...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-gray-100 p-4`}>
        <Ionicons name="alert-circle" size={64} color="#EF4444" />
        <Text style={tw`text-lg text-gray-800 text-center mt-4`}>{error}</Text>
        <TouchableOpacity
          style={tw`mt-4 bg-blue-500 px-6 py-3 rounded-lg`}
          onPress={loadAnimes}
        >
          <Text style={tw`text-white font-medium`}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-white`}>
      {/* Header */}
      <View style={tw`bg-blue-500 pt-12 pb-6 px-4`}>
        <Text style={tw`text-white text-2xl font-bold`}>Nouveautés</Text>
        <Text style={tw`text-blue-100 mt-1`}>
          Découvrez les derniers animes sortis
        </Text>
      </View>

      {/* Liste des animes */}
      <ScrollView
        style={tw`flex-1`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {animes.length === 0 ? (
          <View style={tw`flex-1 justify-center items-center p-8`}>
            <Ionicons name="tv-outline" size={64} color="#9CA3AF" />
            <Text style={tw`text-gray-500 text-center mt-4`}>
              Aucune nouveauté disponible pour le moment
            </Text>
          </View>
        ) : (
          <View style={tw`p-4`}>
            {animes.map((anime) => (
              <AnimeCard
                key={anime.id}
                anime={anime}
                onPress={() => handleAnimePress(anime)}
                onAddToCollection={() => handleAddToCollection(anime)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// Composant pour afficher un anime
interface AnimeCardProps {
  anime: KitsuAnime;
  onPress: () => void;
  onAddToCollection: () => void;
}

function AnimeCard({ anime, onPress, onAddToCollection }: AnimeCardProps) {
  const title = getBestTitle(anime.attributes.titles, anime.attributes.canonicalTitle);
  const posterUrl = getImageUrl(anime.attributes.posterImage, 'medium', title);

  return (
    <TouchableOpacity
      style={tw`bg-white rounded-lg shadow-md mb-4 overflow-hidden`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={tw`flex-row`}>
        {/* Image */}
        <Image
          source={{ uri: posterUrl }}
          style={tw`w-24 h-32`}
          resizeMode="cover"
        />

        {/* Contenu */}
        <View style={tw`flex-1 p-4`}>
          {/* Titre */}
          <Text style={tw`text-lg font-bold text-gray-800 mb-2`} numberOfLines={2}>
            {title}
          </Text>

          {/* Informations */}
          <View style={tw`flex-row items-center mb-2`}>
            {anime.attributes.averageRating && (
              <>
                <Ionicons name="star" size={16} color="#FCD34D" />
                <Text style={tw`text-gray-600 ml-1 mr-3`}>
                  {(anime.attributes.averageRating / 10).toFixed(1)}
                </Text>
              </>
            )}
            
            <Text style={tw`text-gray-500 text-sm`}>
              {anime.attributes.subtype}
            </Text>
          </View>

          {/* Statut */}
          <View style={tw`flex-row items-center mb-3`}>
            <View 
              style={tw`w-2 h-2 rounded-full mr-2 ${
                anime.attributes.status === 'current' ? 'bg-green-500' :
                anime.attributes.status === 'upcoming' ? 'bg-blue-500' :
                'bg-gray-400'
              }`} 
            />
            <Text style={tw`text-gray-600 text-sm capitalize`}>
              {anime.attributes.status === 'current' ? 'En cours' :
               anime.attributes.status === 'upcoming' ? 'À venir' :
               anime.attributes.status}
            </Text>
          </View>

          {/* Synopsis court */}
          {anime.attributes.synopsis && (
            <Text style={tw`text-gray-600 text-sm mb-3`} numberOfLines={2}>
              {anime.attributes.synopsis}
            </Text>
          )}

          {/* Bouton d'action */}
          <TouchableOpacity
            style={tw`bg-blue-500 px-4 py-2 rounded-lg self-start`}
            onPress={(e) => {
              e.stopPropagation();
              onAddToCollection();
            }}
          >
            <Text style={tw`text-white text-sm font-medium`}>
              Ajouter à ma liste
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}