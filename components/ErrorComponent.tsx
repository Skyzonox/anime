// components/ErrorComponent.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';

interface ErrorComponentProps {
  message?: string;
  onRetry?: () => void;
  fullScreen?: boolean;
}

export default function ErrorComponent({ 
  message = 'Une erreur est survenue', 
  onRetry,
  fullScreen = false 
}: ErrorComponentProps) {
  
  const containerStyle = fullScreen 
    ? tw`flex-1 justify-center items-center bg-white px-6`
    : tw`justify-center items-center py-8 px-6`;

  return (
    <View style={containerStyle}>
      <View style={tw`bg-red-100 rounded-full p-4 mb-4`}>
        <Ionicons name="alert-circle" size={32} color="#EF4444" />
      </View>
      
      <Text style={tw`text-gray-800 text-lg font-medium text-center mb-2`}>
        Oups !
      </Text>
      
      <Text style={tw`text-gray-600 text-center mb-6`}>
        {message}
      </Text>
      
      {onRetry && (
        <TouchableOpacity
          style={tw`bg-blue-500 px-6 py-3 rounded-lg flex-row items-center`}
          onPress={onRetry}
        >
          <Ionicons name="refresh" size={20} color="white" />
          <Text style={tw`text-white font-medium ml-2`}>
            Réessayer
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}