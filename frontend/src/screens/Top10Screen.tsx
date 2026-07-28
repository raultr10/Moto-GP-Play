import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity, TextInput, Platform } from 'react-native';
import Top10PodiumCard from '../components/Top10PodiumCard';
import Top10ListRow from '../components/Top10ListRow';

export default function Top10Screen() {
  const [raceData, setRaceData] = useState<any>(null);
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [inputText, setInputText] = useState('');
  const [allRiders, setAllRiders] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  //Cargamos la lista de pilotos para el buscador
  useEffect(() => {
    fetchNewGame();
    fetchAllRiders();
  }, []);

  //Función para traer todos los pilotos
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
    setRevealedIds([]);
    setInputText('');
    setSuggestions([]);

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/daily/top10/random`);
      const data = await response.json();

      if (data.error) {
        showCustomAlert('Error', data.error);
        return;
      }
      setRaceData(data);
    } catch (error) {
      showCustomAlert('Error', 'Fallo de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const showCustomAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  //Lógica del buscador
  const handleSearch = (text: string) => {
    setInputText(text);
    if (text.length > 0) {
      const filtered = allRiders.filter(rider =>
        rider.name.toLowerCase().includes(text.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  //Se ejecuta al seleccionar un piloto de la lista de sugerencias
  const handleSelectRider = (rider: any) => {
    if (!raceData) return;

    const isValidGuess = raceData.results.some((r: any) => r.id === rider.id.toString());

    if (isValidGuess) {
      if (!revealedIds.includes(rider.id.toString())) {
        setRevealedIds([...revealedIds, rider.id.toString()]);
      } else {
        showCustomAlert('Aviso', '¡Ya has adivinado a este piloto!');
      }
    } else {
      showCustomAlert('Fallo', 'Ese piloto no terminó en el Top 10.');
    }

    //Limpiamos el buscador en ambos casos
    setInputText('');
    setSuggestions([]);
  };

  //Función de rendirse y revelar el top 10 completo
  const handleGiveUp = () => {
    if (!raceData) return;
    const allIds = raceData.results.map((r: any) => r.id);
    setRevealedIds(allIds);
    setInputText('');
    setSuggestions([]);
  };

  if (isLoading || !raceData) {
    return <View style={styles.loadingCenter}><ActivityIndicator size="large" color="#e10600" /></View>;
  }

  const pos1 = raceData.results[0];
  const pos2 = raceData.results[1];
  const pos3 = raceData.results[2];
  const restOfList = raceData.results.slice(3);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >

      {/* CABECERA Y BOTÓN REFRESCAR */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>MOTO TOP 10</Text>

        <TouchableOpacity style={styles.refreshButton} onPress={fetchNewGame}>
          <Text style={styles.refreshButtonText}>🔄 Nuevo Top 10 Aleatorio</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.raceBadge}>
        <Text style={styles.raceBadgeText}>{raceData.year} {raceData.circuitName}</Text>
      </View>

      {/* PODIO */}
      <View style={styles.podiumContainer}>
        <Top10PodiumCard {...pos2} isRevealed={revealedIds.includes(pos2.id)} />
        <Top10PodiumCard {...pos1} isRevealed={revealedIds.includes(pos1.id)} isFirst />
        <Top10PodiumCard {...pos3} isRevealed={revealedIds.includes(pos3.id)} />
      </View>

      {/* LISTA DEL 4 AL 10 */}
      <View style={styles.listContainer}>
        {restOfList.map((rider: any) => (
          <Top10ListRow
            key={rider.position}
            {...rider}
            isRevealed={revealedIds.includes(rider.id)}
          />
        ))}
      </View>

      {/* ZONA DEL BUSCADOR */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Busca un piloto..."
          placeholderTextColor="#666"
          value={inputText}
          onChangeText={handleSearch}
        />

        {suggestions.length > 0 && (
          <View style={styles.suggestionsList}>
            <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 150 }}>
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

      {/* CONTROLES FINALES */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.giveUpBtn} onPress={handleGiveUp}>
          <Text style={styles.giveUpText}>Me rindo</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
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

  searchContainer: {
    marginTop: 20,
    marginBottom: 30,
    maxWidth: 350,
    alignSelf: 'center',
    width: '100%',
    zIndex: 10,
  },
  input: {
    height: 50,
    backgroundColor: '#1E1E26',
    borderWidth: 1,
    borderColor: '#3F3F4E',
    color: '#FFF',
    paddingHorizontal: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  suggestionsList: {
    backgroundColor: '#2A2A35',
    borderWidth: 1,
    borderColor: '#3F3F4E',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  suggestionItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#3F3F4E' },
  suggestionText: { color: '#FFF', fontSize: 16 },

  controlsContainer: { width: '100%', maxWidth: 400, alignItems: 'center', zIndex: 1 },
  giveUpBtn: { borderColor: '#e10600', borderWidth: 1, paddingVertical: 10, paddingHorizontal: 24, borderRadius: 20 },
  giveUpText: { color: '#e10600', fontWeight: 'bold', fontSize: 16 },
});