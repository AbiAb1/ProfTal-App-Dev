

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';

import ProfileScreen from './ProfileScreen'; // Import ProfileScreen component
const logoImage = require('./LOGO1.png');
const userIcon = require('./jurin.jpg'); // Replace with your user icon image

export default function FeedScreen({ navigation }) {
  const [feedContent, setFeedContent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedContent();
  }, []);

  const fetchFeedContent = async () => {
    try {
      const response = await axios.get('http://192.168.1.187:3000/feedcontent');
      console.log('Feed content response:', response.data); // Log the response
      setFeedContent(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching feed content:', error);
      setLoading(false);
    }
  };

  const handleContentClick = (contentId, contentTitle) => {
    console.log('Clicked contentId:', contentId); // Log contentId before navigating
    navigation.navigate('Tasks', { contentId, contentTitle });
  };

  const handleProfileClick = () => {
    navigation.navigate('Profile'); // Navigate to ProfileScreen
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={logoImage} style={styles.logo} />
        <TouchableOpacity onPress={handleProfileClick}>
          <Image source={userIcon} style={styles.userIcon} />
        </TouchableOpacity>
      </View>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Feed</Text>
        <View style={styles.iconContainer}>
          <Icon name="bell" size={25} style={styles.icon} color={'#847f7f'} marginRight={20} />
          <Icon name="list" size={25} style={styles.icon} color={'#847f7f'} marginRight={10} />
        </View>
      </View>
      <TextInput
        style={styles.searchBar}
        placeholder="Search..."
        placeholderTextColor={'grey'}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#A01F36" style={{ marginTop: 20 }} />
      ) : (
        <ScrollView style={styles.contentContainer}>
          {feedContent.map((item, index) => (
            <TouchableOpacity key={index} onPress={() => handleContentClick(item.contentid, item.title)}>
              <View style={styles.contentItem}>
                <Text style={styles.contentTitle}>{item.title}</Text>
                <Text style={styles.contentSubtitle}>{item.captions}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  logo: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
    marginLeft: -50,
    marginRight: -50,
    marginBottom: -105,
    marginTop: -50,
  },
  userIcon: {
    marginTop: 30,
    marginBottom: -20,
    width: 35,
    height: 35,
    borderRadius: 35 / 2,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 5,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  iconContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  searchBar: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 50,
    marginTop: 16,
    height: 50,
  },
  contentContainer: {
    marginTop: 25,
  },
  contentItem: {
    marginBottom: 20,
    borderColor: '#A01F36',
    backgroundColor: '#A01F36',
    borderWidth: 2,
    height: 100,
    borderRadius: 10,
    padding: 10,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  contentSubtitle: {
    fontSize: 14,
    color: 'white',
    paddingTop: 5,
  },
});
