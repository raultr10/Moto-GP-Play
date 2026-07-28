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
      <Image 
        source={{ uri: imageUrl || defaultImage }} 
        style={styles.image}
        resizeMode="cover"
      />
      <Text style={[styles.name, isSelected && styles.nameSelected]}>
        {name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '23%', 
    aspectRatio: 1, 
    backgroundColor: '#2A2A35',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  cardSelected: {
    backgroundColor: '#555566',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  
  image: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginBottom: 6,
    backgroundColor: '#3F3F4E',
  },
  name: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  nameSelected: {
    color: '#FFF',
  },
});