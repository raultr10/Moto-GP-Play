import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { GameCard } from '../components/GameCard';

export const HomeScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>MOTOGPPLAY</Text>
      
      <View style={styles.gridContainer}>
        <GameCard
          title="Moto Wordle"
          description="Adivina el piloto."
          image={require('../../assets/Wordle.png')}
          onPress={() => navigation.navigate('Wordle')}
        />
        
        <GameCard
          title="Moto Grid"
          description="Rellena la matriz."
          image={require('../../assets/Grid.png')}
          onPress={() => navigation.navigate('Grid')}
        />
        
        <GameCard
          title="Moto Connections"
          description="Empareja los pilotos."
          image={require('../../assets/Connections.png')}
          onPress={() => navigation.navigate('Connections')}
        />
        
        <GameCard
          title="Top 10"
          description="Adivina el top 10."
          image={require('../../assets/Top10.png')}
          onPress={() => navigation.navigate('Top10')}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#15151A', 
  },
  header: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginVertical: 30,
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  gridContainer: {
    paddingHorizontal: 16,
    flexDirection: 'row', 
    flexWrap: 'wrap',     
    justifyContent: 'center',
    maxWidth: 800,          
    alignSelf: 'center',  
  },
});