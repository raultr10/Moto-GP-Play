import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface SolvedCategoryProps {
  title: string;
  pilotsText: string;
  color: string;
  pilotImages?: (string | undefined)[];
}

export default function SolvedCategory({ title, pilotsText, color, pilotImages }: SolvedCategoryProps) {
  return (
    <View style={[styles.container, { backgroundColor: color }]}>
      {/*GRUPO IZQUIERDO: Piloto 1 y Piloto 2 */}
      <View style={styles.imageGroupLeft}>
        {pilotImages && pilotImages[0] && (
          <Image source={{ uri: pilotImages[0] }} style={[styles.pilotImg, { zIndex: 1 }]} resizeMode="contain" />
        )}
        {pilotImages && pilotImages[1] && (
          <Image source={{ uri: pilotImages[1] }} style={[styles.pilotImg, styles.overlapLeft, { zIndex: 2 }]} resizeMode="contain" />
        )}
      </View>
      {/* TEXTO CENTRAL */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.pilots}>{pilotsText}</Text>
      </View>
      {/*GRUPO DERECHO: Piloto 3 y Piloto 4 */}
      <View style={styles.imageGroupRight}>
        {pilotImages && pilotImages[2] && (
          <Image source={{ uri: pilotImages[2] }} style={[styles.pilotImg, { zIndex: 2 }]} resizeMode="contain" />
        )}
        {pilotImages && pilotImages[3] && (
          <Image source={{ uri: pilotImages[3] }} style={[styles.pilotImg, styles.overlapRight, { zIndex: 1 }]} resizeMode="contain" />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 90,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
    position: 'relative',
    paddingVertical: 12,
  },
  textContainer: {
    zIndex: 10,
    alignItems: 'center',
    paddingHorizontal: 110, 
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#121212',
    textAlign: 'center',
    textTransform: 'uppercase', 
  },
  pilots: {
    fontSize: 13,
    color: '#121212',
    marginTop: 2,
    fontWeight: '500',
    textAlign: 'center',
  },
  
  imageGroupLeft: {
    position: 'absolute',
    left: 10,
    bottom: -5, 
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  imageGroupRight: {
    position: 'absolute',
    right: 10,
    bottom: -5,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  pilotImg: {
    width: 60,
    height: 70, 
  },
  overlapLeft: {
    marginLeft: -20,
  },
  overlapRight: {
    marginLeft: -20,
  }
});