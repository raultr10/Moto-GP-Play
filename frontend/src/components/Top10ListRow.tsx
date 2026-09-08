import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { getFlag } from '../utils/flags';

interface ListRowProps {
  position: number;
  country: string;
  name?: string;
  isGuessed?: boolean;
  isGivenUp?: boolean;
}

export default function Top10ListRow({ position, country, name, isGivenUp, isGuessed }: ListRowProps) {
  const cleanCountry = country ? country.toUpperCase().trim() : '';
  const isRevealed = isGuessed || isGivenUp;
  
  return (
    <View style={[
      styles.row,
      isGuessed && styles.rowGuessed,
      isGivenUp && styles.rowGivenUp
    ]}>
      <View style={styles.leftSide}>
        <Text style={styles.positionText}>{position}</Text>
        <Image source={getFlag(cleanCountry)} style={styles.flagIcon} resizeMode="contain" />
      </View>
      
      <View style={styles.rightSide}>
        {isRevealed ? (
          <Text style={styles.nameText}>{name}</Text>
        ) : (
          <View style={styles.hiddenLine} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: '#1E1E26',
    borderRadius: 20,
    marginVertical: 4,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  rowGuessed: {
    backgroundColor: '#538d4e',
    borderColor: '#538d4e',
  },
  rowGivenUp: {
    backgroundColor: '#E10600',
    borderColor: '#E10600',
  },
  leftSide: { flexDirection: 'row', alignItems: 'center', width: 75, gap: 10 },
  positionText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', width: 28 },
  flagIcon: { width: 26, height: 18, borderRadius: 2 }, 
  rightSide: { flex: 1, marginLeft: 10 },
  nameText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  hiddenLine: { height: 12, backgroundColor: '#333', borderRadius: 6, width: '80%' },
});