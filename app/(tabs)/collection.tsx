// app/(tabs)/collection.tsx
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';

import ErrorComponent from '../../components/ErrorComponent';
import LoadingComponent from '../../components/LoadingComponent';
import ProgressBar from '../../components/ProgressBar';
import { useCollectionAnimes, useProgressionAnime } from '../../hooks/useDatabase';
import { formaterDate, formaterNote, tronquerTexte } from '../../utils/formatters';

export default function CollectionScreen() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Hook pour récupérer la collection
  const { 
    collection, 
    estEnChargement, 
    erreur, 
    recharger, 
    supprimerAnime 
  } = useCollectionAnimes();

  // Fonction pour rafraîchir les données
  const rafraichir = async () => {
    setIsRefreshing(true);
    await recharger();
    setIsRefreshing(false);
  };

  // Fonction pour naviguer vers les détails d'un anime de la collection
  const handleVoirDetails = (animeId: string) => {
    router.push(`/collection/${animeId}`);
  };

  // Fonction pour supprimer un anime de la collection
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

  // Affichage en cas de chargement initial
  if (estEnChargement && collection.length === 0) {
    return <LoadingComponent message="Chargement de votre collection..." fullScreen />;
  }

  // Affichage en cas d'erreur
  if (erreur && collection.length === 0) {
    return (
      <ErrorComponent 
        message={erreur} 
        onRetry={recharger}
        fullScreen 
      />
    );
  }

  // Affichage si la collection est vide
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
        {/* Statistiques de la collection */}
        <View style={tw`bg-white m-4 p-4 rounded-lg shadow-sm`}>
          <Text style={tw`text-lg font-bold text-gray-800 mb-2`}>
            Ma Collection
          </Text>
          <Text style={tw`text-gray-600`}>
            {collection.length} anime{collection.length > 1 ? 's' : ''} dans votre collection
          </Text>
        </View>

        {/* Liste des animes de la collection */}
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

// Composant pour une carte d'anime dans la collection
function AnimeCollectionCard({ anime, onPress, onDelete }: {
  anime: any;
  onPress: () => void;
  onDelete: () => void;
}) {
  const { nombreEpisodesVus, pourcentageProgression } = useProgressionAnime(
    anime.id, 
    anime.nombreEpisodesTotal
  );

  return (
    <TouchableOpacity 
      style={tw`bg-white rounded-lg shadow-sm mb-4 overflow-hidden`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={tw`flex-row`}>
        {/* Image de l'anime */}
        <View style={tw`w-20 h-28`}>
          {anime.imageUrl ? (
            <Image
              source={{ uri: anime.imageUrl }}
              style={tw`w-full h-full`}
              resizeMode="cover"
            />
          ) : (
            <View style={tw`w-full h-full bg-gray-300 justify-center items-center`}>
              <Ionicons name="image-outline" size={24} color="#6B7280" />
            </View>
          )}
        </View>

        {/* Informations de l'anime */}
        <View style={tw`flex-1 p-3`}>
          {/* Titre */}
          <Text style={tw`text-lg font-bold text-gray-800 mb-1`} numberOfLines={2}>
            {anime.titre}
          </Text>

          {/* Note et date d'ajout */}
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

          {/* Synopsis tronqué */}
          {anime.synopsis && (
            <Text style={tw`text-gray-600 text-sm mb-3`} numberOfLines={2}>
              {tronquerTexte(anime.synopsis, 80)}
            </Text>
          )}

          {/* Barre de progression */}
          <ProgressBar
            episodesVus={nombreEpisodesVus}
            episodesTotal={anime.nombreEpisodesTotal || 0}
            height="small"
            color="blue"
          />
        </View>

        {/* Bouton de suppression */}
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