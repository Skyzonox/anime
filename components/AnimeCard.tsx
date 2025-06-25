// components/AnimeCard.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import { KitsuAnime, getBestTitle, getImageUrl } from '../services/apiService';

interface AnimeCardProps {
  anime: KitsuAnime;
  onPress: () => void;
  onAddToCollection?: () => void;
  onAddToWatchlist?: () => void;
  isInCollection?: boolean;
  isInWatchlist?: boolean;
  showActions?: boolean;
}

export default function AnimeCard({ 
  anime, 
  onPress, 
  onAddToCollection,
  onAddToWatchlist,
  isInCollection = false,
  isInWatchlist = false,
  showActions = true
}: AnimeCardProps) {
  
  const titre = getBestTitle(anime.attributes.titles, anime.attributes.canonicalTitle);
  const imageUrl = getImageUrl(anime.attributes.posterImage, 'medium');
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
      style={[tw`bg-white rounded-lg shadow-md mb-4 mx-2`, styles.carte]}
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

          {showActions && (
            <View style={tw`flex-row justify-end`}>
              {!isInCollection && onAddToCollection && (
                <TouchableOpacity
                  style={tw`bg-green-500 px-3 py-2 rounded mr-2 flex-row items-center`}
                  onPress={onAddToCollection}
                >
                  <Ionicons name="add" size={16} color="white" />
                  <Text style={tw`text-white text-xs ml-1`}>Collection</Text>
                </TouchableOpacity>
              )}

              {!isInWatchlist && onAddToWatchlist && (
                <TouchableOpacity
                  style={tw`bg-orange-500 px-3 py-2 rounded flex-row items-center`}
                  onPress={onAddToWatchlist}
                >
                  <Ionicons name="bookmark" size={16} color="white" />
                  <Text style={tw`text-white text-xs ml-1`}>À voir</Text>
                </TouchableOpacity>
              )}

              {isInCollection && (
                <View style={tw`bg-green-100 px-3 py-2 rounded flex-row items-center`}>
                  <Ionicons name="checkmark" size={16} color="#10B981" />
                  <Text style={tw`text-green-800 text-xs ml-1`}>Dans ma collection</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  carte: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});