// app/(tabs)/collection.tsx - Correction de l'affichage des images
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';

import ErrorComponent from '../../components/ErrorComponent';
import LoadingComponent from '../../components/LoadingComponent';
import ProgressBar from '../../components/ProgressBar';
import { useCollectionAnimes, useProgressionAnime } from '../../hooks/useDatabase';
import { getImageUrl } from '../../services/apiService';

export default function CollectionScreen() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { 
    collection, 
    estEnChargement, 
    erreur, 
    recharger, 
    supprimerAnime 
  } = useCollectionAnimes();

  const rafraichir = async () => {
    setIsRefreshing(true);
    await recharger();
    setIsRefreshing(false);
  };

  const handleVoirDetails = (animeId: string) => {
    router.push(`/collection/${animeId}`);
  };

  const handleSupprimerAnime = (animeId: string, titre: string) => {
    Alert.alert(
      'Supprimer de la collection',
      `Voulez-vous vraiment supprimer "${titre}" de votre collection ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const succes = await supprimerAnime(animeId);
            if (succes) {
              Alert.alert('Succès', 'L\'anime a été supprimé de votre collection.');
            } else {
              Alert.alert('Erreur', 'Impossible de supprimer cet anime.');
            }
          },
        },
      ]
    );
  };

  if (estEnChargement && collection.length === 0) {
    return <LoadingComponent message="Chargement de votre collection..." fullScreen />;
  }

  if (erreur && collection.length === 0) {
    return (
      <ErrorComponent 
        message={erreur} 
        onRetry={recharger}
        fullScreen 
      />
    );
  }

  if (collection.length === 0) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-gray-50 px-6`}>
        <View style={tw`bg-blue-100 rounded-full p-6 mb-4`}>
          <Ionicons name="library-outline" size={48} color="#3B82F6" />
        </View>
        <Text style={tw`text-xl font-bold text-gray-800 mb-2 text-center`}>
          Votre collection est vide
        </Text>
        <Text style={tw`text-gray-600 text-center mb-6`}>
          Ajoutez des animes à votre collection depuis l'onglet Nouveautés ou Recherche
        </Text>
        <TouchableOpacity
          style={tw`bg-blue-500 px-6 py-3 rounded-lg flex-row items-center`}
          onPress={() => router.push('/search')}
        >
          <Ionicons name="search" size={20} color="white" />
          <Text style={tw`text-white font-medium ml-2`}>
            Rechercher des animes
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <ScrollView
        style={tw`flex-1`}
        contentContainerStyle={tw`pb-6`}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={rafraichir}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }
      >
        <View style={tw`bg-white m-4 p-4 rounded-lg shadow-sm`}>
          <Text style={tw`text-lg font-bold text-gray-800 mb-2`}>
            Ma Collection
          </Text>
          <Text style={tw`text-gray-600`}>
            {collection.length} anime{collection.length > 1 ? 's' : ''} dans votre collection
          </Text>
        </View>

        <View style={tw`px-4`}>
          {collection.map((anime) => (
            <AnimeCollectionCard
              key={anime.id}
              anime={anime}
              onPress={() => handleVoirDetails(anime.id)}
              onDelete={() => handleSupprimerAnime(anime.id, anime.titre)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function AnimeCollectionCard({ anime, onPress, onDelete }: {
  anime: any;
  onPress: () => void;
  onDelete: () => void;
}) {
  const { nombreEpisodesVus, pourcentageProgression } = useProgressionAnime(
    anime.id, 
    anime.nombreEpisodesTotal
  );

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

  const tronquerTexte = (texte: string, longueur: number): string => {
    if (!texte) return '';
    if (texte.length <= longueur) return texte;
    return texte.substring(0, longueur) + '...';
  };

  // CORRECTION : Utiliser l'image stockée ou générer une par défaut
  const imageUrl = anime.imageUrl || getImageUrl(undefined, 'medium', anime.titre || 'Anime');

  return (
    <TouchableOpacity 
      style={tw`bg-white rounded-lg shadow-sm mb-4 overflow-hidden`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={tw`flex-row`}>
        <View style={tw`w-20 h-28`}>
          <Image
            source={{ uri: imageUrl }}
            style={tw`w-full h-full`}
            resizeMode="cover"
          />
        </View>

        <View style={tw`flex-1 p-3`}>
          <Text style={tw`text-lg font-bold text-gray-800 mb-1`} numberOfLines={2}>
            {anime.titre || 'Titre inconnu'}
          </Text>

          <View style={tw`flex-row items-center mb-2`}>
            {anime.noteApi && (
              <View style={tw`flex-row items-center mr-3`}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={tw`text-gray-600 text-xs ml-1`}>
                  {formaterNote(anime.noteApi)}
                </Text>
              </View>
            )}
            <Text style={tw`text-gray-500 text-xs`}>
              Ajouté le {formaterDate(anime.dateAjout)}
            </Text>
          </View>

          {anime.synopsis && (
            <Text style={tw`text-gray-600 text-sm mb-3`} numberOfLines={2}>
              {tronquerTexte(anime.synopsis, 80)}
            </Text>
          )}

          <ProgressBar
            episodesVus={nombreEpisodesVus}
            episodesTotal={anime.nombreEpisodesTotal || 0}
            height="small"
            color="blue"
          />
        </View>

        <View style={tw`justify-start items-end p-2`}>
          <TouchableOpacity
            style={tw`p-2`}
            onPress={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}