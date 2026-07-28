import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

//Añadimos el signo de interrogación (?) para hacerlas opcionales
interface GameControlsProps {
  onSubmit?: () => void;
  onClear?: () => void;
  onGiveUp?: () => void;
}

export default function GameControls({ onSubmit, onClear, onGiveUp }: GameControlsProps) {
  return (
    <View style={styles.container}>

      {onSubmit && (
        <TouchableOpacity style={[styles.btn, styles.btnSubmit]} onPress={onSubmit}>
          <Text style={styles.btnText}>Submit</Text>
        </TouchableOpacity>
      )}

      {onClear && (
        <TouchableOpacity style={[styles.btn, styles.btnClear]} onPress={onClear}>
          <Text style={styles.btnTextDark}>Clear</Text>
        </TouchableOpacity>
      )}

      {onGiveUp && (
        <TouchableOpacity style={[styles.btn, styles.btnGiveUp]} onPress={onGiveUp}>
          <Text style={styles.btnText}>Give up</Text>
        </TouchableOpacity>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 20,
    gap: 12,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    minWidth: 90,
    alignItems: 'center',
  },
  btnSubmit: { backgroundColor: '#E91E63' },
  btnClear: { backgroundColor: '#4DD0E1' },
  btnGiveUp: {
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#E91E63',
  },
  btnText: { color: '#FFF', fontWeight: 'bold' },
  btnTextDark: { color: '#121212', fontWeight: 'bold' }
});