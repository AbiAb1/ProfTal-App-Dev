//ForgotPassword.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

export default function ForgotPassword({ navigation }) {
  const [email, setEmail] = useState('');

  const handleSendOtp = async () => {
    try {
      const response = await axios.post('http://192.168.0.238:5000/send-otp', { email });
      if (response.data.success) {
        Alert.alert('Success', 'OTP sent to your email');
        navigation.navigate('VerifyOTP', { email });
      } else {
        Alert.alert('Error', response.data.message); // Specific error message
      }
    } catch (error) {
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Request data:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      Alert.alert('Error', 'An error occurred. Please try again later.');
    }
  };
  
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.button} onPress={handleSendOtp}>
        <Text style={styles.buttonText}>Send OTP</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: "#e1e1e1",
    borderRadius: 8,
    marginBottom: 16,
  },
  button: {
    width: '100%',
    padding: 16,
    backgroundColor: '#980000',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  backText: {
    marginTop: 16,
    color: '#980000',
  },
});
