// app/(tabs)/search.tsx - Version sans bouton "À voir"
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';

import ErrorComponent from '../../components/ErrorComponent';
import LoadingComponent from '../../components/LoadingComponent';
import { useRechercheAnime } from '../../hooks/useAnimeApi';
import { useCollectionAnimes } from '../../hooks/useDatabase';
import { KitsuAnime, getBestTitle, getImageUrl } from '../../services/apiService';

// Composant AnimeCard sans bouton "À voir"
function AnimeSearchCard({ 
  anime, 
  onPress, 
  onAddToCollection
}: {
  anime: KitsuAnime;
  onPress: () => void;
  onAddToCollection: () => void;
}) {
  const titre = getBestTitle(anime.attributes.titles, anime.attributes.canonicalTitle);
  const imageUrl = getImageUrl(anime.attributes.posterImage, 'medium', titre);
  const synopsis = anime.attributes.synopsis ? 
    (anime.attributes.synopsis.length > 100 ? 
      anime.attributes.synopsis.substring(0, 100) + '...' : 
      anime.attributes.synopsis) : '';
  const note = anime.attributes.averageRating ? 
    `${Math.round((anime.attributes.averageRating / 100) * 10 * 10) / 10}/10` : 
    'Pas de note';
  const statut = anime.attributes.status === 'current' ? 'En cours' : 
                anime.attributes.status === 'finished' ? 'Terminé' : 
                anime.attributes.status === 'upcoming' ? 'À venir' : anime.attributes.status;

  return (
    <TouchableOpacity 
      style={tw`bg-white rounded-lg shadow-md mb-4 mx-2`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={tw`flex-row`}>
        <View style={tw`w-24 h-36`}>
          <Image
            source={{ uri: imageUrl }}
            style={tw`w-full h-full rounded-l-lg`}
            resizeMode="cover"
          />
        </View>

        <View style={tw`flex-1 p-3`}>
          <Text style={tw`text-lg font-bold text-gray-800 mb-1`} numberOfLines={2}>
            {titre}
          </Text>

          <View style={tw`flex-row items-center mb-2`}>
            <View style={tw`bg-blue-100 px-2 py-1 rounded mr-2`}>
              <Text style={tw`text-blue-800 text-xs font-medium`}>
                {statut}
              </Text>
            </View>
            
            {anime.attributes.averageRating && (
              <View style={tw`flex-row items-center`}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={tw`text-gray-600 text-xs ml-1`}>
                  {note}
                </Text>
              </View>
            )}
          </View>

          {synopsis && (
            <Text style={tw`text-gray-600 text-sm mb-3`} numberOfLines={3}>
              {synopsis}
            </Text>
          )}

          {/* Seul le bouton "Ajouter à ma collection" reste */}
          <View style={tw`flex-row justify-end`}>
            <TouchableOpacity
              style={tw`bg-blue-500 px-4 py-2 rounded flex-row items-center`}
              onPress={(e) => {
                e.stopPropagation();
                onAddToCollection();
              }}
            >
              <Ionicons name="add" size={16} color="white" />
              <Text style={tw`text-white text-sm ml-1`}>Ajouter à ma collection</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function SearchScreen() {
  const [requete, setRequete] = useState('');
  const [rechercheEffectuee, setRechercheEffectuee] = useState(false);
  
  // Hooks pour la recherche (suppression du hook useListeARegarder)
  const { animes, estEnChargement, erreur, rechercherAnimes, viderRecherche } = useRechercheAnime();
  const { addAnimeToCollection } = useCollectionAnimes();

  // Fonction pour effectuer la recherche
  const handleRecherche = async () => {
    if (!requete.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un terme de recherche.');
      return;
    }

    setRechercheEffectuee(true);
    await rechercherAnimes(requete.trim());
  };

  // Fonction pour vider la recherche
  const handleViderRecherche = () => {
    setRequete('');
    setRechercheEffectuee(false);
    viderRecherche();
  };

  // Fonction pour ajouter un anime à la collection
  const handleAjouterACollection = async (anime: KitsuAnime) => {
    try {
      const titre = getBestTitle(anime.attributes.titles, anime.attributes.canonicalTitle);
      const succes = await addAnimeToCollection({
        kitsuId: anime.id,
        title: titre,
        episodeCount: anime.attributes.episodeCount || 0,
        posterImage: getImageUrl(anime.attributes.posterImage, 'medium', titre),
        synopsis: anime.attributes.synopsis || '',
        averageRating: anime.attributes.averageRating || 0,
        startDate: anime.attributes.startDate || ''
      });
      
      if (succes) {
        Alert.alert(
          'Succès !', 
          `${titre} a été ajouté à votre collection.`
        );
      } else {
        Alert.alert('Information', 'Cet anime est déjà dans votre collection ou une erreur est survenue.');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'ajout.');
    }
  };

  // Fonction pour naviguer vers les détails d'un anime
  const handleVoirDetails = (animeId: string) => {
    router.push(`/anime/${animeId}`);
  };

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      {/* Barre de recherche */}
      <View style={tw`bg-white p-4 shadow-sm`}>
        <View style={tw`flex-row items-center bg-gray-100 rounded-lg px-3 py-2`}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            style={tw`flex-1 ml-2 text-gray-800`}
            placeholder="Rechercher un anime..."
            placeholderTextColor="#9CA3AF"
            value={requete}
            onChangeText={setRequete}
            onSubmitEditing={handleRecherche}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {requete.length > 0 && (
            <TouchableOpacity onPress={handleViderRecherche}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Bouton de recherche */}
        <TouchableOpacity
          style={tw`bg-blue-500 rounded-lg py-3 mt-3 flex-row items-center justify-center ${
            !requete.trim() ? 'opacity-50' : ''
          }`}
          onPress={handleRecherche}
          disabled={!requete.trim() || estEnChargement}
        >
          {estEnChargement ? (
            <View style={tw`flex-row items-center`}>
              <LoadingComponent message="" size="small" />
              <Text style={tw`text-white font-medium ml-2`}>Recherche...</Text>
            </View>
          ) : (
            <>
              <Ionicons name="search" size={20} color="white" />
              <Text style={tw`text-white font-medium ml-2`}>
                Rechercher
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Résultats de recherche */}
      <ScrollView style={tw`flex-1`} contentContainerStyle={tw`pb-6`}>
        {/* État initial - pas de recherche effectuée */}
        {!rechercheEffectuee && (
          <View style={tw`flex-1 justify-center items-center px-6 mt-20`}>
            <View style={tw`bg-blue-100 rounded-full p-6 mb-4`}>
              <Ionicons name="search-outline" size={48} color="#3B82F6" />
            </View>
            <Text style={tw`text-xl font-bold text-gray-800 mb-2 text-center`}>
              Rechercher des animes
            </Text>
            <Text style={tw`text-gray-600 text-center`}>
              Utilisez la barre de recherche ci-dessus pour trouver vos animes préférés
            </Text>
          </View>
        )}

        {/* Chargement */}
        {estEnChargement && rechercheEffectuee && (
          <LoadingComponent message="Recherche en cours..." />
        )}

        {/* Erreur */}
        {erreur && rechercheEffectuee && (
          <ErrorComponent 
            message={erreur} 
            onRetry={handleRecherche}
          />
        )}

        {/* Aucun résultat */}
        {!estEnChargement && !erreur && rechercheEffectuee && animes.length === 0 && (
          <View style={tw`justify-center items-center px-6 mt-20`}>
            <View style={tw`bg-gray-100 rounded-full p-6 mb-4`}>
              <Ionicons name="search-outline" size={48} color="#6B7280" />
            </View>
            <Text style={tw`text-xl font-bold text-gray-800 mb-2 text-center`}>
              Aucun résultat
            </Text>
            <Text style={tw`text-gray-600 text-center mb-4`}>
              Aucun anime trouvé pour "{requete}"
            </Text>
            <TouchableOpacity
              style={tw`bg-blue-500 px-4 py-2 rounded-lg`}
              onPress={handleViderRecherche}
            >
              <Text style={tw`text-white font-medium`}>
                Nouvelle recherche
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Résultats */}
        {!estEnChargement && !erreur && animes.length > 0 && (
          <View style={tw`pt-4`}>
            {/* Nombre de résultats */}
            <View style={tw`px-4 mb-4`}>
              <Text style={tw`text-gray-600`}>
                {animes.length} résultat{animes.length > 1 ? 's' : ''} trouvé{animes.length > 1 ? 's' : ''} pour "{requete}"
              </Text>
            </View>

            {/* Liste des animes */}
            {animes.map((anime) => (
              <AnimeSearchCard
                key={anime.id}
                anime={anime}
                onPress={() => handleVoirDetails(anime.id)}
                onAddToCollection={() => handleAjouterACollection(anime)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}