// app/collection/[id].tsx - Version corrigée pour les erreurs Text
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';

import ErrorComponent from '../../components/ErrorComponent';
import LoadingComponent from '../../components/LoadingComponent';
import ProgressBar from '../../components/ProgressBar';
import { useEpisodesAnime } from '../../hooks/useAnimeApi';
import {
  useCollectionAnimes,
  useEpisodesVus,
  useProgressionAnime
} from '../../hooks/useDatabase';
import { getBestTitle, getImageUrl } from '../../services/apiService';

export default function CollectionAnimeDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const { collection, supprimerAnime } = useCollectionAnimes();
  const { 
    episodes, 
    estEnChargement: episodesEnChargement,
    estEnChargementPlus,
    hasMore,
    chargerEpisodesSuivants,
    total,
    erreur: erreurEpisodes
  } = useEpisodesAnime(id!);
  const { marquerCommeVu, verifierSiVu, episodesVus } = useEpisodesVus(id!);
  const { 
    nombreEpisodesVus, 
    nombreEpisodesTotal, 
    pourcentageProgression, 
    estTermine 
  } = useProgressionAnime(id!, collection.find(a => a.id === id)?.nombreEpisodesTotal);

  const anime = collection.find(a => a.id === id);

  if (!anime) {
    return (
      <ErrorComponent 
        message="Anime non trouvé dans votre collection" 
        fullScreen 
      />
    );
  }

  const handleMarquerEpisodeVu = async (numeroEpisode: number, titreEpisode?: string) => {
    try {
      const succes = await marquerCommeVu(numeroEpisode, titreEpisode);
      if (succes) {
        Alert.alert('Succès', `Episode ${numeroEpisode} marqué comme vu.`);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue.');
    }
  };

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
          <View style={tw`w-32 h-48 mr-4`}>
            <Image
              source={{ uri: getImageUrl(undefined, 'large', anime.titre || 'Anime') }}
              style={tw`w-full h-full rounded-lg`}
              resizeMode="cover"
            />
          </View>

          <View style={tw`flex-1`}>
            <Text style={tw`text-xl font-bold text-gray-800 mb-2`}>
              {anime.titre || 'Titre inconnu'}
            </Text>

            {anime.titreOriginal && anime.titreOriginal !== anime.titre && (
              <Text style={tw`text-gray-600 mb-2 italic`}>
                {anime.titreOriginal}
              </Text>
            )}

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

            {anime.nombreEpisodesTotal && (
              <Text style={tw`text-gray-600 mb-2`}>
                {anime.nombreEpisodesTotal} épisode{anime.nombreEpisodesTotal > 1 ? 's' : ''}
              </Text>
            )}

            <Text style={tw`text-gray-500 text-sm`}>
              Ajouté le {formaterDate(anime.dateAjout)}
            </Text>
          </View>
        </View>

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

        <View style={tw`bg-gray-50 rounded-lg p-4 mt-4`}>
          <View style={tw`flex-row justify-between items-center mb-2`}>
            <Text style={tw`text-gray-600 font-medium`}>Episodes vus</Text>
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
                      Ep. {episode.numeroEpisode}
                    </Text>
                  </View>
                ))}
            </View>
          </View>
        )}
      </View>

      {/* Liste des épisodes */}
      <View style={tw`p-4`}>
        <View style={tw`flex-row justify-between items-center mb-3`}>
          <Text style={tw`text-lg font-bold text-gray-800`}>
            Episodes
          </Text>
          {total > 0 && (
            <Text style={tw`text-gray-600`}>
              {episodes.length} / {total}
            </Text>
          )}
        </View>

        {erreurEpisodes && (
          <View style={tw`bg-orange-100 border border-orange-300 rounded-lg p-4 mb-4`}>
            <View style={tw`flex-row items-center`}>
              <Ionicons name="warning" size={20} color="#EA580C" />
              <Text style={tw`text-orange-800 font-medium ml-2`}>
                Episodes non disponibles
              </Text>
            </View>
            <Text style={tw`text-orange-700 text-sm mt-1`}>
              Les épisodes ne peuvent pas être chargés depuis l'API. Vous pouvez continuer à marquer vos épisodes comme vus manuellement.
            </Text>
          </View>
        )}

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
              />
            ))}

            {hasMore && (
              <TouchableOpacity
                style={tw`bg-blue-500 py-3 px-4 rounded-lg mt-4 flex-row items-center justify-center`}
                onPress={chargerEpisodesSuivants}
                disabled={estEnChargementPlus}
              >
                {estEnChargementPlus ? (
                  <LoadingComponent message="" size="small" />
                ) : (
                  <>
                    <Ionicons name="add" size={20} color="white" />
                    <Text style={tw`text-white font-medium ml-2`}>
                      Charger 10 épisodes suivants
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
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

function EpisodeCard({ 
  episode, 
  onPress, 
  onMarkAsWatched,
  isWatched = false,
  animeTitle
}: {
  episode: any;
  onPress: () => void;
  onMarkAsWatched?: () => void;
  isWatched?: boolean;
  animeTitle?: string;
}) {
  const titre = getBestTitle(episode.attributes.titles, episode.attributes.canonicalTitle);
  const synopsis = episode.attributes.synopsis ? 
    (episode.attributes.synopsis.length > 80 ? 
      episode.attributes.synopsis.substring(0, 80) + '...' : 
      episode.attributes.synopsis) : '';
  const dateAir = episode.attributes.airdate ? 
    new Date(episode.attributes.airdate).toLocaleDateString('fr-FR') : '';
  const duree = episode.attributes.length ? 
    (episode.attributes.length < 60 ? 
      `${episode.attributes.length} min` : 
      `${Math.floor(episode.attributes.length / 60)}h${(episode.attributes.length % 60).toString().padStart(2, '0')}`) : '';

  return (
    <TouchableOpacity 
      style={tw`bg-white rounded-lg shadow-sm mb-3 mx-2 border ${isWatched ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={tw`flex-row`}>
        <View style={tw`w-20 h-28 bg-gray-200 rounded-l-lg justify-center items-center relative`}>
          <Image
            source={{ uri: getImageUrl(episode.attributes.thumbnail, 'small', titre) }}
            style={tw`w-full h-full rounded-l-lg`}
            resizeMode="cover"
          />
          
          {isWatched && (
            <View style={tw`absolute top-1 right-1 bg-green-500 rounded-full p-1`}>
              <Ionicons name="checkmark" size={12} color="white" />
            </View>
          )}
        </View>

        <View style={tw`flex-1 p-3`}>
          <View style={tw`flex-row items-center mb-1`}>
            <Text style={tw`text-blue-600 font-bold text-sm mr-2`}>
              Ep. {episode.attributes.number}
            </Text>
            <Text style={tw`text-gray-800 font-medium flex-1`} numberOfLines={1}>
              {titre}
            </Text>
          </View>

          {synopsis && (
            <Text style={tw`text-gray-600 text-sm mb-2`} numberOfLines={2}>
              {synopsis}
            </Text>
          )}

          <View style={tw`flex-row items-center justify-between`}>
            <View style={tw`flex-row items-center`}>
              {dateAir && (
                <View style={tw`flex-row items-center mr-3`}>
                  <Ionicons name="calendar-outline" size={12} color="#6B7280" />
                  <Text style={tw`text-gray-500 text-xs ml-1`}>
                    {dateAir}
                  </Text>
                </View>
              )}

              {duree && (
                <View style={tw`flex-row items-center`}>
                  <Ionicons name="time-outline" size={12} color="#6B7280" />
                  <Text style={tw`text-gray-500 text-xs ml-1`}>
                    {duree}
                  </Text>
                </View>
              )}
            </View>

            {onMarkAsWatched && !isWatched && (
              <TouchableOpacity
                style={tw`bg-blue-500 px-2 py-1 rounded flex-row items-center`}
                onPress={(e) => {
                  e.stopPropagation();
                  onMarkAsWatched();
                }}
              >
                <Ionicons name="eye" size={12} color="white" />
                <Text style={tw`text-white text-xs ml-1`}>Vu</Text>
              </TouchableOpacity>
            )}

            {isWatched && (
              <View style={tw`bg-green-100 px-2 py-1 rounded flex-row items-center`}>
                <Ionicons name="checkmark" size={12} color="#10B981" />
                <Text style={tw`text-green-800 text-xs ml-1`}>Vu</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}