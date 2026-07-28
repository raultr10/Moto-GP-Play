import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SolvedCategoryProps {
  title: string;
  pilotsText: string;
  color: string;
}

export default function SolvedCategory({ title, pilotsText, color }: SolvedCategoryProps) {
  return (
    <View style={[styles.container, { backgroundColor: color }]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.pilots}>{pilotsText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#121212',
  },
  pilots: {
    fontSize: 14,
    color: '#121212',
    marginTop: 4,
  },
});