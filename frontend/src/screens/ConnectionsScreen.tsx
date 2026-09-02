import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, ActivityIndicator, useWindowDimensions } from 'react-native';
import PilotCard from '../components/PilotCard';
import SolvedCategory from '../components/SolvedCategory';
import GameControls from '../components/GameControls';
import { CustomHeader } from '../components/CustomHeader';
import { useFeedback } from '../context/FeedbackContext';

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
  //Cogemos las funciones del modal que vamos a usar
  const { showError, showSuccess, showInfo, showConfirm } = useFeedback();
  const [allPilots, setAllPilots] = useState<Pilot[]>([]);
  const [gridItems, setGridItems] = useState<Pilot[]>([]);
  const [categoriesInfo, setCategoriesInfo] = useState<Record<string, CategoryInfo>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [solvedCategories, setSolvedCategories] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [revealedByGiveUp, setRevealedByGiveUp] = useState<string[]>([]);

  const { width } = useWindowDimensions();
  const isSmall = width < 600;

  const fetchNewGame = async () => {
    setGameStatus('playing');
    setRevealedByGiveUp([]);
    setIsLoading(true);
    setSelectedIds([]);
    setSolvedCategories([]);

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/daily/connections/random`);
      const data = await response.json();

      if (data.error) {
        showError('Error del servidor', data.error);
        return;
      }

      setAllPilots(data.pilots);
      setGridItems(data.pilots);
      setCategoriesInfo(data.categoriesInfo);
    } catch (error) {
      showError('Error de red', 'No se ha podido conectar con el backend.');
    } finally {
      setIsLoading(false);
    }
  };

  //Pedimos un juego nuevo nada más entrar a la pantalla
  useEffect(() => {
    fetchNewGame();
  }, []);

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
      showInfo('¡Aviso!', 'Debes seleccionar exactamente 4 pilotos para comprobar.');
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
      const newSolved = [...solvedCategories, winningCategory];
      setSolvedCategories(newSolved);
      setSelectedIds([]);
      setGridItems(gridItems.filter(item => item.category !== winningCategory));

      if (newSolved.length === Object.keys(categoriesInfo).length) {
        setGameStatus('won');
      } else {
        showSuccess('¡CORRECTO!', `Has encontrado el grupo: ${winningCategory}`);
      }
      //Si son 3 avisamos al usuario
    } else if (maxMatches === 3) {
      showInfo('¡Casi!', '3 pilotos están bien. ¡Te falta uno para completar el grupo!');

    } else {
      showError('¡Fallo!', 'Esos pilotos no forman un grupo correcto. Prueba otra combinación.');
    }
  };

  const handleClear = () => {
    setSelectedIds([]);
  };

  const handleGiveUp = () => {
    showConfirm(
      '¿Te rindes?',
      'Si te rindes, desvelaremos todas las soluciones. ¿Estás seguro?',
      //Esta es la función () => void que solo se ejecuta si el usuario pulsa Confirmar
      () => {
        const allCategoriesKeys = Object.keys(categoriesInfo);
        const unsolved = allCategoriesKeys.filter(c => !solvedCategories.includes(c));
        setRevealedByGiveUp(unsolved);
        setSolvedCategories([...solvedCategories, ...unsolved]);
        setGridItems([]);
        setSelectedIds([]);
        setGameStatus('lost');
      },
      'Sí, me rindo',
      'Seguir jugando'
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
          <View style={styles.boardWrapper}>

            {/* BLOQUE DE CATEGORÍAS RESUELTAS */}
            <View style={styles.solvedContainer}>
              {solvedCategories.map((category) => {
                const info = categoriesInfo[category];
                const categoryPilots = allPilots.filter(p => p.category === category);
                //Si es móvil extraemos el apellido del piloto solo
                const pilotsText = categoryPilots.map(p => {
                  if (!isSmall) return p.name;
                  const parts = p.name.trim().split(' ');
                  return parts.length > 1 ? parts[parts.length - 1] : p.name;
                }).join(', ');
                //Extraemos las imágenes para enviárselas al componente
                const pilotImages = categoryPilots.map(p => p.imageUrl);

                const isRevealed = revealedByGiveUp.includes(category);
                const finalBoxColor = isRevealed ? '#E10600' : (info?.color || '#555');

                return (
                  <SolvedCategory
                    key={category}
                    title={category}
                    pilotsText={pilotsText}
                    isRevealed={isRevealed}
                    pilotImages={pilotImages}
                  />
                );
              })}
            </View>

            {gameStatus === 'playing' && (
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
            )}

          </View>
        )}

        {!isLoading && gameStatus !== 'playing' && (
          <View style={styles.resultContainer}>
            <Text style={[
              styles.resultPrimaryText, 
              gameStatus === 'won' ? styles.textWon : styles.textLost
            ]}>
              {gameStatus === 'won' ? '¡Enhorabuena, has completado las conexiones!' : 'Has perdido. Suerte la próxima vez.'}
            </Text>
          </View>
        )}

        {/* CAMBIO 9: Condicionamos los botones para que desaparezcan si gameStatus ya no es 'playing' */}
        {!isLoading && gameStatus === 'playing' && (
          <View style={styles.controlsWrapper}>
            <GameControls
              onSubmit={handleSubmit}
              onClear={handleClear}
              onGiveUp={handleGiveUp}
            />
          </View>
        )}
      </ScrollView>
    </View>
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
  resultContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  resultPrimaryText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textWon: {
    color: '#538d4e', 
  },
  textLost: {
    color: '#E10600', 
  },
  controlsWrapper: {
    marginTop: 40,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  }
});