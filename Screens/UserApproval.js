import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ActivityIndicator, Alert } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBuilding, faUserCheck, faChevronLeft, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

const logoImage = require('../Images/LOGO1.png');
const userIcon = require('../Images/Vernon.jpg'); // Replace with your user icon image

const Tab = createMaterialTopTabNavigator();

const UserApprovalComponent = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={logoImage} style={styles.logo} />
        <View style={styles.iconContainer}>
          <FontAwesomeIcon icon={faBuilding} size={25} style={styles.icon} />
          <FontAwesomeIcon icon={faUserCheck} size={35} style={styles.icon} />
          <Image source={userIcon} style={styles.userIcon} />
        </View>
      </View>
      <TouchableOpacity style={styles.backContainer} onPress={() => navigation.goBack()}>
        <FontAwesomeIcon icon={faChevronLeft} size={14} style={styles.backIcon} />
        <Text style={styles.backText}>Back to Dashboard</Text>
      </TouchableOpacity>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>User Approval</Text>
      </View>
      <Tab.Navigator>
        <Tab.Screen name="Pending" component={PendingUsers} />
        <Tab.Screen name="Rejected" component={RejectedUsers} />
      </Tab.Navigator>
    </View>
  );
};

const PendingUsers = ({ navigation }) => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPendingUsers = async () => {
      console.log('Fetching pending users...');
      try {
        const response = await axios.get('http://192.168.0.238:5000/pending-users');
        console.log('Pending users fetched:', response.data);
        setPendingUsers(response.data);
      } catch (error) {
        console.error('Error fetching pending users:', error);
        setError('Failed to load pending users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingUsers();
  }, []);

  const sendApprovalEmail = async (email) => {
    if (!email) {
      console.error('Email is undefined');
      return;
    }
    console.log(`Sending approval email to ${email}...`);
    try {
      await axios.post('http://192.168.0.238:5000/send-approval-email', { email });
      console.log('Approval email sent successfully.');
    } catch (error) {
      console.error('Error sending approval email:', error.response ? error.response.data : error.message);
      Alert.alert('Error', 'Failed to send approval email. Please try again later.');
    }
  };

  const sendRejectionEmail = async (email) => {
    if (!email) {
      console.error('Email is undefined');
      return;
    }
    console.log(`Sending rejection email to ${email}...`);
    try {
      await axios.post('http://192.168.0.238:5000/send-rejection-email', { email });
      console.log('Rejection email sent successfully.');
    } catch (error) {
      console.error('Error sending rejection email:', error.response ? error.response.data : error.message);
      Alert.alert('Error', 'Failed to send rejection email. Please try again later.');
    }
  };

  const handleApprove = async (userId, email) => {
    console.log(`Approving user with ID: ${userId}`);
    try {
      const response = await axios.put(`http://192.168.0.238:5000/approve-user/${userId}`);
      console.log('Approval response:', response.data);
      if (response.data.message === 'User approved successfully') {
        Alert.alert('Success', response.data.message);
        setPendingUsers(pendingUsers.filter(user => user.user_ID !== userId));
        await sendApprovalEmail(email);
      } else {
        Alert.alert('Error', response.data.message);
      }
    } catch (error) {
      console.error('Error approving user:', error.response ? error.response.data : error.message);
      Alert.alert('Error', 'An error occurred. Please try again later.');
    }
  };

  const handleReject = async (userId, email) => {
    console.log(`Rejecting user with ID: ${userId}`);
    try {
      const response = await axios.put(`http://192.168.0.238:5000/reject-user/${userId}`);
      console.log('Rejection response:', response.data);
      if (response.data.message === 'User rejected successfully') {
        Alert.alert('Success', response.data.message);
        setPendingUsers(pendingUsers.filter(user => user.user_ID !== userId));
        await sendRejectionEmail(email);
      } else {
        Alert.alert('Error', response.data.message);
      }
    } catch (error) {
      console.error('Error rejecting user:', error.response ? error.response.data : error.message);
      Alert.alert('Error', 'An error occurred. Please try again later.');
    }
  };

  const confirmAction = (userId, email, userName, action) => {
    console.log(`Confirming action: ${action} for user ID: ${userId}`);
    Alert.alert(
      'Confirmation',
      `Are you sure you want to ${action} the account of ${userName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            if (action === 'approve') {
              handleApprove(userId, email);
            } else {
              handleReject(userId, email);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfo}>
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userRole}>{item.role}</Text>
          <Text style={styles.userDate}>Registered on: {new Date(item.date).toLocaleDateString()}</Text>
        </View>
        <View style={styles.iconContainer1}>
          <TouchableOpacity onPress={() => confirmAction(item.user_ID, item.email, item.name, 'approve')} style={styles.iconButton}>
            <View style={[styles.iconBackground, styles.iconBackgroundGreen]}>
              <FontAwesomeIcon icon={faCheck} size={20} style={styles.icon1} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => confirmAction(item.user_ID, item.email, item.name, 'reject')} style={styles.iconButton}>
            <View style={[styles.iconBackground, styles.iconBackgroundRed]}>
              <FontAwesomeIcon icon={faTimes} size={20} style={styles.icon2} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#980000" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={pendingUsers}
          renderItem={renderItem}
          keyExtractor={item => item.user_ID.toString()}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const RejectedUsers = ({ navigation }) => {
  const [rejectedUsers, setRejectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRejectedUsers = async () => {
      console.log('Fetching rejected users...');
      try {
        const response = await axios.get('http://192.168.0.238:5000/rejected-users');
        console.log('Rejected users fetched:', response.data);
        setRejectedUsers(response.data);
      } catch (error) {
        console.error('Error fetching rejected users:', error);
        setError('Failed to load rejected users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRejectedUsers();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfo}>
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userRole}>{item.role}</Text>
          <Text style={styles.userDate}>Registered on: {new Date(item.date).toLocaleDateString()}</Text>
          <Text style={styles.userDate}>Rejected on: {new Date(item.rejected_date).toLocaleDateString()}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#980000" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={rejectedUsers}
          renderItem={renderItem}
          keyExtractor={item => item.user_ID.toString()}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    justifyContent: 'space-between',
  },
  logo: {
    width: 100,
    height: 50,
    resizeMode: 'contain',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginHorizontal: 10,
  },
  userIcon: {
    width: 35,
    height: 35,
    borderRadius: 50,
  },
  backContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  backIcon: {
    marginRight: 5,
  },
  backText: {
    fontSize: 16,
    color: '#333',
  },
  titleContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  userItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userRole: {
    fontSize: 16,
    color: '#555',
  },
  userDate: {
    fontSize: 14,
    color: '#999',
  },
  iconContainer1: {
    flexDirection: 'row',
  },
  iconButton: {
    marginHorizontal: 5,
  },
  iconBackground: {
    padding: 10,
    borderRadius: 50,
  },
  iconBackgroundGreen: {
    backgroundColor: '#28a745',
  },
  iconBackgroundRed: {
    backgroundColor: '#dc3545',
  },
  icon1: {
    color: '#fff',
  },
  icon2: {
    color: '#fff',
  },
  list: {
    paddingBottom: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default UserApprovalComponent;
