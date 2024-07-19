import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Ensure you have this package installed
import axios from 'axios';

export default function VerifyOTP({ route, navigation }) {
  const { email } = route.params || {}; // Destructure email, provide default object if params are undefined

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  const otpRefs = useRef([]);

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      const response = await axios.post('http://192.168.0.238:5000/reset-password', {
        email,
        otp: otp.join(''),
        newPassword,
      });
      if (response.data.success) {
        Alert.alert('Success', 'Password reset successfully', [
          { text: 'OK', onPress: () => navigation.navigate('Login') },
        ]);
      } else {
        Alert.alert('Error', response.data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred. Please try again later.');
      console.error(error);
    }
  };

  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Move to the next input field if the current input has a value
    if (text) {
      if (index < otpRefs.current.length - 1) {
        otpRefs.current[index + 1].focus();
      }
    } else {
      // Move to the previous input field if the current input is cleared
      if (index > 0) {
        otpRefs.current[index - 1].focus();
      }
    }
  };

  const handleConfirmPasswordChange = (text) => {
    setConfirmPassword(text);
    setPasswordsMatch(newPassword === text);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(el) => (otpRefs.current[index] = el)}
            style={styles.otpInput}
            value={digit}
            onChangeText={(text) => handleOtpChange(text, index)}
            keyboardType="numeric"
            maxLength={1}
          />
        ))}
      </View>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.input}
          placeholder="New Password"
          value={newPassword}
          onChangeText={(text) => {
            setNewPassword(text);
          }}
          secureTextEntry={!showPassword}
          textAlign="left"
        />
        <TouchableOpacity
          style={styles.showPasswordButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Icon name={showPassword ? 'eye-off' : 'eye'} size={24} color="#980000" />
        </TouchableOpacity>
      </View>
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, !passwordsMatch && styles.errorInput]}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={handleConfirmPasswordChange}
          secureTextEntry={!showConfirmPassword}
          textAlign="left"
        />
        <TouchableOpacity
          style={styles.showPasswordButton}
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <Icon name={showConfirmPassword ? 'eye-off' : 'eye'} size={24} color="#980000" />
        </TouchableOpacity>
      </View>
      {!passwordsMatch && (
        <Text style={styles.errorText}>Passwords do not match</Text>
      )}
      <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
        <Text style={styles.buttonText}>Reset Password</Text>
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
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  otpInput: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: "#e1e1e1",
    borderRadius: 8,
    textAlign: 'center',
    marginHorizontal: 5,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: "#e1e1e1",
    borderRadius: 8,
  },
  showPasswordButton: {
    position: 'absolute',
    right: 10,
    padding: 10,
  },
  errorInput: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
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
