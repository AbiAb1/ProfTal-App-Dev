import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TextInput, Animated, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';

const logoImage = require('./LOGO1.png');
const userIcon = require('./jurin.jpg'); // Replace with your user icon image

export default function TaskScreen({ navigation, route }) {
  const { contentId, contentTitle, UserID } = route.params; // Ensure UserID is accessible from route.params
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const searchWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchTasks(contentId);
  }, [contentId]);

  const fetchTasks = async (contentId) => {
    try {
      const response = await axios.get(`http://192.168.1.187:3000/tasks/${contentId}`);
      console.log('Tasks response:', response.data); // Log the response
      setTasks(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
      setLoading(false);
    }
  };

  const handleSearchIconClick = () => {
    setIsSearchVisible(!isSearchVisible);
    Animated.timing(searchWidth, {
      toValue: isSearchVisible ? 0 : 200,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const renderTaskIcon = (type) => {
    let iconName;
    if (type === 'Task') {
      iconName = 'tasks';
    } else if (type === 'Reminder') {
      iconName = 'calendar';
    } else if (type === 'Announcement') {
      iconName = 'bell';
    }

    return (
      <View style={styles.iconCircle}>
        <Icon name={iconName} size={22} color="#fff" />
      </View>
    );
  };

  const filteredTasks = tasks.filter(task => task.Title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={logoImage} style={styles.logo} />
        <Image source={userIcon} style={styles.userIcon} />
      </View>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Content</Text>
        <View style={styles.iconContainer}>
          <Animated.View style={[styles.searchInputContainer, { width: searchWidth }]}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search tasks..."
              placeholderTextColor={'grey'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </Animated.View>
          <TouchableOpacity onPress={handleSearchIconClick}>
            <Icon name="search" size={25} style={styles.icon} color={'#847f7f'} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.contentItem}>
        <Text style={styles.contentTitle}>{contentTitle}</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#A01F36" style={{ marginTop: 20 }} />
      ) : tasks.length === 0 ? (
        <View style={styles.noTasksContainer}>
          <Text style={styles.noTasksText}>No tasks right now. Your admin will upload something soon.</Text>
        </View>
      ) : (
        <ScrollView style={styles.contentContainer}>
          {filteredTasks.map((task, index) => (
            <TouchableOpacity
            key={index}
            style={styles.taskItem}
            onPress={() => {
              console.log(`Clicked Task:`, task); // Log the entire task object
              console.log(`Clicked TaskID: ${task.TaskID}`);
              navigation.navigate('TaskDetails', { 
                task,
                UserID,       // Pass UserID to TaskDetailsScreen
                ContentID: contentId, // Pass ContentID to TaskDetailsScreen
                TaskID: task.TaskID, // Pass TaskID to TaskDetailsScreen
              });
            }}
          >
            <View style={styles.taskTextContainer}>
              <Text style={styles.taskTitle}>{task.Title}</Text>
              <Text style={styles.taskDueDate}>{task.Duedate}</Text>
            </View>
            {renderTaskIcon(task.Type)}
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
    alignItems: 'center',
  },
  searchInputContainer: {
    overflow: 'hidden',
    borderColor: 'E8E8E8',
    borderWidth: 0,
  },
  searchInput: {
    height: 40,
    margin: 10,
    backgroundColor: '#E8E8E8',
    borderRadius: 50,
    paddingLeft: 10,
  },
  contentItem: {
    marginBottom: 20,
    borderColor: '#A01F36',
    backgroundColor: '#A01F36',
    borderWidth: 2,
    height: 200,
    borderRadius: 10,
    padding: 10,
  },
  contentTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  contentContainer: {
    marginTop: 25,
  },
  taskItem: {
    marginBottom: 10,
    borderColor: '#E8E8E8',
    backgroundColor: '#E8E8E8',
    borderWidth: 2,
    height: 100,
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskTextContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  taskDueDate: {
    fontSize: 14,
    color: 'black',
    paddingTop: 30,
  },
  noTasksContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  noTasksText: {
    fontSize: 18,
    color: 'grey',
    textAlign: 'center',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 50,
    backgroundColor: '#A01F36',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
