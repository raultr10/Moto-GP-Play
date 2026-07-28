import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ListRowProps {
  position: number;
  country: string;
  name?: string;
  isRevealed: boolean;
}

export default function Top10ListRow({ position, country, name, isRevealed }: ListRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.leftSide}>
        <Text style={styles.positionText}>{position}</Text>
        <Text style={styles.flag}>{country.substring(0, 3).toUpperCase()}</Text>
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
  leftSide: { flexDirection: 'row', alignItems: 'center', width: 60, gap: 10 },
  positionText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', width: 20 },
  flag: { color: '#CCC', fontSize: 14, fontWeight: 'bold' },
  rightSide: { flex: 1, marginLeft: 10 },
  nameText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  hiddenLine: { height: 12, backgroundColor: '#333', borderRadius: 6, width: '80%' },
});