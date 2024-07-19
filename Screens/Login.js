import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';

const logoImage = require('../Images/LOGO1.png');

export default function LoginScreen({ navigation }) {
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLogin(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Reminder!', 'Please fill in both email and password');
      return;
    }

    try {
      const response = await axios.post('http://192.168.0.238:5000/login', {
        email: username,
        password,
      });

      if (response.data.success) {
        const { role } = response.data;
        Alert.alert('Login successful');
        
        // Navigate to the appropriate dashboard based on the role
        if (role === 'admin') {
          navigation.navigate('Dashboard');
        } else {
          navigation.navigate('Dashboard');
        }
      } else {
        Alert.alert('Invalid credentials', response.data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred. Please try again later.');
      console.error(error);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <View style={styles.container}>
      {!showLogin ? (
        <>
          <View style={styles.centered}>
            <Image source={logoImage} style={styles.image} />
          </View>
          <View style={styles.by}>
            <Text>By</Text>
          </View>
          <View style={styles.qwerty}>
            <Text>QWERTY</Text>
          </View>
        </>
      ) : (
        <View style={styles.loginContainer}>
          <Image source={logoImage} style={styles.image2} />
          <Text style={[styles.loginText, { marginBottom: 5 }]}>LOGIN!</Text>
          <Text style={styles.subText}>Enter your credentials below</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              onChangeText={(text) => setUsername(text)}
              value={username}
              textAlign="left"
            />
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                onChangeText={(text) => setPassword(text)}
                value={password}
                secureTextEntry={!showPassword}
                textAlign="left"
              />
              <TouchableOpacity
                style={styles.showPasswordButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.showPasswordText}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.forgotPasswordContainer}>
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
          <View style={styles.bottomContainer}>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.registerText}>
                Click here to <Text style={styles.registerLink}>register</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    alignItems: 'center',
  },
  by: {
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qwerty: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -50, // Adjust as needed
  },
  image: {
    width: 350,
    height: 350,
    resizeMode: 'contain',
  },
  image2: {
    width: 350,
    height: 350,
    resizeMode: 'contain',
  },
  loginText: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: -90,
  },
  subText: {
    fontSize: 16,
    marginBottom: 20,
    color: "#980000",
  },
  inputContainer: {
    width: 300,
    alignItems: 'center',
  },
  input: {
    width: 300,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: "#e1e1e1",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    textAlign: 'left',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  showPasswordButton: {
    position: 'absolute',
    right: 10,
    padding: 10,
  },
  showPasswordText: {
    color: '#980000',
    fontSize: 16,
    marginTop: -10,
  },
  forgotPasswordContainer: {
    width: 300,
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: "#980000",
    width: 300,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  loginButtonText: {
    fontSize: 18,
    color: 'white',
  },
  bottomContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  registerText: {
    fontSize: 18,
    color: "#980000",
  },
  forgotPasswordText: {
    color: "#980000",
    fontSize: 16,
  },
});
