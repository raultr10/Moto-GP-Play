import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Image } from 'react-native';

interface GridCellProps {
  type: 'empty' | 'header' | 'cell';
  label?: string;      
  isSelected?: boolean; 
  onPress?: () => void;
  imageUrl?: string;
}

export const GridCell = ({ type, label, isSelected, onPress, imageUrl }: GridCellProps) => {
  if (type === 'empty') {
    return (
      <View style={[styles.box, styles.emptyBox]}>
        <Text style={styles.logoText}>GRID</Text>
      </View>
    );
  }

  if (type === 'header') {
    return (
      <View style={[styles.box, styles.headerBox]}>
        <Text style={styles.headerText}>{label}</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity 
      style={[styles.box, styles.cellBox, isSelected && styles.selectedBox]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {label ? (
        <>
          <Image 
            source={{ uri: imageUrl || 'https://via.placeholder.com/150/3F3F4E/FFFFFF?text=MOTO' }} 
            style={styles.image}
            resizeMode="cover"
          />
          <Text style={styles.cellTextAnswer} numberOfLines={1}>
            {label}
          </Text>
        </>
      ) : (
        null 
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  box: {
    width: '23%', 
    aspectRatio: 1,
    margin: '1%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    padding: 4,
  },
  emptyBox: {
    backgroundColor: '#15151A',
    borderWidth: 1,
    borderColor: '#3F3F4E',
  },
  logoText: { color: '#E10600', fontWeight: 'bold', fontSize: 16, fontStyle: 'italic' },
  
  headerBox: {
    backgroundColor: '#2A2A35',
    borderWidth: 1,
    borderColor: '#3F3F4E',
  },
  headerText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 11, textAlign: 'center' },
  
  cellBox: {
    backgroundColor: '#1E1E26',
    borderWidth: 1,
    borderColor: '#3F3F4E',
  },
  selectedBox: {
    borderColor: '#E10600',
    borderWidth: 2,
    backgroundColor: '#2D1E20',
  },
  image: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginBottom: 4,
    backgroundColor: '#3F3F4E',
  },
  cellTextAnswer: { 
    color: '#FFF', 
    fontSize: 10, 
    fontWeight: 'bold', 
    textAlign: 'center' 
  },
});