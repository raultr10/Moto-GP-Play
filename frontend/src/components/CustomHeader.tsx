import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export const CustomHeader = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.headerContainer}>
      {/* Al pulsar en el título, volvemos a la pantalla anterior (el inicio) */}
      <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
        <Text style={styles.headerTitle}>MOTOGPPLAY</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    backgroundColor: '#8B0000',
    paddingTop: Platform.OS === 'web' ? 20 : 50, 
    paddingBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#3F3F4E',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
});