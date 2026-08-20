import React, { useState } from 'react';
import { Pressable, Text, StyleSheet, View, Image } from 'react-native';
import { getFlag } from '../utils/flags';

export interface HeaderData {
  label: string;
  type: string;
  imageUrl?: string;
  prefix?: string;
  suffix?: string;
}

interface GridCellProps {
  type: 'empty' | 'header' | 'cell';
  label?: string;
  isSelected?: boolean;
  onPress?: () => void;
  imageUrl?: string;
  headerData?: HeaderData;
}

const getRiderFace = (label?: string) => {
  const clean = label?.trim().toUpperCase();
  switch (clean) {
    case 'COMPAÑEROS DE ROSSI':
      return require('../../assets/ValentinoRossi.png');
    case 'COMPAÑEROS DE MÁRQUEZ':
      return require('../../assets/MarcMarquez.png');
    case 'COMPAÑEROS DE LORENZO':
      return require('../../assets/JorgeLorenzo.png');
    case 'COMPAÑEROS DE PEDROSA':
      return require('../../assets/DaniPedrosa.png');
    default:
      return null;
  }
};

const getDynamicIcon = (prefix?: string) => {
  const cleanPrefix = prefix?.trim().toUpperCase() || '';
  switch (cleanPrefix) {
    case 'VICTORIA':
    case 'CAMPEÓN':
      return require('../../assets/copa.png');
    case 'PODIO':
      return require('../../assets/podio.png');
    case 'POLE':
    case 'VUELTA RÁPIDA':
      return require('../../assets/cronometro.png');
    case 'SPRINT':
    case 'GANADOR SPRINT':
      return require('../../assets/medalla.png');
    default:
      return null;
  }
};

export const GridCell = ({ type, label, isSelected, onPress, imageUrl, headerData }: GridCellProps) => {
  const [showName, setShowName] = useState(false);

  const cleanLabel = label?.trim().toUpperCase() || '';
  const isSpecificChamp = cleanLabel.startsWith('CAMPEÓN ') && cleanLabel !== 'CAMPEÓN';
  //Esto se quedará como "MOTO2" o "MOTO3"
  const champCategory = cleanLabel.replace('CAMPEÓN ', '');
  
  const dynamicSuffix = headerData?.suffix?.trim() || '';
  const isYear = dynamicSuffix.length > 0 && !isNaN(Number(dynamicSuffix));

  const isTop10 = headerData?.prefix?.trim().toUpperCase() === 'TOP 10';

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
        
        {/* -- BLOQUE DE ARRIBA (FOTOS E ICONOS) -- */}
        <View style={styles.headerMainContent}>
          
          {headerData?.type === 'TEAM' && (
            headerData.imageUrl ? (
              <Image
                source={{ uri: headerData.imageUrl }}
                style={styles.teamLogo}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.staticMainText} numberOfLines={2}>{label}</Text>
            )
          )}

          {headerData?.type === 'COUNTRY' && (
            <Image
              source={getFlag(label || '')}
              style={styles.flagImageLarge}
              resizeMode="cover"
            />
          )}

          {headerData?.type === 'DYNAMIC' && (
            isYear ? (
              isTop10 ? (
                <View style={styles.champComposite}>
                  <Text style={styles.top10Title}>TOP 10</Text>
                  <Text style={styles.champCompositeText}>{dynamicSuffix}</Text>
                </View>
              ) :
              <View style={styles.champComposite}>
                {getDynamicIcon(headerData.prefix) && (
                  <Image
                    source={getDynamicIcon(headerData.prefix)}
                    style={styles.champCompositeIcon}
                    resizeMode="contain"
                  />
                )}
                <Text style={styles.champCompositeText}>{dynamicSuffix}</Text>
              </View>
            ) : (
              <View style={styles.dynamicRow}>
                <Image
                  source={getFlag(dynamicSuffix)}
                  style={styles.dynamicFlag}
                  resizeMode="cover"
                />
                {getDynamicIcon(headerData.prefix) && (
                  <Image
                    source={getDynamicIcon(headerData.prefix)}
                    style={styles.dynamicIcon}
                    resizeMode="contain"
                  />
                )}
              </View>
            )
          )}

          {(headerData?.type === 'STATIC' || headerData?.type === 'UNKNOWN' || !headerData?.type) && (
            <View style={styles.staticContainer}>
              {getRiderFace(label) ? (
                <Image
                  source={getRiderFace(label)}
                  style={styles.riderFaceIcon}
                  resizeMode="cover"
                />
              ) : isSpecificChamp ? (
                <View style={styles.champComposite}>
                  <Image
                    source={require('../../assets/copa.png')}
                    style={styles.champCompositeIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.champCompositeText}>{champCategory}</Text>
                </View>
              ) : getDynamicIcon(label) ? (
                <Image
                  source={getDynamicIcon(label)}
                  style={styles.staticIconOnly}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.staticMainText} numberOfLines={2}>
                  {headerData?.prefix || label} 
                </Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.headerFooter}>
          <Text style={styles.headerFooterText} numberOfLines={2}>
            {label}
          </Text>
        </View>

      </View>
    );
  }
  return (
    <Pressable
      style={[styles.box, styles.cellBox, isSelected && styles.selectedBox]}
      onPress={onPress}
      onPressIn={() => setShowName(true)}
      onPressOut={() => setShowName(false)}
      onHoverIn={() => setShowName(true)}
      onHoverOut={() => setShowName(false)}
    >
      {label ? (
        <>
          <Image
            source={{ uri: imageUrl || 'https://via.placeholder.com/150/3F3F4E/FFFFFF?text=MOTO' }}
            style={styles.fullImage}
            resizeMode="cover"
          />
          {showName && (
            <View style={styles.nameOverlay}>
              <Text style={styles.nameOverlayText} numberOfLines={1}>
                {label}
              </Text>
            </View>
          )}
        </>
      ) : (
        null
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  box: {
    width: '23%',
    aspectRatio: 1,
    margin: '1%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  emptyBox: {
    backgroundColor: '#15151A',
    borderWidth: 1,
    borderColor: '#3F3F4E',
  },
  logoText: { color: '#E10600', fontWeight: 'bold', fontSize: 16, fontStyle: 'italic' },

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
  fullImage: {
    width: '100%',
    height: '100%',
    position: 'absolute', 
  },

  nameOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameOverlayText: {
    color: '#FFF', 
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  
  cellTextAnswer: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  flagImage: {
    width: '70%',
    height: '40%',
    borderRadius: 4,
    marginBottom: 4,
  },
  dynamicContainer: {
    width: '80%',
    height: '55%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 2,
  },
  dynamicBgFlag: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    opacity: 0.6,
    position: 'absolute',
  },
  headerTextDynamic: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 9, textAlign: 'center', marginTop: 2 },
  headerBox: {
    backgroundColor: '#2A2A35',
    borderWidth: 1,
    borderColor: '#3F3F4E',
    flexDirection: 'column',
  },
  
  headerMainContent: {
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },

  headerFooter: {
    backgroundColor: '#4A4A57',
    width: '100%',
    paddingVertical: 4,
    paddingHorizontal: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#3F3F4E',
  },
  headerFooterText: { 
    color: '#EAEAEA', 
    fontWeight: 'bold', 
    fontSize: 8, 
    textAlign: 'center' 
  },

  teamLogo: {
    width: '85%',
    height: '70%',
  },
  flagImageLarge: {
    width: '75%',
    height: '60%',
    borderRadius: 4,
  },

  staticContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  staticMainText: { 
    color: '#FFF', 
    fontWeight: '900', 
    fontSize: 11, 
    textAlign: 'center' 
  },

  staticIconOnly: {
    width: 32,
    height: 32,
  },

  dynamicRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    width: '100%',
  },
  dynamicFlag: {
    width: 32,
    height: 22,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#111', 
  },
  dynamicIcon: {
    width: 24,
    height: 24,
  },
  riderFaceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22, 
    borderWidth: 1,
    borderColor: '#4A4A57',
  },
  champComposite: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2, // Pequeña separación entre la copa y las letras
  },
  champCompositeIcon: {
    width: 26, // Un poco más pequeña para que quepa el texto debajo
    height: 26,
  },
  champCompositeText: {
    color: '#FFD700', // Un tono dorado a juego con la copa
    fontSize: 10,
    fontWeight: '900',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  top10Title: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '900',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});