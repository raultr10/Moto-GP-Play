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

const getDynamicIcon = (prefix?: string) => {
  const cleanPrefix = prefix?.trim().toUpperCase();
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
  if (type === 'empty') {
    return (
      <View style={[styles.box, styles.emptyBox]}>
        <Text style={styles.logoText}>GRID</Text>
      </View>
    );
  }

  // LÓGICA VISUAL DE LAS CABECERAS
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

          {/* 🔴 CAMBIO 2 (LADO A LADO): Adiós a la superposición. Ahora usamos 'dynamicRow' 
              para poner la bandera pequeña a la izquierda y el icono a la derecha. */}
          {headerData?.type === 'DYNAMIC' && (
            <View style={styles.dynamicRow}>
              <Image
                source={getFlag(headerData.suffix || '')}
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
          )}

          {/* 🔴 CAMBIO 3 (ESTÁTICAS EN GRANDE): Si es una estática (ej: CAMPEÓN), 
              dibujamos el texto en el centro, muy grande y en negrita. */}
          {(headerData?.type === 'STATIC' || headerData?.type === 'UNKNOWN' || !headerData?.type) && (
            <View style={styles.staticContainer}>
              {getDynamicIcon(label) ? (
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

        {/* 🔴 CAMBIO 4 (BANDA GRIS): Creamos un pie de foto (Footer) que siempre está abajo,
            con fondo gris oscuro y el texto completo en pequeño. */}
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
    position: 'absolute', // Esto hace que la imagen se ponga de fondo
  },

  nameOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.85)', // Barra negra semitransparente como en Formudle
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
  /* NUEVOS ESTILOS PARA LAS CABECERAS VISUALES */
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
    opacity: 0.6, // Hace que la bandera quede un poco atenuada de fondo
    position: 'absolute',
  },
  headerTextDynamic: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 9, textAlign: 'center', marginTop: 2 },
  headerBox: {
    backgroundColor: '#2A2A35',
    borderWidth: 1,
    borderColor: '#3F3F4E',
    flexDirection: 'column', // Divide la celda en un bloque arriba y un bloque abajo
  },
  
  headerMainContent: {
    flex: 1, // Obliga a la parte de arriba a ocupar todo el espacio que sobra
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },

  headerFooter: {
    backgroundColor: '#4A4A57', // El color de la banda gris inferior
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

  // Estilos de LADO A LADO
  dynamicRow: {
    flexDirection: 'row', // Esto es lo que pone los elementos uno a la izquierda y otro a la derecha
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6, // El espacio entre la bandera y la copa
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
});