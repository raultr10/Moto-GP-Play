import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

interface GameCardProps {
  title: string;
  description: string;
  onPress: () => void;
  disabled?: boolean;
}

export const GameCard = ({ title, description, onPress, disabled = false }: GameCardProps) => {
  return (
    <TouchableOpacity
      style={[styles.card, disabled && styles.cardDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={[styles.title, disabled && styles.textDisabled]}>{title}</Text>
        {disabled ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>PRÓXIMAMENTE</Text>
          </View>
        ) : (
          <Text style={styles.playText}>JUGAR ▶</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2A2A35',
    borderRadius: 16,
    width: 160,
    height: 220,
    marginHorizontal: 8,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3F3F4E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  cardDisabled: {
    backgroundColor: '#1E1E26',
    borderColor: '#2A2A35',
    opacity: 0.8,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  textDisabled: {
    color: '#666677',
  },
  playText: {
    color: '#E10600',
    fontWeight: 'bold',
    fontSize: 16,
  },
  badge: {
    backgroundColor: '#333344',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#9999AA',
  },
});