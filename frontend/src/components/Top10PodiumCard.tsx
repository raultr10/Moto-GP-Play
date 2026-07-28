import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface PodiumCardProps {
  position: number;
  country: string;
  name?: string;
  imageUrl?: string;
  isRevealed: boolean;
  isFirst?: boolean;
}

export default function Top10PodiumCard({ position, country, name, imageUrl, isRevealed, isFirst }: PodiumCardProps) {
  return (
    <View style={[styles.card, isFirst && styles.firstPlaceCard]}>
      <View style={styles.header}>
        <Text style={styles.positionText}>{position}</Text>
        <Text style={styles.flag}>{country.substring(0, 3).toUpperCase()}</Text>
      </View>

      {isRevealed ? (
        <View style={styles.revealedContainer}>
          {imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />}
          <Text style={styles.nameText} numberOfLines={2}>{name}</Text>
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
    padding: 8,
    zIndex: 10,
  },
  positionText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  flag: { color: '#CCC', fontSize: 14, fontWeight: 'bold' },
  revealedContainer: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 8 },
  image: { width: '100%', height: '100%', position: 'absolute', opacity: 0.8 },
  nameText: { color: '#FFF', fontSize: 12, fontWeight: 'bold', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 4, width: '100%' },
  hiddenContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  questionMark: { color: '#555', fontSize: 40, fontWeight: 'bold' },
});