import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import Top10PodiumCard from '../components/Top10PodiumCard';
import Top10ListRow from '../components/Top10ListRow';
import { CustomHeader } from '../components/CustomHeader';
import { useFeedback } from '../context/FeedbackContext';

// Función para ignorar tildes y mayúsculas en las búsquedas, igual que en el Grid
const normalizeText = (text: string) => {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

export default function Top10Screen() {
  const { showError, showInfo, showConfirm } = useFeedback();
  const [raceData, setRaceData] = useState<any>(null);

  const [guessedIds, setGuessedIds] = useState<string[]>([]);
  const [givenUpIds, setGivenUpIds] = useState<string[]>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  const [isLoading, setIsLoading] = useState(true);

  const [inputText, setInputText] = useState('');
  const [allRiders, setAllRiders] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    fetchNewGame();
    fetchAllRiders();
  }, []);

  const fetchAllRiders = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/riders`);
      const data = await response.json();
      setAllRiders(data);
    } catch (error) {
      console.error("Error cargando pilotos:", error);
    }
  };

  const fetchNewGame = async () => {
    setIsLoading(true);
    setGameStatus('playing');
    setGuessedIds([]);
    setGivenUpIds([]);
    setInputText('');
    setSuggestions([]);

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/daily/top10/random`);
      const data = await response.json();

      if (data.error) {
        showError('Error', data.error);
        return;
      }
      setRaceData(data);
    } catch (error) {
      showError('Error', 'Fallo de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  // Buscador actualizado para usar la misma lógica de texto normalizado
  const handleSearch = (text: string) => {
    setInputText(text);
    if (text.length > 0) {
      const searchNormalized = normalizeText(text);
      const filtered = allRiders.filter(rider => {
        const riderNameNormalized = normalizeText(rider.name);
        return riderNameNormalized.includes(searchNormalized);
      });
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectRider = (rider: any) => {
    if (!raceData) return;

    const riderIdStr = rider.id.toString();
    const isValidGuess = raceData.results.some((r: any) => r.id === rider.id.toString());

    if (isValidGuess) {
      if (!guessedIds.includes(riderIdStr)) {
        const newGuessedIds = [...guessedIds, riderIdStr];
        setGuessedIds(newGuessedIds);

        //Comprobamos si con este acierto ya hemos adivinado los 10
        if (newGuessedIds.length === raceData.results.length) {
          setGameStatus('won');
        }
      } else {
        showInfo('Aviso', '¡Ya has adivinado a este piloto!');
      }
    } else {
      showError('Fallo', 'Ese piloto no terminó en el Top 10.');
    }

    setInputText('');
    setSuggestions([]);
  };

  const handleGiveUp = () => {
    if (!raceData) return;

    showConfirm(
      '¿Te rindes?',
      'Se desvelará todo el Top 10 de esta carrera. ¿Estás seguro de que quieres abandonar?',
      () => {
        const allIds = raceData.results.map((r: any) => r.id.toString());
        const unsolvedIds = allIds.filter((id: string) => !guessedIds.includes(id));

        setGivenUpIds(unsolvedIds);
        setInputText('');
        setSuggestions([]);
        setGameStatus('lost');
      },
      'Sí, me rindo',
      'Seguir jugando'
    );
  };

  if (isLoading || !raceData) {
    return <View style={styles.loadingCenter}><ActivityIndicator size="large" color="#e10600" /></View>;
  }

  const pos1 = raceData.results[0];
  const pos2 = raceData.results[1];
  const pos3 = raceData.results[2];
  const restOfList = raceData.results.slice(3);

  // Variable para controlar si la lista está abierta y cambiar la forma del input
  const isListOpen = suggestions.length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <CustomHeader />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerContainer}>
          <Text style={styles.title}>MOTO TOP 10</Text>

          <TouchableOpacity style={styles.refreshButton} onPress={fetchNewGame}>
            <Text style={styles.refreshButtonText}>🔄 Nuevo Top 10 Aleatorio</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.raceBadge}>
          <Text style={styles.raceBadgeText}>{raceData.year} {raceData.circuitName}</Text>
        </View>

        <View style={styles.podiumContainer}>
          {/* CAMBIO 5: Pasamos isGuessed e isGivenUp a las tarjetas del podio */}
          <Top10PodiumCard
            {...pos2}
            isGuessed={guessedIds.includes(pos2.id.toString())}
            isGivenUp={givenUpIds.includes(pos2.id.toString())}
          />
          <Top10PodiumCard
            {...pos1}
            isGuessed={guessedIds.includes(pos1.id.toString())}
            isGivenUp={givenUpIds.includes(pos1.id.toString())}
            isFirst
          />
          <Top10PodiumCard
            {...pos3}
            isGuessed={guessedIds.includes(pos3.id.toString())}
            isGivenUp={givenUpIds.includes(pos3.id.toString())}
          />
        </View>

        <View style={styles.listContainer}>
          {restOfList.map((rider: any) => (
            //Pasamos isGuessed e isGivenUp a las filas de la lista
            <Top10ListRow
              key={rider.position}
              {...rider}
              isGuessed={guessedIds.includes(rider.id.toString())}
              isGivenUp={givenUpIds.includes(rider.id.toString())}
            />
          ))}
        </View>

        {gameStatus !== 'playing' && (
          <View style={styles.resultContainer}>
            <Text style={[
              styles.resultPrimaryText,
              gameStatus === 'won' ? styles.textWon : styles.textLost
            ]}>
              {gameStatus === 'won' ? '¡Enhorabuena, has completado el Top 10!' : 'Has perdido. Suerte la próxima vez.'}
            </Text>
          </View>
        )}

        {gameStatus === 'playing' && (
          <>
            <View style={styles.searchSectionWrapper}>
              <View style={styles.searchContainer}>
                <TextInput
                  style={[
                    styles.input,
                    isListOpen && styles.inputWithSuggestions
                  ]}
                  placeholder="Busca un piloto..."
                  placeholderTextColor="#888"
                  value={inputText}
                  onChangeText={handleSearch}
                  selectionColor="#E10600"
                />

                {isListOpen && (
                  <View style={styles.suggestionsList}>
                    <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 180 }}>
                      {suggestions.map((rider) => (
                        <TouchableOpacity
                          key={rider.id}
                          style={styles.suggestionItem}
                          onPress={() => handleSelectRider(rider)}
                        >
                          <Text style={styles.suggestionText}>{rider.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.controlsContainer}>
              <TouchableOpacity style={styles.giveUpBtn} onPress={handleGiveUp}>
                <Text style={styles.giveUpText}>Give up</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#15151A' },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#15151A' },
  scrollContent: { padding: 16, paddingTop: 40, alignItems: 'center', paddingBottom: 60 },

  headerContainer: { alignItems: 'center', marginBottom: 20 },
  title: { color: '#FFF', fontSize: 24, fontWeight: 'bold', letterSpacing: 2 },

  refreshButton: {
    marginTop: 10,
    backgroundColor: '#1E1E26',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3F3F4E',
  },
  refreshButtonText: { color: '#e10600', fontWeight: 'bold', fontSize: 14 },
  raceBadge: { backgroundColor: '#4DD0E1', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, marginBottom: 30 },
  raceBadgeText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  podiumContainer: { flexDirection: 'row', width: '100%', maxWidth: 400, alignItems: 'flex-end', marginBottom: 20, paddingHorizontal: 10 },
  listContainer: { width: '100%', maxWidth: 400, marginBottom: 10 },

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
    color: '#538d4e', // Verde
  },
  textLost: {
    color: '#E10600', // Rojo
  },
  // ESTILOS NUEVOS DEL BUSCADOR
  searchSectionWrapper: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center',
    zIndex: 10,
    width: '100%',
  },
  searchContainer: {
    maxWidth: 320,
    width: '100%',
    position: 'relative',
    zIndex: 10,
  },
  input: {
    height: 50,
    backgroundColor: '#2A2A35',
    borderWidth: 1,
    borderColor: '#FFF',
    color: '#FFF',
    paddingHorizontal: 20,
    borderRadius: 25,
    fontSize: 16,
    zIndex: 2,
  },
  inputWithSuggestions: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
  },
  suggestionsList: {
    backgroundColor: '#1E1E26',
    borderWidth: 1,
    borderColor: '#FFF',
    borderTopWidth: 0,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    paddingTop: 10,
    paddingBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 1,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#3F3F4E',
  },
  suggestionText: {
    color: '#FFF',
    fontSize: 15,
  },

  controlsContainer: { width: '100%', maxWidth: 400, alignItems: 'center', zIndex: 1 },
  giveUpBtn: { borderColor: '#e10600', borderWidth: 1, paddingVertical: 10, paddingHorizontal: 24, borderRadius: 20 },
  giveUpText: { color: '#e10600', fontWeight: 'bold', fontSize: 16 },
});
