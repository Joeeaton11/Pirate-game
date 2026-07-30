import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from './src/navigation/types';
import MapScreen from './src/screens/MapScreen';
import EncounterScreen from './src/screens/EncounterScreen';
import CrewScreen from './src/screens/CrewScreen';
import { useGameStore } from './src/store/gameStore';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const hasHydrated = useGameStore((s) => s.hasHydrated);

  if (!hasHydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#f4e9cd" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Map" component={MapScreen} />
            <Stack.Screen
              name="Encounter"
              component={EncounterScreen}
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen name="Crew" component={CrewScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0b3d5c',
  },
});
