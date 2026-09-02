import React from 'react';
import { View, Text, StyleSheet, Image, useWindowDimensions } from 'react-native';

interface SolvedCategoryProps {
  title: string;
  pilotsText: string;
  isRevealed?: boolean;
  pilotImages?: (string | undefined)[];
}

export default function SolvedCategory({ title, pilotsText, isRevealed, pilotImages }: SolvedCategoryProps) {

  const { width } = useWindowDimensions();
  const isSmall = width < 600;

  return (
    <View style={[
      styles.container, 
      isRevealed ? styles.containerLost : styles.containerWon
    ]}>
      {/* GRUPO IZQUIERDO */}
      <View style={styles.imageGroupLeft}>
        {pilotImages && pilotImages[0] && (
          <Image 
            source={{ uri: pilotImages[0] }} 
            style={[styles.pilotImg, isSmall && styles.pilotImgSmall, { zIndex: 1 }]} 
            resizeMode="contain" 
          />
        )}
        {pilotImages && pilotImages[1] && (
          <Image 
            source={{ uri: pilotImages[1] }} 
            style={[
              styles.pilotImg, 
              isSmall && styles.pilotImgSmall, 
              styles.overlapLeft, 
              isSmall && styles.overlapSmall, 
              { zIndex: 2 }
            ]} 
            resizeMode="contain" 
          />
        )}
      </View>
      {/* TEXTO CENTRAL */}
      <View style={[styles.textContainer, isSmall && styles.textContainerSmall]}>
        <Text style={[styles.title, isSmall && styles.titleSmall]}>{title}</Text>
        <Text style={[styles.pilots, isSmall && styles.pilotsSmall]}>{pilotsText}</Text>
      </View>
      {/*GRUPO DERECHO: Piloto 3 y Piloto 4 */}
      <View style={styles.imageGroupRight}>
        {pilotImages && pilotImages[2] && (
          <Image 
            source={{ uri: pilotImages[2] }} 
            style={[styles.pilotImg, isSmall && styles.pilotImgSmall, { zIndex: 2 }]} 
            resizeMode="contain" 
          />
        )}
        {pilotImages && pilotImages[3] && (
          <Image 
            source={{ uri: pilotImages[3] }} 
            style={[
              styles.pilotImg, 
              isSmall && styles.pilotImgSmall, 
              styles.overlapRight, 
              isSmall && styles.overlapSmall, 
              { zIndex: 1 }
            ]} 
            resizeMode="contain" 
          />
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
  containerWon: {
    backgroundColor: '#538d4e',
  },
  containerLost: {
    backgroundColor: '#E10600',
  },
  textContainer: {
    zIndex: 10,
    alignItems: 'center',
    paddingHorizontal: 110, 
  },
  textContainerSmall: {
    paddingHorizontal: 95,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFF',
    textAlign: 'center',
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  titleSmall: {
    fontSize: 12,
    lineHeight: 14,
  },
  pilots: {
    fontSize: 13,
    color: '#FFF',
    marginTop: 2,
    fontWeight: '500',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  pilotsSmall: {
    fontSize: 11,
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
  pilotImgSmall: {
    width: 50,
    height: 60,
  },
  overlapLeft: {
    marginLeft: -20,
  },
  overlapRight: {
    marginLeft: -20,
  },
  overlapSmall: {
    marginLeft: -15,
  }
});