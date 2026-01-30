import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {DocumentsStackParamList} from '../shared/types/navigation.types';
import DocListScreen from '../features/documents/screens/DocListScreen';
import DocDetailScreen from '../features/documents/screens/DocDetailScreen';
import DocsTodayScreen from '../features/documents/screens/DocsTodayScreen';

const Stack = createNativeStackNavigator<DocumentsStackParamList>();

const DocumentsStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Stack.Screen
        name="DocList"
        component={DocListScreen}
        options={{
          title: 'Document List',
        }}
      />
      <Stack.Screen
        name="DocDetail"
        component={DocDetailScreen}
        options={{
          title: 'Document Detail',
        }}
      />
      <Stack.Screen
        name="DocsToday"
        component={DocsTodayScreen}
        options={{
          title: "Today's Documents",
        }}
      />
    </Stack.Navigator>
  );
};

export default DocumentsStackNavigator;
