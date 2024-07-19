//App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import LoginScreen from './Screens/Login';
import RegisterScreen from './Screens/Register';
import ForgotPasswordScreen from './Screens/ForgotPassword';
import VerifyOTPScreen from './Screens/VerifyOTP';
import FeedScreen from './Screens/Feed';
import DashboardScreen from './Screens/Dashboard';
import AddDepartmentScreen from './Screens/Department';
import ContentScreen from './Screens/Content_Dept';
import TaskScreen from './Screens/Task';
import UserApprovalComponent from './Screens/UserApproval';
import ReminderScreen from './Screens/Reminder';
import GradesScreen from './Screens/Grades';


const Stack = createStackNavigator();
AppRegistry.registerComponent(appName, () => App);

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Feed" component={FeedScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Department" component={AddDepartmentScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Users" component={UserApprovalComponent} options={{ headerShown: false }} />
        <Stack.Screen name="Content" component={ContentScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Task" component={TaskScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Reminder" component={ReminderScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Grades" component={GradesScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
