// app/collection/[id].tsx
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';

import EpisodeCard from '../../components/EpisodeCard';
import ErrorComponent from '../../components/ErrorComponent';
import LoadingComponent from '../../components/LoadingComponent';
import ProgressBar from '../../components/ProgressBar';
import { useEpisodesAnime } from '../../hooks/useAnimeApi';
import {
  useCollectionAnimes,
  useEpisodesVus,
  useProgressionAnime
} from '../../hooks/useDatabase';

export default function CollectionAnimeDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  // Hooks pour récupérer les données
  const { collection, supprimerAnime } = useCollectionAnimes();
  const { episodes, estEnChargement: episodesEnChargement } = useEpisodesAnime(id!);
  const { marquerCommeVu, verifierSiVu, episodesVus } = useEpisodesVus(id!);
  const { 
    nombreEpisodesVus, 
    nombreEpisodesTotal, 
    pourcentageProgression, 
    estTermine 
  } = useProgressionAnime(id!, collection.find(a => a.id === id)?.nombreEpisodesTotal);

  // Trouver l'anime dans la collection
  const anime = collection.find(a => a.id === id);

  if (!anime) {
    return (
      <ErrorComponent 
        message="Anime non trouvé dans votre collection" 
        fullScreen 
      />
    );
  }

  // Fonction pour marquer un épisode comme vu
  const handleMarquerEpisodeVu = async (numeroEpisode: number, titreEpisode?: string) => {
    try {
      const succes = await marquerCommeVu(numeroEpisode, titreEpisode);
      if (succes) {
        Alert.alert('Succès', `Épisode ${numeroEpisode} marqué comme vu.`);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue.');
    }
  };

  // Fonction pour supprimer l'anime de la collection
  const handleSupprimerDeCollection = () => {
    Alert.alert(
      'Supprimer de la collection',
      `Voulez-vous vraiment supprimer "${anime.titre}" de votre collection ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const succes = await supprimerAnime(anime.id);
            if (succes) {
              router.back();
              Alert.alert('Succès', 'L\'anime a été supprimé de votre collection.');
            } else {
              Alert.alert('Erreur', 'Impossible de supprimer cet anime.');
            }
          },
        },
      ]
    );
  };

  const handleVoirEpisode = (episodeId: string) => {
    router.push(`/anime/${id}/${episodeId}`);
  };

  // Fonction pour formater les dates
  const formaterDate = (dateString: string): string => {
    if (!dateString) return 'Date inconnue';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Date invalide';
    }
  };

  // Fonction pour formater la note
  const formaterNote = (note: number): string => {
    if (!note && note !== 0) return 'Pas de note';
    const noteSur10 = Math.round((note / 100) * 10 * 10) / 10;
    return `${noteSur10}/10`;
  };

  return (
    <ScrollView style={tw`flex-1 bg-white`}>
      {/* En-tête avec informations de l'anime */}
      <View style={tw`bg-gray-100 p-4`}>
        <View style={tw`flex-row`}>
          {/* Image */}
          <View style={tw`w-32 h-48 mr-4`}>
            {anime.imageUrl ? (
              <Image
                source={{ uri: anime.imageUrl }}
                style={tw`w-full h-full rounded-lg`}
                resizeMode="cover"
              />
            ) : (
              <View style={tw`w-full h-full bg-gray-300 rounded-lg justify-center items-center`}>
                <Ionicons name="image-outline" size={32} color="#6B7280" />
              </View>
            )}
          </View>

          {/* Informations */}
          <View style={tw`flex-1`}>
            <Text style={tw`text-xl font-bold text-gray-800 mb-2`}>
              {anime.titre}
            </Text>

            {anime.titreOriginal && anime.titreOriginal !== anime.titre && (
              <Text style={tw`text-gray-600 mb-2 italic`}>
                {anime.titreOriginal}
              </Text>
            )}

            {/* Note et statut */}
            <View style={tw`flex-row items-center mb-2`}>
              {anime.noteApi && (
                <View style={tw`flex-row items-center mr-4`}>
                  <Ionicons name="star" size={16} color="#F59E0B" />
                  <Text style={tw`text-gray-700 ml-1 font-medium`}>
                    {formaterNote(anime.noteApi)}
                  </Text>
                </View>
              )}
              {anime.statut && (
                <View style={tw`bg-blue-100 px-2 py-1 rounded`}>
                  <Text style={tw`text-blue-800 text-sm font-medium`}>
                    {anime.statut}
                  </Text>
                </View>
              )}
            </View>

            {/* Nombre d'épisodes */}
            {anime.nombreEpisodesTotal && (
              <Text style={tw`text-gray-600 mb-2`}>
                {anime.nombreEpisodesTotal} épisode{anime.nombreEpisodesTotal > 1 ? 's' : ''}
              </Text>
            )}

            {/* Date d'ajout */}
            <Text style={tw`text-gray-500 text-sm`}>
              Ajouté le {formaterDate(anime.dateAjout)}
            </Text>
          </View>
        </View>

        {/* Bouton supprimer */}
        <TouchableOpacity
          style={tw`bg-red-500 py-2 px-4 rounded-lg flex-row items-center justify-center mt-4`}
          onPress={handleSupprimerDeCollection}
        >
          <Ionicons name="trash-outline" size={20} color="white" />
          <Text style={tw`text-white font-medium ml-2`}>
            Supprimer de la collection
          </Text>
        </TouchableOpacity>
      </View>

      {/* Synopsis */}
      {anime.synopsis && (
        <View style={tw`p-4 border-b border-gray-200`}>
          <Text style={tw`text-lg font-bold text-gray-800 mb-2`}>
            Synopsis
          </Text>
          <Text style={tw`text-gray-700 leading-6`}>
            {anime.synopsis}
          </Text>
        </View>
      )}

      {/* Progression */}
      <View style={tw`p-4 border-b border-gray-200`}>
        <Text style={tw`text-lg font-bold text-gray-800 mb-3`}>
          Ma progression
        </Text>
        
        <ProgressBar
          episodesVus={nombreEpisodesVus}
          episodesTotal={nombreEpisodesTotal}
          showText={true}
          height="medium"
          color="green"
        />

        {/* Statistiques détaillées */}
        <View style={tw`bg-gray-50 rounded-lg p-4 mt-4`}>
          <View style={tw`flex-row justify-between items-center mb-2`}>
            <Text style={tw`text-gray-600 font-medium`}>Épisodes vus</Text>
            <Text style={tw`text-gray-800 font-bold`}>
              {nombreEpisodesVus} / {nombreEpisodesTotal || '?'}
            </Text>
          </View>

          <View style={tw`flex-row justify-between items-center mb-2`}>
            <Text style={tw`text-gray-600 font-medium`}>Progression</Text>
            <Text style={tw`text-gray-800 font-bold`}>
              {pourcentageProgression}%
            </Text>
          </View>

          <View style={tw`flex-row justify-between items-center`}>
            <Text style={tw`text-gray-600 font-medium`}>Statut</Text>
            <View style={tw`flex-row items-center`}>
              <View style={tw`w-2 h-2 rounded-full mr-2 ${estTermine ? 'bg-green-500' : 'bg-blue-500'}`} />
              <Text style={tw`text-gray-800 ${estTermine ? 'text-green-600' : 'text-blue-600'}`}>
                {estTermine ? 'Terminé' : 'En cours'}
              </Text>
            </View>
          </View>
        </View>

        {/* Derniers épisodes vus */}
        {episodesVus.length > 0 && (
          <View style={tw`mt-4`}>
            <Text style={tw`text-gray-700 font-medium mb-2`}>
              Derniers épisodes vus :
            </Text>
            <View style={tw`flex-row flex-wrap`}>
              {episodesVus
                .sort((a, b) => new Date(b.dateVu).getTime() - new Date(a.dateVu).getTime())
                .slice(0, 5)
                .map((episode, index) => (
                  <View key={episode.id} style={tw`bg-green-100 px-2 py-1 rounded mr-2 mb-1`}>
                    <Text style={tw`text-green-800 text-sm font-medium`}>
                      Ép. {episode.numeroEpisode}
                    </Text>
                  </View>
                ))}
            </View>
          </View>
        )}
      </View>

      {/* Liste des épisodes */}
      <View style={tw`p-4`}>
        <Text style={tw`text-lg font-bold text-gray-800 mb-3`}>
          Épisodes
        </Text>

        {episodesEnChargement ? (
          <LoadingComponent message="Chargement des épisodes..." />
        ) : episodes.length > 0 ? (
          <View>
            {episodes.map((episode) => (
              <EpisodeCard
                key={episode.id}
                episode={episode}
                onPress={() => handleVoirEpisode(episode.id)}
                onMarkAsWatched={() => handleMarquerEpisodeVu(
                  episode.attributes.number, 
                  episode.attributes.canonicalTitle
                )}
                isWatched={verifierSiVu(episode.attributes.number)}
                animeTitle={anime.titre}
                totalEpisodes={anime.nombreEpisodesTotal}
              />
            ))}
          </View>
        ) : (
          <View style={tw`items-center py-8`}>
            <Ionicons name="film-outline" size={48} color="#9CA3AF" />
            <Text style={tw`text-gray-500 mt-2`}>
              Aucun épisode disponible
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}