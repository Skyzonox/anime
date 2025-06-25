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
import { useCollectionAnimes, useWatchedEpisodes } from '../../../hooks/useDatabase';
import type { KitsuAnime, KitsuEpisode } from '../../../services/apiService';
import { fetchAnimeById, fetchEpisodeById, getBestTitle, getImageUrl } from '../../../services/apiService';

export default function EpisodeDetailScreen() {
  const { id: animeId, episode: episodeId } = useLocalSearchParams<{ 
    id: string; 
    episode: string; 
  }>();
  const router = useRouter();
  const { markEpisodeAsWatched, addAnimeToCollection, isAnimeInCollection } = useCollectionAnimes();
  const { watchedEpisodes, refreshWatchedEpisodes } = useWatchedEpisodes(animeId || '');
  
  const [episode, setEpisode] = useState<KitsuEpisode | null>(null);
  const [anime, setAnime] = useState<KitsuAnime | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWatched, setIsWatched] = useState(false);
  const [isInCollection, setIsInCollection] = useState(false);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    loadEpisodeData();
    checkCollectionStatus();
  }, [episodeId, animeId]);

  useEffect(() => {
    if (episode && watchedEpisodes.length > 0) {
      setIsWatched(watchedEpisodes.includes(episode.attributes.number));
    }
  }, [episode, watchedEpisodes]);

  const loadEpisodeData = async () => {
    if (!episodeId || !animeId) return;

    try {
      setLoading(true);
      const [episodeData, animeData] = await Promise.all([
        fetchEpisodeById(episodeId),
        fetchAnimeById(animeId)
      ]);

      setEpisode(episodeData);
      setAnime(animeData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      Alert.alert('Erreur', 'Impossible de charger les détails de l\'épisode');
    } finally {
      setLoading(false);
    }
  };

  const checkCollectionStatus = async () => {
    if (!animeId) return;
    const inCollection = await isAnimeInCollection(animeId);
    setIsInCollection(inCollection);
  };

  const handleMarkAsWatched = async () => {
    if (!episode || !animeId) return;

    try {
      setMarking(true);
      
      // Si l'anime n'est pas dans la collection, l'ajouter d'abord
      if (!isInCollection && anime) {
        const addSuccess = await addAnimeToCollection({
          kitsuId: anime.id,
          title: getBestTitle(anime.attributes.titles, anime.attributes.canonicalTitle),
          episodeCount: anime.attributes.episodeCount || 0,
          posterImage: getImageUrl(anime.attributes.posterImage, 'large'),
          synopsis: anime.attributes.synopsis || '',
          averageRating: anime.attributes.averageRating || 0,
          startDate: anime.attributes.startDate || '',
        });

        if (addSuccess) {
          setIsInCollection(true);
        }
      }

      // Marquer l'épisode comme vu
      const success = await markEpisodeAsWatched(animeId, episode.attributes.number);
      
      if (success) {
        setIsWatched(true);
        refreshWatchedEpisodes();
        Alert.alert('Succès', 'Épisode marqué comme vu !');
      } else {
        Alert.alert('Erreur', 'Impossible de marquer l\'épisode comme vu');
      }
    } catch (error) {
      console.error('Erreur lors du marquage:', error);
      Alert.alert('Erreur', 'Une erreur s\'est produite');
    } finally {
      setMarking(false);
    }
  };

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-gray-100`}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={tw`mt-4 text-gray-600`}>Chargement...</Text>
      </View>
    );
  }

  if (!episode) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-gray-100`}>
        <Ionicons name="alert-circle" size={64} color="#EF4444" />
        <Text style={tw`mt-4 text-lg text-gray-800`}>Épisode non trouvé</Text>
        <TouchableOpacity
          style={tw`mt-4 bg-blue-500 px-6 py-3 rounded-lg`}
          onPress={() => router.back()}
        >
          <Text style={tw`text-white font-medium`}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const thumbnailUrl = getImageUrl(episode.attributes.thumbnail, 'large');
  const animeTitle = anime ? getBestTitle(anime.attributes.titles, anime.attributes.canonicalTitle) : '';

  return (
    <ScrollView style={tw`flex-1 bg-white`}>
      {/* Header avec image */}
      <View style={tw`relative`}>
        <Image
          source={{ uri: thumbnailUrl }}
          style={tw`w-full h-60`}
          resizeMode="cover"
        />
        <View style={tw`absolute inset-0 bg-black bg-opacity-30`} />
        
        {/* Bouton retour */}
        <TouchableOpacity
          style={tw`absolute top-12 left-4 bg-black bg-opacity-50 p-2 rounded-full`}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        {/* Numéro d'épisode */}
        <View style={tw`absolute bottom-4 left-4 right-4`}>
          <Text style={tw`text-white text-lg opacity-80 mb-1`}>
            {animeTitle}
          </Text>
          <Text style={tw`text-white text-2xl font-bold`}>
            Épisode {episode.attributes.number}
          </Text>
          {episode.attributes.canonicalTitle && (
            <Text style={tw`text-white text-lg mt-1`}>
              {episode.attributes.canonicalTitle}
            </Text>
          )}
        </View>

        {/* Badge "Vu" */}
        {isWatched && (
          <View style={tw`absolute top-12 right-4 bg-green-500 px-3 py-1 rounded-full flex-row items-center`}>
            <Ionicons name="checkmark" size={16} color="white" />
            <Text style={tw`text-white text-sm ml-1 font-medium`}>Vu</Text>
          </View>
        )}
      </View>

      {/* Contenu */}
      <View style={tw`p-4`}>
        {/* Bouton marquer comme vu */}
        <TouchableOpacity
          style={tw`${isWatched ? 'bg-green-500' : 'bg-blue-500'} p-4 rounded-lg mb-6 flex-row items-center justify-center`}
          onPress={handleMarkAsWatched}
          disabled={isWatched || marking}
        >
          {marking ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Ionicons 
                name={isWatched ? "checkmark" : "eye"} 
                size={20} 
                color="white" 
              />
              <Text style={tw`text-white font-medium ml-2`}>
                {isWatched ? 'Déjà vu' : 'Marquer comme vu'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Informations de l'épisode */}
        <View style={tw`mb-6`}>
          <View style={tw`flex-row justify-between mb-3`}>
            <Text style={tw`text-gray-600`}>Numéro:</Text>
            <Text style={tw`font-medium`}>{episode.attributes.number}</Text>
          </View>

          {episode.attributes.airdate && (
            <View style={tw`flex-row justify-between mb-3`}>
              <Text style={tw`text-gray-600`}>Date de diffusion:</Text>
              <Text style={tw`font-medium`}>{episode.attributes.airdate}</Text>
            </View>
          )}

          {episode.attributes.length && (
            <View style={tw`flex-row justify-between mb-3`}>
              <Text style={tw`text-gray-600`}>Durée:</Text>
              <Text style={tw`font-medium`}>{episode.attributes.length} minutes</Text>
            </View>
          )}

          {episode.attributes.seasonNumber && (
            <View style={tw`flex-row justify-between mb-3`}>
              <Text style={tw`text-gray-600`}>Saison:</Text>
              <Text style={tw`font-medium`}>{episode.attributes.seasonNumber}</Text>
            </View>
          )}
        </View>

        {/* Synopsis de l'épisode */}
        {episode.attributes.synopsis && (
          <View style={tw`mb-6`}>
            <Text style={tw`text-lg font-bold mb-3`}>Synopsis</Text>
            <Text style={tw`text-gray-700 leading-6`}>
              {episode.attributes.synopsis}
            </Text>
          </View>
        )}

        {/* Informations sur l'anime */}
        {anime && (
          <View style={tw`bg-gray-50 p-4 rounded-lg`}>
            <Text style={tw`text-lg font-bold mb-3`}>À propos de l'anime</Text>
            
            <TouchableOpacity
              style={tw`flex-row items-center mb-3`}
              onPress={() => router.push(`/anime/${animeId}`)}
            >
              <Image
                source={{ uri: getImageUrl(anime.attributes.posterImage, 'small') }}
                style={tw`w-12 h-16 rounded mr-3`}
                resizeMode="cover"
              />
              <View style={tw`flex-1`}>
                <Text style={tw`font-medium text-gray-800`}>
                  {animeTitle}
                </Text>
                {anime.attributes.averageRating && (
                  <View style={tw`flex-row items-center mt-1`}>
                    <Ionicons name="star" size={14} color="#FCD34D" />
                    <Text style={tw`text-gray-600 text-sm ml-1`}>
                      {(anime.attributes.averageRating / 10).toFixed(1)}/10
                    </Text>
                  </View>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>

            {anime.attributes.episodeCount && (
              <Text style={tw`text-gray-600 text-sm`}>
                {anime.attributes.episodeCount} épisodes au total
              </Text>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}