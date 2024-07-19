import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const logoImage = require('../Images/LOGO1.png');
const userIcon = require('../Images/Vernon.jpg'); // Replace with your user icon image

export default function FeedScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={logoImage} style={styles.logo} />
        <Image source={userIcon} style={styles.userIcon} />
      </View>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Feed</Text>
        <View style={styles.iconContainer}>
          <Icon name="bell" size={25} style={styles.icon} color={'#847f7f'} marginRight={5}/>
          <Icon name="list" size={25} style={styles.icon} color={'#847f7f'} />
        </View>
      </View>
      <TextInput
        style={styles.searchBar}
        placeholder="Search..."
      />
      <ScrollView style={styles.contentContainer}>
        <View style={styles.contentItem}>
          <Text style={styles.contentTitle}>Content Title</Text>
          <Text style={styles.contentSubtitle}>Content Sub Title</Text>
        </View>
        <View style={styles.contentItem}>
          <Text style={styles.contentTitle}>Content Title</Text>
          <Text style={styles.contentSubtitle}>Content Sub Title</Text>
        </View>
        <View style={styles.contentItem}>
          <Text style={styles.contentTitle}>Content Title</Text>
          <Text style={styles.contentSubtitle}>Content Sub Title</Text>
        </View>
        <View style={styles.contentItem}>
          <Text style={styles.contentTitle}>Content Title</Text>
          <Text style={styles.contentSubtitle}>Content Sub Title</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
    borderRadius: 8,
    marginTop: 16,
  },
  contentContainer: {
    marginTop: 25,
  },
  contentItem: {
    marginBottom: 20,
    borderColor: '#c26969',
    backgroundColor: '#c26969',
    borderWidth: 2,
    height: 100,
    borderRadius: 10,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginLeft: 10,
    color: 'white',
  },
  contentSubtitle: {
    fontSize: 14,
    color: 'white',
    marginLeft: 10,
  },
});