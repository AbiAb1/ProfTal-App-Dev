import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';

export default function Register({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get('http://192.168.0.238:5000/departments');
        console.log(response.data); // Log the response data to check its structure
        setDepartments(response.data);
      } catch (error) {
        console.error('Error fetching departments:', error);
        setFetchError('Failed to load departments. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
  
    try {
      const response = await axios.post('http://192.168.0.238:5000/register', {
        firstName,
        lastName,
        email,
        password,
        dept_ID: selectedDepartment,
      });
  
      if (response.data.success) {
        Alert.alert('Success', 'User registered successfully');
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', response.data.message);
      }
    } catch (error) {
      console.error('Registration error:', error.response ? error.response.data : error.message);
      Alert.alert('Error', 'An error occurred. Please try again later.');
    }
  };

  const handleConfirmPasswordChange = (text) => {
    setConfirmPassword(text);
    setPasswordsMatch(text === password);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.registerText}>Register</Text>
      <Text style={styles.subText}>Create a new account</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="First Name"
          onChangeText={(text) => setFirstName(text)}
          value={firstName}
          textAlign="left"
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          onChangeText={(text) => setLastName(text)}
          value={lastName}
          textAlign="left"
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          onChangeText={(text) => setEmail(text)}
          value={email}
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
            <Icon name={showPassword ? 'eye-off' : 'eye'} size={24} color="#980000" />
          </TouchableOpacity>
        </View>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, !passwordsMatch && styles.errorInput]}
            placeholder="Confirm Password"
            onChangeText={handleConfirmPasswordChange}
            value={confirmPassword}
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
        {loading ? (
          <ActivityIndicator size="large" color="#980000" />
        ) : (
          <>
            {fetchError ? (
              <Text style={styles.errorText}>{fetchError}</Text>
            ) : (
              <Picker
                selectedValue={selectedDepartment}
                style={styles.picker}
                onValueChange={(itemValue) => setSelectedDepartment(itemValue)}
              >
                <Picker.Item label="Select Department" value="" />
                {departments.map((department) => (
                  <Picker.Item key={department.dept_ID} label={department.dept_name} value={department.dept_ID} />
                ))}
              </Picker>
            )}
          </>
        )}
      </View>
      <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
        <Text style={styles.registerButtonText}>Register</Text>
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
  },
  registerText: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 10,
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
  errorInput: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  picker: {
    width: 300,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: "#e1e1e1",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  registerButton: {
    backgroundColor: "#980000",
    width: 300,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginTop: 20,
  },
  registerButtonText: {
    fontSize: 18,
    color: 'white',
  },
  backText: {
    marginTop: 16,
    color: '#980000',
  },
});
