// components/LoadingComponent.tsx
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import tw from 'twrnc';

interface LoadingComponentProps {
  message?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

export default function LoadingComponent({ 
  message = 'Chargement...', 
  size = 'large',
  fullScreen = false 
}: LoadingComponentProps) {
  
  const containerStyle = fullScreen 
    ? tw`flex-1 justify-center items-center bg-white`
    : tw`justify-center items-center py-8`;

  return (
    <View style={containerStyle}>
      <ActivityIndicator size={size} color="#3B82F6" />
      <Text style={tw`text-gray-600 mt-2 text-center`}>
        {message}
      </Text>
    </View>
  );
}