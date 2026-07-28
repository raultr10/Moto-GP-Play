import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Platform, ScrollView } from 'react-native';

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL'],
];

export const WordleScreen = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [solution, setSolution] = useState<string>('');
  const [guesses, setGuesses] = useState<string[]>(Array(6).fill(''));
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [turn, setTurn] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  const fetchNewWordle = () => {
    setLoading(true);
    setError(null);
    setGuesses(Array(6).fill(''));
    setCurrentGuess('');
    setTurn(0);
    setIsGameOver(false);
    setGameStatus('playing');

    fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/daily/wordle/random`)
      .then(response => {
        if (!response.ok) throw new Error('Error en boxes');
        return response.json();
      })
      .then(data => {
        //El piloto objetivo ya viene procesado desde el backend
        setSolution(data.wordleTarget);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  //Pedimos el primero al entrar en el Wordle
  useEffect(() => {
    fetchNewWordle();
  }, []);

  const handleKeyPress = (key: string) => {
    if (isGameOver) return;

    if (key === 'DEL') {
      setCurrentGuess(prev => prev.slice(0, -1));
      return;
    }

    if (key === 'ENTER') {
      if (currentGuess.length !== solution.length) return; 
      
      const newGuesses = [...guesses];
      newGuesses[turn] = currentGuess;
      setGuesses(newGuesses);
      
      if (currentGuess === solution) {
        setIsGameOver(true);
        setGameStatus('won');
      } else if (turn === 5) {
        setIsGameOver(true);
        setGameStatus('lost');
      } else {
        setTurn(turn + 1);
        setCurrentGuess('');
      }
      return;
    }

    if (currentGuess.length < solution.length) {
      setCurrentGuess(prev => prev + key);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') handleKeyPress('ENTER');
      else if (e.key === 'Backspace') handleKeyPress('DEL');
      else {
        const key = e.key.toUpperCase();
        if (/^[A-Z]$/.test(key)) handleKeyPress(key);
      }
    };

    if (Platform.OS === 'web') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [currentGuess, turn, isGameOver, guesses, solution]);

  // Función para no duplicar amarillos
  const getGuessColors = (guess: string) => {
    const colors = Array(solution.length).fill('absent'); // Por defecto todo gris
    const solutionChars = solution.split('');
    const guessChars = guess.split('');

    //Buscamos las letras verdes
    for (let i = 0; i < guessChars.length; i++) {
      if (guessChars[i] === solutionChars[i]) {
        colors[i] = 'correct';
        solutionChars[i] = null as any;
      }
    }

    //Buscamos las amarillas
    for (let i = 0; i < guessChars.length; i++) {
      if (colors[i] !== 'correct' && solutionChars.includes(guessChars[i])) {
        colors[i] = 'present';
        const indexToCrossOut = solutionChars.indexOf(guessChars[i]);
        solutionChars[indexToCrossOut] = null as any;
      }
    }

    return colors;
  };

  if (loading) return <View style={[styles.container, styles.center]}><ActivityIndicator size="large" color="#E10600" /></View>;
  if (error) return <View style={[styles.container, styles.center]}><Text style={styles.errorText}>{error}</Text></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>PILOTO DEL DÍA</Text>
      
      <TouchableOpacity style={styles.btnRandom} onPress={fetchNewWordle}>
        <Text style={styles.btnRandomText}>🔄 Nuevo Wordle Aleatorio</Text>
      </TouchableOpacity>

      {isGameOver && (
        <View style={[styles.resultBox, gameStatus === 'won' ? styles.resultWon : styles.resultLost]}>
          <Text style={styles.resultText}>
            {gameStatus === 'won' ? '¡BANDERA A CUADROS! ¡Has ganado!' : `¡CAÍDA! El piloto era ${solution}`}
          </Text>
        </View>
      )}

      <View style={styles.grid}>
        {guesses.map((guess, i) => {
          const isCurrentRow = i === turn;
          const word = isCurrentRow ? currentGuess : guess;
          
          const rowColors = (!isCurrentRow && guess) ? getGuessColors(guess) : [];
          
          return (
            <View key={i} style={styles.row}>
              {Array.from({ length: solution.length }).map((_, j) => {
                const letter = word[j] || '';
                let extraBoxStyle = null;
                
                if (!isCurrentRow && guess) {
                  if (rowColors[j] === 'correct') extraBoxStyle = styles.boxCorrect;
                  else if (rowColors[j] === 'present') extraBoxStyle = styles.boxPresent;
                  else extraBoxStyle = styles.boxAbsent;
                } else if (letter) {
                  extraBoxStyle = styles.boxActive;
                }

                return (
                  <View key={j} style={[styles.box, extraBoxStyle]}>
                    <Text style={styles.boxText}>{letter}</Text>
                  </View>
                );
              })}
            </View>
          );
        })}
      </View>

      <View style={styles.keyboard}>
        {KEYBOARD_ROWS.map((row, i) => (
          <View key={i} style={styles.keyRow}>
            {row.map(key => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.key,
                  (key === 'ENTER' || key === 'DEL') && styles.keySpecial
                ]}
                onPress={() => handleKeyPress(key)}
              >
                <Text style={styles.keyText}>{key}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#15151A' },
  contentContainer: { paddingVertical: 20, alignItems: 'center' },
  center: { justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 15, letterSpacing: 1 },
  
  btnRandom: {
    backgroundColor: '#2A2A35',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4DD0E1',
    marginBottom: 20,
  },
  btnRandomText: { color: '#4DD0E1', fontWeight: 'bold', fontSize: 14 },

  errorText: { color: '#E10600', fontSize: 16 },
  
  resultBox: { padding: 12, borderRadius: 8, marginHorizontal: 20, marginBottom: 20, alignItems: 'center', width: '90%', maxWidth: 400 },
  resultWon: { backgroundColor: '#538d4e' },
  resultLost: { backgroundColor: '#E10600' },
  resultText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },

  grid: { paddingHorizontal: 10, alignItems: 'center', marginBottom: 20 },
  row: { flexDirection: 'row', marginBottom: 8 },
  box: {
    width: 45,
    height: 45,
    borderWidth: 2,
    borderColor: '#3F3F4E',
    backgroundColor: '#1E1E26',
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  boxActive: { borderColor: '#888899' },
  boxCorrect: { backgroundColor: '#538d4e', borderColor: '#538d4e' },
  boxPresent: { backgroundColor: '#b59f3b', borderColor: '#b59f3b' },
  boxAbsent: { backgroundColor: '#3a3a3c', borderColor: '#3a3a3c' },
  boxText: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },

  keyboard: { marginTop: 'auto', paddingHorizontal: 5, paddingBottom: 20, width: '100%', maxWidth: 500 },
  keyRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 8 },
  key: {
    backgroundColor: '#818384',
    paddingHorizontal: 10,
    paddingVertical: 15,
    marginHorizontal: 3,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 32,
  },
  keySpecial: { minWidth: 60, backgroundColor: '#606263' },
  keyText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
});