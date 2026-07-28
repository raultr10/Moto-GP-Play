import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import PilotCard from '../components/PilotCard';
import SolvedCategory from '../components/SolvedCategory';
import GameControls from '../components/GameControls';

interface Pilot {
  id: string;
  name: string;
  category: string;
  imageUrl?: string;
}

interface CategoryInfo {
  color: string;
  desc: string;
}

export default function ConnectionsScreen() {
  const [allPilots, setAllPilots] = useState<Pilot[]>([]);
  const [gridItems, setGridItems] = useState<Pilot[]>([]);
  const [categoriesInfo, setCategoriesInfo] = useState<Record<string, CategoryInfo>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [solvedCategories, setSolvedCategories] = useState<string[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);

  const fetchNewGame = async () => {
    setIsLoading(true);
    setSelectedIds([]);
    setSolvedCategories([]);
    
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/daily/connections/random`);
      const data = await response.json();
      
      if (data.error) {
        showCustomAlert('Error del servidor', data.error);
        return;
      }

      setAllPilots(data.pilots);
      setGridItems(data.pilots);
      setCategoriesInfo(data.categoriesInfo);
    } catch (error) {
      showCustomAlert('Error de red', 'No se ha podido conectar con el backend.');
    } finally {
      setIsLoading(false);
    }
  };

  //Pedimos un juego nuevo nada más entrar a la pantalla
  useEffect(() => {
    fetchNewGame();
  }, []);

  const showCustomAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      if (selectedIds.length < 4) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  //Aviso de que hay que seleccionar 4 pilotos
  const handleSubmit = () => {
    if (selectedIds.length !== 4) {
      showCustomAlert('¡Aviso!', 'Debes seleccionar exactamente 4 pilotos para comprobar.');
      return;
    }

    const selectedPilots = allPilots.filter(p => selectedIds.includes(p.id));
    
    //Contamos cuántos pilotos hay de cada categoría entre los 4 elegidos
    const categoryCounts: Record<string, number> = {};
    selectedPilots.forEach(p => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    });

    //Contamos las coincidencias de los pilotos seleccionados
    const maxMatches = Math.max(...Object.values(categoryCounts));

    //Si son 4 es correcto
    if (maxMatches === 4) {
      const winningCategory = selectedPilots[0].category;
      setSolvedCategories([...solvedCategories, winningCategory]);
      setSelectedIds([]);
      setGridItems(gridItems.filter(item => item.category !== winningCategory));
      
      //Si son 3 avisamos al usuario
    } else if (maxMatches === 3) {
      showCustomAlert('¡Casi!', '3 pilotos están bien. ¡Te falta uno para completar el grupo!');
      
    } else {
      showCustomAlert('¡Fallo!', 'Esos pilotos no forman un grupo correcto. Prueba otra combinación.');
    }
  };
  
  const handleClear = () => {
    setSelectedIds([]);
  };

  const handleGiveUp = () => {
    const allCategoriesKeys = Object.keys(categoriesInfo);
    setSolvedCategories(allCategoriesKeys);
    setGridItems([]);
    setSelectedIds([]);
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>MOTO CONNECTIONS</Text>

      {/*Botón para pedir un tablero nuevo al servidor*/}
      <TouchableOpacity style={styles.btnRandom} onPress={fetchNewGame} disabled={isLoading}>
        <Text style={styles.btnRandomText}>
          {isLoading ? 'Cargando...' : '🔄 Nuevo Connections Aleatorio'}
        </Text>
      </TouchableOpacity>

      {/* Si está cargando, mostramos la ruleta. Si no, mostramos el tablero */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E91E63" />
        </View>
      ) : (
        <View style={[styles.boardWrapper, styles.boardWrapperFlex]}>
          
          {/* BLOQUE DE CATEGORÍAS RESUELTAS */}
          <View style={styles.solvedContainer}>
            {solvedCategories.map((category) => {
              const info = categoriesInfo[category];
              // Buscamos en allPilots para que no se pierdan los nombres al resolver
              const pilotsText = allPilots.filter(p => p.category === category).map(p => p.name).join(', ');
              
              return (
                <SolvedCategory 
                  key={category} 
                  title={category} 
                  pilotsText={pilotsText} 
                  color={info?.color || '#555'} 
                />
              );
            })}
          </View>

          {/* GRID DE PILOTOS RESTANTES */}
          <View style={styles.gridContainer}>
            {gridItems.map((item) => (
              <PilotCard 
                key={item.id}
                name={item.name}
                imageUrl={item.imageUrl}
                isSelected={selectedIds.includes(item.id)}
                onPress={() => toggleSelection(item.id)}
              />
            ))}
          </View>

        </View>
      )}

      {/* CONTROLES INFERIORES */}
      {!isLoading && (
        <View style={styles.controlsWrapper}>
          <GameControls 
            onSubmit={handleSubmit}
            onClear={handleClear}
            onGiveUp={handleGiveUp}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  contentContainer: {
    flexGrow: 1,
    padding: 16,
    paddingTop: 50,
    alignItems: 'center', 
  },
  title: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  
  btnRandom: {
    backgroundColor: '#2A2A35',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4DD0E1',
    marginBottom: 20,
  },
  btnRandomText: {
    color: '#4DD0E1',
    fontWeight: 'bold',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  boardWrapper: {
    width: '100%',
    maxWidth: 500, 
  },
  boardWrapperFlex: {
    flex: 1, 
  },
  solvedContainer: {
    marginBottom: 16,
    gap: 8, 
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  controlsWrapper: {
    marginTop: 40,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  }
});