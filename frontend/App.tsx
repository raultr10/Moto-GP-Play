import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from './src/screens/HomeScreen';
import { WordleScreen } from './src/screens/WordleScreen';
import { GridScreen } from './src/screens/GridScreen';
import ConnectionsScreen from './src/screens/ConnectionsScreen';
import Top10Screen from './src/screens/Top10Screen';

export type RootStackParamList = {
  Home: undefined;
  Wordle: undefined;
  Grid: undefined;
  Connections: undefined;
  Top10: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        {/* Pantalla del Menú Principal */}
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ 
            headerShown: false //Ocultamos la cabecera por defecto para usar la nuestra
          }} 
        />
        
        {/* Pantalla del Wordle */}
        <Stack.Screen 
          name="Wordle" 
          component={WordleScreen} 
          options={{ 
            title: 'Moto Wordle',
            headerStyle: { backgroundColor: '#e10600' },
            headerTintColor: '#fff',
          }} 
        />

        {/* Pantalla del Grid */}
        <Stack.Screen 
          name="Grid" 
          component={GridScreen} 
          options={{ 
            title: 'Moto Grid',
            headerStyle: { backgroundColor: '#e10600' },
            headerTintColor: '#fff',
          }} 
        />

        {/* Pantalla del Connections */}
        <Stack.Screen 
          name="Connections" 
          component={ConnectionsScreen} 
          options={{ 
            title: 'Moto Connections',
            headerStyle: { backgroundColor: '#e10600' },
            headerTintColor: '#fff',
          }} 
        />

        <Stack.Screen 
          name="Top10" 
          component={Top10Screen} 
          options={{ 
            title: 'Moto Top10',
            headerStyle: { backgroundColor: '#e10600' },
            headerTintColor: '#fff',
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}