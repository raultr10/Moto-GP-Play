import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { getFlag } from '../utils/flags';

interface PodiumCardProps {
  position: number;
  country: string;
  name?: string;
  imageUrl?: string;
  isRevealed: boolean;
  isFirst?: boolean;
}

export default function Top10PodiumCard({ position, country, name, imageUrl, isRevealed, isFirst }: PodiumCardProps) {
  const cleanCountry = country ? country.toUpperCase().trim() : '';

  return (
    <View style={[styles.card, isFirst && styles.firstPlaceCard]}>
      <View style={styles.header}>
        <Text style={styles.positionText}>{position}</Text>
        <Image source={getFlag(cleanCountry)} style={styles.flagIcon} resizeMode="contain" />
      </View>

      {isRevealed ? (
        <View style={styles.revealedContainer}>
          {imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />}
          <View style={styles.nameContainer}>
            <Text style={styles.nameText} numberOfLines={2}>{name}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.hiddenContainer}>
          <Text style={styles.questionMark}>?</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#2A2A35',
    borderRadius: 12,
    marginHorizontal: 4,
    height: 140,
    borderWidth: 1,
    borderColor: '#444',
    overflow: 'hidden',
  },
  firstPlaceCard: {
    height: 160,
    marginTop: -20,
    borderColor: '#FFD700',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    zIndex: 10,
  },
  positionText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  flagIcon: { width: 28, height: 20, borderRadius: 2 }, 
  revealedContainer: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 8 },
  image: { width: '100%', height: '110%', position: 'absolute', opacity: 0.9, bottom: 0 },
  nameContainer: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 4,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  nameText: { color: '#FFF', fontSize: 12, fontWeight: 'bold', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 4, width: '100%' },
  hiddenContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  questionMark: { color: '#555', fontSize: 40, fontWeight: 'bold' },
});