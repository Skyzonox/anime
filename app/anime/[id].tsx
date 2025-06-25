import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import tw from 'twrnc';
import { useCollectionAnimes } from '../../hooks/useDatabase';
import type { KitsuAnime, KitsuEpisode } from '../../services/apiService';
import { fetchAnimeById, fetchEpisodesByAnimeId, getBestTitle, getImageUrl } from '../../services/apiService';

export default function AnimeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addAnimeToCollection, isAnimeInCollection } = useCollectionAnimes();
  
  const [anime, setAnime] = useState<KitsuAnime | null>(null);
  const [episodes, setEpisodes] = useState<KitsuEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInCollection, setIsInCollection] = useState(false);
  const [addingToCollection, setAddingToCollection] = useState(false);

  useEffect(() => {
    loadAnimeData();
    checkIfInCollection();
  }, [id]);

  const loadAnimeData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const [animeData, episodesData] = await Promise.all([
        fetchAnimeById(id),
        fetchEpisodesByAnimeId(id)
      ]);

      setAnime(animeData);
      setEpisodes(episodesData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      Alert.alert('Erreur', 'Impossible de charger les détails de l\'anime');
    } finally {
      setLoading(false);
    }
  };

  const checkIfInCollection = async () => {
    if (!id) return;
    const inCollection = await isAnimeInCollection(id);
    setIsInCollection(inCollection);
  };

  const handleAddToCollection = async () => {
    if (!anime) return;

    try {
      setAddingToCollection(true);
      const success = await addAnimeToCollection({
        kitsuId: anime.id,
        title: getBestTitle(anime.attributes.titles, anime.attributes.canonicalTitle),
        episodeCount: anime.attributes.episodeCount || 0,
        posterImage: getImageUrl(anime.attributes.posterImage, 'large'),
        synopsis: anime.attributes.synopsis || '',
        averageRating: anime.attributes.averageRating || 0,
        startDate: anime.attributes.startDate || '',
      });

      if (success) {
        setIsInCollection(true);
        Alert.alert('Succès', 'Anime ajouté à votre collection !');
      } else {
        Alert.alert('Erreur', 'Impossible d\'ajouter l\'anime à la collection');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout à la collection:', error);
      Alert.alert('Erreur', 'Une erreur s\'est produite');
    } finally {
      setAddingToCollection(false);
    }
  };

  const handleEpisodePress = (episode: KitsuEpisode) => {
    router.push(`/anime/${id}/${episode.id}`);
  };

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-gray-100`}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={tw`mt-4 text-gray-600`}>Chargement...</Text>
      </View>
    );
  }

  if (!anime) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-gray-100`}>
        <Ionicons name="alert-circle" size={64} color="#EF4444" />
        <Text style={tw`mt-4 text-lg text-gray-800`}>Anime non trouvé</Text>
        <TouchableOpacity
          style={tw`mt-4 bg-blue-500 px-6 py-3 rounded-lg`}
          onPress={() => router.back()}
        >
          <Text style={tw`text-white font-medium`}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const title = getBestTitle(anime.attributes.titles, anime.attributes.canonicalTitle);
  const posterUrl = getImageUrl(anime.attributes.posterImage, 'large');

  return (
    <ScrollView style={tw`flex-1 bg-white`}>
      {/* Header avec image */}
      <View style={tw`relative`}>
        <Image
          source={{ uri: posterUrl }}
          style={tw`w-full h-80`}
          resizeMode="cover"
        />
        <View style={tw`absolute inset-0 bg-black bg-opacity-40`} />
        
        {/* Bouton retour */}
        <TouchableOpacity
          style={tw`absolute top-12 left-4 bg-black bg-opacity-50 p-2 rounded-full`}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        {/* Titre sur l'image */}
        <View style={tw`absolute bottom-4 left-4 right-4`}>
          <Text style={tw`text-white text-2xl font-bold mb-2`}>
            {title}
          </Text>
          {anime.attributes.averageRating && (
            <View style={tw`flex-row items-center`}>
              <Ionicons name="star" size={16} color="#FCD34D" />
              <Text style={tw`text-white ml-1`}>
                {(anime.attributes.averageRating / 10).toFixed(1)}/10
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Informations */}
      <View style={tw`p-4`}>
        {/* Bouton d'ajout à la collection */}
        <TouchableOpacity
          style={tw`${isInCollection ? 'bg-green-500' : 'bg-blue-500'} p-4 rounded-lg mb-4 flex-row items-center justify-center`}
          onPress={handleAddToCollection}
          disabled={isInCollection || addingToCollection}
        >
          {addingToCollection ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Ionicons 
                name={isInCollection ? "checkmark" : "add"} 
                size={20} 
                color="white" 
              />
              <Text style={tw`text-white font-medium ml-2`}>
                {isInCollection ? 'Dans votre collection' : 'Ajouter à la collection'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Informations de base */}
        <View style={tw`mb-6`}>
          <View style={tw`flex-row justify-between mb-2`}>
            <Text style={tw`text-gray-600`}>Type:</Text>
            <Text style={tw`font-medium`}>{anime.attributes.subtype}</Text>
          </View>
          
          {anime.attributes.episodeCount && (
            <View style={tw`flex-row justify-between mb-2`}>
              <Text style={tw`text-gray-600`}>Épisodes:</Text>
              <Text style={tw`font-medium`}>{anime.attributes.episodeCount}</Text>
            </View>
          )}

          <View style={tw`flex-row justify-between mb-2`}>
            <Text style={tw`text-gray-600`}>Statut:</Text>
            <Text style={tw`font-medium`}>{anime.attributes.status}</Text>
          </View>

          {anime.attributes.startDate && (
            <View style={tw`flex-row justify-between mb-2`}>
              <Text style={tw`text-gray-600`}>Date de début:</Text>
              <Text style={tw`font-medium`}>{anime.attributes.startDate}</Text>
            </View>
          )}
        </View>

        {/* Synopsis */}
        {anime.attributes.synopsis && (
          <View style={tw`mb-6`}>
            <Text style={tw`text-lg font-bold mb-2`}>Synopsis</Text>
            <Text style={tw`text-gray-700 leading-6`}>
              {anime.attributes.synopsis}
            </Text>
          </View>
        )}

        {/* Liste des épisodes */}
        {episodes.length > 0 && (
          <View>
            <Text style={tw`text-lg font-bold mb-4`}>
              Épisodes ({episodes.length})
            </Text>
            {episodes.map((episode) => (
              <TouchableOpacity
                key={episode.id}
                style={tw`bg-gray-50 p-4 rounded-lg mb-2 flex-row items-center`}
                onPress={() => handleEpisodePress(episode)}
              >
                <View style={tw`bg-blue-500 w-8 h-8 rounded-full items-center justify-center mr-3`}>
                  <Text style={tw`text-white font-bold text-sm`}>
                    {episode.attributes.number}
                  </Text>
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`font-medium text-gray-800`}>
                    {episode.attributes.canonicalTitle || `Épisode ${episode.attributes.number}`}
                  </Text>
                  {episode.attributes.airdate && (
                    <Text style={tw`text-gray-500 text-sm`}>
                      {episode.attributes.airdate}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}