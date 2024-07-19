import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBuilding, faUserCheck, faChevronLeft, faPlus, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';

const logoImage = require('../Images/LOGO1.png');
const userIcon = require('../Images/Vernon.jpg');

const LEFT_OFFSET = 10; // Adjust this value to move the dropdown more to the left

export default function ContentScreen({ route, navigation }) {
  const { grade, section, grades_ID, dept_ID } = route.params;

  const [content, setContent] = useState([]);
  const [grades, setGrades] = useState([]);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  const addIconRef = useRef(null);

  useEffect(() => {
    fetchContent();
    fetchGrades();
  }, []);

  const fetchContent = async () => {
    const url = `http://192.168.0.238:5000/content/${grades_ID}`;
    try {
      const response = await axios.get(url);
      const data = Array.isArray(response.data) ? response.data : [];
      setContent(data);
    } catch (error) {
      console.error(`Error fetching content from URL: ${url}`, error);
      Alert.alert("Error", "Failed to fetch content. Please try again later.");
      setContent([]);
    }
  };

  const fetchGrades = async () => {
    const url = `http://192.168.0.238:5000/grades/${dept_ID}`;
    try {
      const response = await axios.get(url);
      const data = Array.isArray(response.data) ? response.data : [];
      setGrades(data);
    } catch (error) {
      console.error(`Error fetching grades from URL: ${url}`, error);
      Alert.alert("Error", "Failed to fetch grades. Please try again later.");
      setGrades([]);
    }
  };

  const handleOpenDropdown = () => {
    if (addIconRef.current) {
      addIconRef.current.measure((x, y, width, height, pageX, pageY) => {
        setDropdownPosition({ top: pageY + height, left: pageX - LEFT_OFFSET }); // Adjust left position
      });
    }
    setDropdownVisible(!isDropdownVisible);
  };

  const handleCloseDropdown = () => {
    setDropdownVisible(false);
  };

  const handleNavigate = (screen) => {
    handleCloseDropdown();
    navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
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
          <Text style={styles.backText}>Back to Grades</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Content</Text>
          <TouchableOpacity onPress={handleOpenDropdown} ref={addIconRef}>
            <FontAwesomeIcon icon={faPlus} size={25} style={styles.addIcon} />
          </TouchableOpacity>
          <TouchableOpacity>
            <FontAwesomeIcon icon={faMagnifyingGlass} size={25} style={styles.searchIcon} />
          </TouchableOpacity>
        </View>
        <View style={styles.contentCard}>
          <Text style={styles.cardTitle}>{grade}</Text>
          <Text style={styles.cardSubTitle}>{section}</Text>
        </View>
        <View style={styles.line} />
        <View style={styles.contentList}>
          {grades.length > 0 ? grades.map((item, index) => (
            <TouchableOpacity key={item.grade + item.section} style={styles.gradeItem} onPress={() => {/* Add your navigation logic here */}}>
              <Text style={styles.itemTitle}>{item.grade} - {item.section}</Text>
            </TouchableOpacity>
          )) : (
            <Text style={styles.noContentText}>No grades available</Text>
          )}
        </View>
        <View style={styles.line} />
        <View style={styles.contentList}>
          {content.length > 0 ? content.map((item) => (
            <View key={item.id} style={styles.contentItem}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemTime}>{item.time}</Text>
              <FontAwesomeIcon icon={item.icon} size={25} style={styles.itemIcon} />
            </View>
          )) : (
            <Text style={styles.noContentText}>No content available</Text>
          )}
        </View>
      </ScrollView>

      {isDropdownVisible && (
        <View style={[styles.dropdown, { top: dropdownPosition.top, left: dropdownPosition.left }]}>
          <TouchableOpacity style={styles.dropdownButton} onPress={() => handleNavigate('Task')}>
            <MaterialIcons name="assignment" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Task</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dropdownButton} onPress={() => handleNavigate('Reminder')}>
            <MaterialIcons name="alarm" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Reminder</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dropdownButton} onPress={() => handleNavigate('Announcement')}>
            <MaterialIcons name="notifications" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Announcement</Text>
          </TouchableOpacity>
        </View>
      )}
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
    marginTop: -100,
  },
  iconContainer: {
    flexDirection: 'row',
  },
  icon: {
    marginHorizontal: 12,
    marginVertical: 25,
    paddingTop: 30,
  },
  userIcon: {
    marginTop: 25,
    marginBottom: -20,
    width: 35,
    height: 35,
    borderRadius: 35 / 2,
  },
  backContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: -30,
  },
  backIcon: {
    marginRight: 8,
  },
  backText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  addIcon: {
    color: '#847f7f',
    marginLeft: 110,
  },
  searchIcon: {
    color: '#847f7f',
    marginLeft: 10,
    marginRight: 10,
  },
  contentCard: {
    height: 100,
    backgroundColor: '#b23e3e',
    borderRadius: 20,
    padding: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    paddingBottom: 10,
  },
  cardSubTitle: {
    fontSize: 16,
    color: '#fff',
  },
  contentList: {
    paddingHorizontal: 16,
  },
  gradeItem: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    backgroundColor: '#eee',
  },
  contentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemTime: {
    fontSize: 14,
    color: '#666',
  },
  itemIcon: {
    color: '#000',
  },
  noContentText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  line: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 16,
  },
  dropdown: {
    position: 'absolute',
    width: 190,
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff',
    elevation: 5,
    zIndex: 1000,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    width: '100%',
    marginBottom: 12,
  },
  buttonIcon: {
    marginRight: 10,
    backgroundColor: '#b23e3e',
    borderRadius: 25,
    padding: 10,
  },
  buttonText: {
    color: 'black',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'left',
  },
});
