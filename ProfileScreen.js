
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserID();
  }, []);

  const fetchUserID = async () => {
    try {
      const userID = await AsyncStorage.getItem('userID');
      if (userID) {
        console.log('UserID retrieved successfully:', userID);
        fetchUserData(userID); // Pass userID to fetchUserData function
      } else {
        console.log('UserID not found in AsyncStorage.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching UserID from AsyncStorage:', error);
      setLoading(false);
    }
  };

  const fetchUserData = async (userID) => {
    try {
      const response = await axios.get(`http://192.168.1.187:3000/user/${userID}`);
      if (response.data.success) {
        const userData = response.data.user;
        const fullNameParts = [userData.fname, userData.mname, userData.lname].filter(Boolean); // Filter out empty middle name
        const fullName = fullNameParts.join(' ');
        userData.name = fullName.trim();
        setUser(userData);
        setLoading(false);
      } else {
        console.error('Failed to fetch user data:', response.data.error);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
      // Handle error fetching user data
    }
  };
  
  

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userID');
      console.log('Logged out successfully.');
      // Redirect to login or do any other necessary action
    } catch (error) {
      console.error('Error logging out:', error);
      // Handle logout error
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#9B2035" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>No user data available.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Top section */}
      <View style={styles.topSection}>
        <Image
          source={require('./LOGO1.png')} // Adjust the path as per your project structure
          style={styles.logo}
        />
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Colored part */}
      <View style={styles.coloredPart}>
        {/* Profile circle overlay */}
        <View style={styles.circleContainer}>
          <View style={styles.profileImageContainer}>
            <Image
              source={require('./jurin.jpg')} // Adjust the path to your profile image
              style={styles.profileImage}
            />
          </View>
        </View>
      </View>

      {/* Profile content section */}
      <View style={styles.content}>
        <Text style={styles.name}>{user.name}</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            value={user.email}
            // Assuming you have an editable field for email
          />
        </View>
        <View style={styles.inputRow}>
          <View style={[styles.inputContainer, styles.halfInput]}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={user.Username}
              // Assuming you have an editable field for username
            />
          </View>
          <View style={[styles.inputContainer, styles.halfInput]}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry={true}
              value={user.Password}
              // Assuming you have an editable field for password
            />
          </View>
        </View>
        <View style={styles.inputRow}>
          <View style={[styles.inputContainer, styles.widerInput]}>
            <Text style={styles.label}>Birthday</Text>
            <TextInput
              style={styles.input}
              placeholder="Birthday"
              value={user.bday}
              // Assuming you have an editable field for birthday
            />
          </View>
          <View style={[styles.inputContainer, styles.narrowInput]}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              placeholder="Age"
              keyboardType="numeric"
              value={user.age.toString()}
              // Assuming you have an editable field for age
            />
          </View>
          <View style={[styles.inputContainer, styles.narrowInput]}>
            <Text style={styles.label}>Sex</Text>
            <TextInput
              style={styles.input}
              placeholder="Sex"
              value={user.sex}
              // Assuming you have an editable field for sex
            />
          </View>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Address"
            value={user.address}
            // Assuming you have an editable field for address
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: '#fff', // Set grey background color
    },
    topSection: {
      backgroundColor: '#A01F36',
      paddingHorizontal: 20,
      paddingBottom: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: 'transparent',
    },
    logo: {
      width: 160, // Adjust width as needed
      height: 160, // Adjust height as needed
      marginLeft: -20, // Move the logo further to the left
    },
    logoutButton: {
      position: 'absolute',
      top: 10,
      right: 20,
      paddingVertical: 60,
      paddingHorizontal: 15,
      borderRadius: 5,
      backgroundColor: 'transparent',
    },
    logoutText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    coloredPart: {
      backgroundColor: '#A01F36',
      height: 100, // Height of the colored part
      zIndex: 1, // Ensure the colored part is above the profile circle
    },
    circleContainer: {
      position: 'absolute',
      top: -30, // Adjust to position the circle higher
      alignSelf: 'center', // Center horizontally
      zIndex: 2, // Ensure the circle is above the colored part
    },
    profileImageContainer: {
      width: 200, // Adjust width and height to make the image circle bigger
      height: 200,
      borderRadius: 100, // Make it perfectly round
      borderWidth: 5, // Add a white border
      borderColor: '#fff', // White color for the border
      overflow: 'hidden', // Ensures the image stays within the circle
    },
    profileImage: {
      width: '100%', // Ensures the image fills the container
      height: '100%', // Ensures the image fills the container
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      marginTop: -70, // Adjust to center content relative to the profile circle
      zIndex: 0, // Ensure content is behind the profile circle
    },
    name: {
      fontSize: 30,
      fontWeight: 'bold',
      marginVertical: 20,
      textAlign: 'center',
    },
    inputContainer: {
      width: '100%',
      marginBottom: 10,
      
    },
    label: {
      fontSize: 14,
      marginBottom: 5,
      color: '#333',
    },
    input: {
      width: '100%',
      height: 50,
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 5,
      paddingHorizontal: 10,
      backgroundColor:'#E8E8E8',
     
  
    },
    inputRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10, // Added marginBottom to give space between rows
      
    },
    inputSpacing: {
      marginRight: 10, // Added marginRight to give space between inputs
    },
    halfInput: {
      width: '48%',
      marginRight: 10,
    },
    widerInput: {
      width: '40%',
      marginRight: 10,
    },
    narrowInput: {
      width: '25%',
      marginRight: 10,
    },
    title: {
      fontSize: 40,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },
  });

export default ProfileScreen;
