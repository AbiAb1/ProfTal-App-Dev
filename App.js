

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { UserProvider } from './context/userContext.js'; // Adjust the import path as necessary
import LoginScreen from './LoginScreen';
import FeedScreen from './FeedScreen';
import LoaderScreen from './LoaderScreen';
import TaskScreen from './TaskScreen';
import TaskDetailsScreen from './TaskDetailsScreen';
import ProfileScreen from './ProfileScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
         
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="Feed" 
            component={FeedScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="Tasks" 
            component={TaskScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="TaskDetails" 
            component={TaskDetailsScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen} 
            options={{ headerShown: false }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
};

export default App;
