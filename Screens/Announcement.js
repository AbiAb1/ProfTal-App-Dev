//Announcement.js
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const AnnouncementScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Announcements</Text>
      <Text style={styles.description}>Here you can manage announcements.</Text>
      {/* Add functionality to manage announcements here */}
      <Button title="Go Back" onPress={() => navigation.goBack()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
  },
});

export default AnnouncementScreen;
