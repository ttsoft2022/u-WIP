import React from 'react';
import {StatusBar, View, StyleSheet} from 'react-native';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {RootNavigator} from './navigation';

// Custom theme with white background
const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#FFFFFF',
  },
};

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

const App: React.FC = () => {
  return (
    <View style={styles.container}>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer theme={AppTheme}>
          <StatusBar
            barStyle="light-content"
            backgroundColor="#1976D2"
          />
          <RootNavigator />
        </NavigationContainer>
      </QueryClientProvider>
    </View>
  );
};

export default App;
