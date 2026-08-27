import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native';

interface PilotCardProps {
  name: string;
  isSelected: boolean;
  onPress: () => void;
  imageUrl?: string;
}

export default function PilotCard({ name, isSelected, onPress, imageUrl }: PilotCardProps) {
  const defaultImage = 'https://via.placeholder.com/150/3F3F4E/FFFFFF?text=MOTO';

  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: imageUrl || defaultImage }} 
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      <Text style={[styles.name, isSelected && styles.nameSelected]} numberOfLines={1}>
        {name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '23%', 
    aspectRatio: 0.85, 
    backgroundColor: '#2A2A35',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    backgroundColor: '#4A4A5A',
    borderColor: '#FFF',
  },

  imageContainer: {
    width: '90%',
    aspectRatio: 1, 
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#3F3F4E',
  },
  
  image: {
    width: '100%',
    height: '100%',
  },

  name: {
    color: '#FFF',
    fontSize: 9.5,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
  },
  nameSelected: {
    color: '#FFF',
  },
});