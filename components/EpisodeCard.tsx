// components/EpisodeCard.tsx - Version corrigée
import { Ionicons } from '@expo/vector-icons';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import { KitsuEpisode, getBestTitle, getImageUrl } from '../services/apiService';

interface EpisodeCardProps {
  episode: KitsuEpisode;
  onPress: () => void;
  onMarkAsWatched?: () => void;
  isWatched?: boolean;
  animeTitle?: string;
  totalEpisodes?: number;
}

export default function EpisodeCard({ 
  episode, 
  onPress, 
  onMarkAsWatched,
  isWatched = false,
  animeTitle,
  totalEpisodes
}: EpisodeCardProps) {
  
  const numeroEpisode = episode.attributes.number.toString().padStart(2, '0');
  const titre = getBestTitle(episode.attributes.titles, episode.attributes.canonicalTitle);
  const imageUrl = getImageUrl(episode.attributes.thumbnail, 'small', titre);
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
        <View style={tw`w-20 h-28 relative`}>
          <Image
            source={{ uri: imageUrl }}
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

          {animeTitle && (
            <Text style={tw`text-gray-500 text-xs mb-1`} numberOfLines={1}>
              {animeTitle}
            </Text>
          )}

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