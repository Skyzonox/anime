// components/ProgressBar.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import tw from 'twrnc';

interface ProgressBarProps {
  episodesVus: number;
  episodesTotal: number;
  showText?: boolean;
  height?: 'small' | 'medium' | 'large';
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

export default function ProgressBar({ 
  episodesVus, 
  episodesTotal, 
  showText = true,
  height = 'medium',
  color = 'blue'
}: ProgressBarProps) {
  
  const pourcentage = episodesTotal > 0 ? (episodesVus / episodesTotal) * 100 : 0;
  const pourcentageArrondi = Math.min(Math.round(pourcentage), 100);
  const estTermine = episodesVus >= episodesTotal && episodesTotal > 0;
  
  const hauteurStyles = {
    small: 'h-1',
    medium: 'h-2',
    large: 'h-3'
  };
  
  const couleurStyles = {
    blue: {
      bg: 'bg-blue-200',
      fill: 'bg-blue-500',
      text: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-200',
      fill: 'bg-green-500',
      text: 'text-green-600'
    },
    purple: {
      bg: 'bg-purple-200',
      fill: 'bg-purple-500',
      text: 'text-purple-600'
    },
    orange: {
      bg: 'bg-orange-200',
      fill: 'bg-orange-500',
      text: 'text-orange-600'
    }
  };

  const couleur = couleurStyles[color];
  const hauteur = hauteurStyles[height];

  return (
    <View style={tw`w-full`}>
      {showText && (
        <View style={tw`flex-row items-center justify-between mb-1`}>
          <Text style={tw`text-sm ${couleur.text} font-medium`}>
            {episodesVus} / {episodesTotal || '?'} épisodes
          </Text>
          
          <View style={tw`flex-row items-center`}>
            {estTermine && (
              <View style={tw`flex-row items-center mr-2`}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={tw`text-green-600 text-xs font-medium ml-1`}>
                  Terminé
                </Text>
              </View>
            )}
            
            <Text style={tw`text-xs ${couleur.text} font-bold`}>
              {pourcentageArrondi}%
            </Text>
          </View>
        </View>
      )}
      
      <View style={tw`w-full ${hauteur} ${couleur.bg} rounded-full overflow-hidden`}>
        <View 
          style={[
            tw`${hauteur} ${couleur.fill} rounded-full transition-all duration-300`,
            { width: `${pourcentageArrondi}%` }
          ]}
        />
      </View>
      
      {estTermine && (
        <View style={tw`flex-row items-center justify-center mt-1`}>
          <View style={tw`bg-green-100 px-2 py-1 rounded-full flex-row items-center`}>
            <Ionicons name="trophy" size={12} color="#10B981" />
            <Text style={tw`text-green-700 text-xs font-medium ml-1`}>
              Série terminée !
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}