// app/(tabs)/search.tsx
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';

import AnimeCard from '../../components/AnimeCard';
import ErrorComponent from '../../components/ErrorComponent';
import LoadingComponent from '../../components/LoadingComponent';
import { useRechercheAnime } from '../../hooks/useAnimeApi';
import { useCollectionAnimes, useListeARegarder } from '../../hooks/useDatabase';

export default function SearchScreen() {
  const [requete, setRequete] = useState('');
  const [rechercheEffectuee, setRechercheEffectuee] = useState(false);
  
  // Hooks pour la recherche
  const { animes, estEnChargement, erreur, rechercherAnimes, viderRecherche } = useRechercheAnime();
  const { ajouterAnime, verifierSiDansCollection } = useCollectionAnimes();
  const { ajouterALaListe, verifierSiDansListe } = useListeARegarder();

  // Fonction pour effectuer la recherche
  const handleRecherche = async () => {
    if (!requete.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un terme de recherche.');
      return;
    }

    if (requete.trim().length < 1 || requete.trim().length > 100) {
      Alert.alert('Erreur', 'Le terme de recherche doit faire entre 1 et 100 caractères.');
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
  const handleAjouterACollection = async (anime: any) => {
    try {
      const succes = await ajouterAnime(anime);
      if (succes) {
        Alert.alert(
          'Succès !', 
          `${anime.attributes.canonicalTitle} a été ajouté à votre collection.`
        );
      } else {
        Alert.alert('Erreur', 'Impossible d\'ajouter cet anime à votre collection.');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'ajout.');
    }
  };

  // Fonction pour ajouter un anime à la liste à regarder
  const handleAjouterAListeARegarder = async (anime: any) => {
    try {
      const succes = await ajouterALaListe(anime);
      if (succes) {
        Alert.alert(
          'Succès !', 
          `${anime.attributes.canonicalTitle} a été ajouté à votre liste à regarder.`
        );
      } else {
        Alert.alert('Erreur', 'Impossible d\'ajouter cet anime à votre liste.');
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
              <AnimeCard
                key={anime.id}
                anime={anime}
                onPress={() => handleVoirDetails(anime.id)}
                onAddToCollection={() => handleAjouterACollection(anime)}
                onAddToWatchlist={() => handleAjouterAListeARegarder(anime)}
                isInCollection={verifierSiDansCollection(anime.id)}
                isInWatchlist={verifierSiDansListe(anime.id)}
                showActions={true}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}