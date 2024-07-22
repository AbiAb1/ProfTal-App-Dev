import React, { useState } from 'react';
import { View, Text, Image, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from './context/userContext.js'; // Adjust the import path as necessary

const LoginScreen = ({ navigation }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { setUserID } = useUser(); // Use the useUser hook to access userID state

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://192.168.1.187:3000/login', {
        username: username,
        password: password
      });
  
      setLoading(false);
      if (response.data.message === 'Login successful') {
        const { userID } = response.data;
        await AsyncStorage.setItem('UserID', userID.toString()); // Store userID in AsyncStorage
        setUserID(userID); // Store userID in context
        console.log('UserID stored:', userID);
        navigation.navigate('Feed', { UserID: userID }); // Pass UserID to TaskScreen
      } else {
        Alert.alert('Invalid username or password');
      }
    } catch (error) {
      setLoading(false);
      console.error('Error logging in:', error);
      Alert.alert('An error occurred during login');
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('./LOGO1.png')}
        style={styles.logo}
      />
      <Text style={styles.loginText}>LOGIN!</Text>
      <Text style={styles.credentialsText}>Enter Your Credentials Below</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#999"
        value={username}
        onChangeText={setUsername}
      />
      <View style={styles.passwordInputContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={togglePasswordVisibility} style={styles.showPasswordButton}>
          <Text style={styles.showPasswordText}>Show</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.linksContainer}>
        <TouchableOpacity onPress={() => console.log('Forgot password clicked')} style={styles.forgotPasswordLink}>
          <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.loginButtonText}>Log In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => console.log('Register clicked')} style={styles.registerLink}>
        <Text style={styles.registerText}>Click here to register</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 450,
    height: 150,
    marginTop: -70,
    marginBottom: 50,
  },
  loginText: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  credentialsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9B2035',
    marginBottom: 20,
  },
  input: {
    height: 55,
    width: '100%',
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  passwordInputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  passwordInput: {
    flex: 1,
    height: 55,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  showPasswordButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#e6e6e6',
    borderRadius: 5,
    marginLeft: 10,
  },
  showPasswordText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9B2035',
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end', // Aligns "Forgot your password?" link to the right
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#9B2035',
    fontWeight: 'bold',
  },
  registerLink: {
    alignSelf: 'center', // Centers "Click here to register" link
    marginTop: 20, // Adds space between "Log In" button and "Register" link
  },
  registerText: {
    fontSize: 14,
    color: '#9B2035',
    fontWeight: 'bold',
  },
  loginButton: {
    marginTop: 80,
    width: '100%',
    backgroundColor: '#9B2035',
    padding: 15,
    alignItems: 'center',
    borderRadius: 90,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default LoginScreen;
