import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const logoImage = require('../Images/LOGO1.png');

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      user: 'John Doe',
      time: '10:30 AM',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    },
    {
      id: 2,
      user: 'Jane Smith',
      time: 'Yesterday, 8:45 PM',
      content: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
    {
      id: 3,
      user: 'Alice Johnson',
      time: 'Today, 9:15 AM',
      content: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
    },
  ]);

  const goBack = () => {
    // Implement navigation logic to go back to Feed screen
    alert('Implement navigation logic to go back to Feed screen');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={logoImage} style={styles.logo} />
        <TouchableOpacity onPress={goBack}>
          <Text style={styles.backText}>Back to Feed</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.underline}></View>
      </View>
      <ScrollView style={styles.notificationList}>
        {notifications.map((notification) => (
          <View key={notification.id} style={styles.notificationItem}>
            <View style={styles.notificationHeader}>
              <Icon name="user" size={20} color="#000" />
              <Text style={styles.notificationUser}>{notification.user}</Text>
              <Text style={styles.notificationTime}>{notification.time}</Text>
            </View>
            <Text style={styles.notificationContent}>{notification.content}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  logo: {
    width: 180, // Adjust width as needed
    height: 180, // Keep the height proportional to the width
    resizeMode: 'contain',
    marginLeft: -50,
    marginRight: -50,
    marginBottom: -105,
    marginTop: -50,
  },
  backText: {
    color: '#007BFF',
    fontSize: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    marginRight: 10,
  },
  underline: {
    flex: 1,
    height: 1,
    backgroundColor: '#000',
    marginTop: 2,
  },
  notificationList: {
    flex: 1,
    marginTop: 20,
  },
  notificationItem: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  notificationUser: {
    marginLeft: 10,
    fontWeight: 'bold',
  },
  notificationTime: {
    marginLeft: 'auto',
    color: '#666',
  },
  notificationContent: {
    marginTop: 5,
    fontSize: 16,
  },
});

export default NotificationsScreen;
