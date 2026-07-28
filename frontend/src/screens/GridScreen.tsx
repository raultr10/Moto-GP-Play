import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { GridCell } from '../components/GridCell';
import GameControls from '../components/GameControls'; 

interface AnswerData {
  id: number | string;
  name: string;
  imageUrl?: string;
}

export const GridScreen = () => {
  const [loading, setLoading] = useState(true);
  const [headers, setHeaders] = useState<{ cols: string[], rows: string[] } | null>(null);

  const [gridAnswers, setGridAnswers] = useState<(AnswerData | null)[]>(Array(9).fill(null));
  
  const [selectedCellIndex, setSelectedCellIndex] = useState<number | null>(null);
  const [inputText, setInputText] = useState('');
  const [allRiders, setAllRiders] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const fetchRandomGrid = () => {
    setLoading(true);
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/daily/grid/random`)
      .then(res => res.json())
      .then(data => {
        setHeaders(data);
        setGridAnswers(Array(9).fill(null));
        setSelectedCellIndex(null);
        setInputText('');
        setSuggestions([]);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRandomGrid();

    fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/riders`)
      .then(res => res.json())
      .then(data => {
        setAllRiders(data);
      })
      .catch(err => {
        console.error(err);
      });
  }, []);

  const showCustomAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

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

  const handleSelectRider = async (rider: any) => {
    if (selectedCellIndex === null || !headers) return;

    const isAlreadyUsed = gridAnswers.some(answer => answer?.id === rider.id);
    if (isAlreadyUsed) {
      showCustomAlert('¡Piloto repetido!', 'Ya has colocado a este piloto en el tablero. ¡Busca otra opción!');
      return; 
    }

    const rowIndex = Math.floor(selectedCellIndex / 3);
    const colIndex = selectedCellIndex % 3;
    const rowCategory = headers.rows[rowIndex];
    const colCategory = headers.cols[colIndex];

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/daily/grid/guess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          riderId: rider.id,
          rowCategory,
          colCategory,
          cols: headers.cols,
          rows: headers.rows
        })
      });

      const data = await response.json();

      if (data.valid) {
        const newAnswers = [...gridAnswers];
        const nameParts = data.riderName.split(' ');
        const lastName = nameParts[nameParts.length - 1].toUpperCase();

        const answerData = {
          id: rider.id,
          name: lastName,
          imageUrl: data.imageUrl || rider.image_url 
        };

        newAnswers[selectedCellIndex] = answerData;

        if (data.autoFillIndexes && data.autoFillIndexes.length > 0) {
          let autoFilledCount = 0;
          
          data.autoFillIndexes.forEach((index: number) => {
            if (index !== selectedCellIndex && !newAnswers[index]) {
              newAnswers[index] = answerData;
              autoFilledCount++;
            }
          });

          if (autoFilledCount > 0) {
            showCustomAlert('¡Jugada Maestra!', `Este piloto era la única opción en el mundo para encajar en otras casillas, así que te las hemos autocompletado por seguridad.`);
          }
        }

        setGridAnswers(newAnswers);
        setSelectedCellIndex(null);
        setInputText('');
        setSuggestions([]);
      } else {
        showCustomAlert('¡Fallo!', data.error);
      }
    } catch (error) {
      showCustomAlert('Error', 'Error de conexión al verificar.');
    }
  };

  //Lógica de rendirse
  const fetchGiveUp = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/daily/grid/giveup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cols: headers?.cols,
          rows: headers?.rows,
          currentAnswers: gridAnswers
        })
      });

      const data = await response.json();

      if (data.completedBoard) {
        setGridAnswers(data.completedBoard);
      } else {
        showCustomAlert('Error', 'No se ha podido resolver el tablero.');
      }
    } catch (error) {
      showCustomAlert('Error', 'Fallo de conexión al rendirse.');
    } finally {
      setLoading(false);
      setSelectedCellIndex(null);
      setInputText('');
      setSuggestions([]);
    }
  };

  const handleGiveUp = () => {
    if (Platform.OS === 'web') {
      const confirmGiveUp = window.confirm("¿Te rindes? Completaremos las casillas vacías sin repetir a los pilotos que ya has puesto.");
      if (confirmGiveUp) {
        fetchGiveUp();
      }
    } else {
      Alert.alert(
        "¿Te rindes?",
        "Completaremos las casillas vacías sin repetir a los pilotos que ya has puesto.",
        [
          { text: "Cancelar", style: "cancel" },
          { 
            text: "Rendirme", 
            style: "destructive",
            onPress: fetchGiveUp 
          }
        ]
      );
    }
  };

  if (loading && !headers) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#e10600" /></View>;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >

      <View style={styles.headerContainer}>
        <Text style={styles.title}>MOTO GRID</Text>

        <TouchableOpacity style={styles.refreshButton} onPress={fetchRandomGrid}>
          <Text style={styles.refreshButtonText}>🔄 Nuevo Grid Aleatorio</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.gridBoard}>
        <View style={styles.row}>
          <GridCell type="empty" />
          {headers?.cols.map((col, i) => (
            <GridCell key={`col-${i}`} type="header" label={col} />
          ))}
        </View>

        {headers?.rows.map((rowLabel, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.row}>
            <GridCell type="header" label={rowLabel} />

            {[0, 1, 2].map((colIndex) => {
              const cellIndex = rowIndex * 3 + colIndex;
              const answer = gridAnswers[cellIndex]; 

              return (
                <GridCell
                  key={`cell-${cellIndex}`}
                  type="cell"
                  label={answer ? answer.name : ""} 
                  imageUrl={answer?.imageUrl}       
                  isSelected={selectedCellIndex === cellIndex}
                  onPress={() => setSelectedCellIndex(cellIndex)}
                />
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.input, selectedCellIndex === null && styles.inputDisabled]}
          placeholder={selectedCellIndex !== null ? "Busca un piloto..." : "Selecciona una casilla primero"}
          placeholderTextColor="#666"
          value={inputText}
          onChangeText={handleSearch}
          editable={selectedCellIndex !== null}
        />

        {suggestions.length > 0 && selectedCellIndex !== null && (
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

      {!selectedCellIndex && (
        <Text style={styles.helperText}>Selecciona una casilla para jugar</Text>
      )}

      <View style={{ marginTop: 30 }}>
        <GameControls onGiveUp={handleGiveUp} />
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#15151A', 
    padding: 16 
  },
  center: { flex: 1, backgroundColor: '#15151A', justifyContent: 'center', alignItems: 'center' },

  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center', letterSpacing: 2 },

  refreshButton: {
    marginTop: 10,
    backgroundColor: '#1E1E26',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3F3F4E',
  },
  refreshButtonText: {
    color: '#e10600',
    fontWeight: 'bold',
    fontSize: 14,
  },

  gridBoard: { maxWidth: 500, alignSelf: 'center', width: '100%', zIndex: 1 },
  row: { flexDirection: 'row', justifyContent: 'center', marginBottom: 4 },

  searchContainer: {
    marginTop: 40,
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
  inputDisabled: { opacity: 0.5 },

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
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#3F3F4E',
  },
  suggestionText: {
    color: '#FFF',
    fontSize: 16,
  },
  helperText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 15,
    fontStyle: 'italic',
  },
});