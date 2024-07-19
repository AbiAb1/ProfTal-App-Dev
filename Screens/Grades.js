import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TextInput, ScrollView, TouchableOpacity, Modal, Animated, Alert } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBuilding, faUserCheck, faPlus, faChevronLeft, faClose } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const logoImage = require('../Images/LOGO1.png');
const userIcon = require('../Images/Vernon.jpg'); // Replace with your user icon image

export default function GradesScreen({ route, navigation }) {
  const { department } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [grades, setGrades] = useState([]);
  const [grade, setGrade] = useState('');
  const [section, setSection] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const response = await axios.get(`http://192.168.0.238:5000/grades/${department.dept_ID}`);
      setGrades(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to fetch grades. Please try again later.");
    }
  };

  const handleOpenModal = () => {
    setModalVisible(true);
    Animated.timing(animation, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseModal = () => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };

  const handleAddGrade = async () => {
    try {
      const response = await axios.post('http://192.168.0.238:5000/addGrade', {
        grade,
        section,
        dept_ID: department.dept_ID,
      });
      if (response.status === 200) {
        fetchGrades(); // Fetch the updated list of grades
        handleCloseModal();
        setGrade('');
        setSection('');
      } else {
        Alert.alert("Error", "Failed to add grade. Please try again later.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to add grade. Please try again later.");
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const handleGradePress = (grade) => {
    navigation.navigate('Content', { grades_ID: grade.grades_ID });
  };

  const filteredGrades = grades.filter(gradeItem =>
    gradeItem.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gradeItem.section.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const modalStyle = {
    transform: [
      {
        scale: animation,
      },
    ],
    opacity: animation,
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
          <Text style={styles.backText}>Back to Departments</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Grades for {department.dept_name}</Text>
        </View>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchBar}
            placeholder="Search grades..."
            placeholderTextColor="#847f7f"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
        <View style={styles.gradeList}>
          {filteredGrades.map((grade) => (
            <TouchableOpacity
              key={grade.grades_ID}
              style={styles.gradeItem}
              onPress={() => handleGradePress(grade)}
            >
              <Text style={styles.gradeText}>{grade.grade}</Text>
              <Text style={styles.sectionText}>{grade.section}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.addButton} onPress={handleOpenModal}>
        <FontAwesomeIcon icon={faPlus} size={25} color="#fff" />
      </TouchableOpacity>
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <Animated.View style={[styles.modalView, modalStyle]}>
            <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
              <FontAwesomeIcon icon={faClose} size={25} color="#ccc" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create A New Grade!</Text>
            <TextInput
              style={styles.input}
              placeholder="Grade"
              value={grade}
              onChangeText={setGrade}
            />
            <TextInput
              style={styles.input}
              placeholder="Section"
              value={section}
              onChangeText={setSection}
            />
            <TouchableOpacity style={styles.addButton2} onPress={handleAddGrade}>
              <Text style={styles.addButtonText}>Add Grade</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>  
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
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchBar: {
    height: 50,
    borderColor: '#847f7f',
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 10,
    color: '#000',
  },
  gradeList: {
    marginBottom: 16,
  },
  gradeItem: {
    height: 110,
    paddingVertical: 10,
    paddingLeft: 15,
    borderWidth: 1,
    marginBottom: 12,
    borderRadius: 20,
    borderColor: '#b23e3e',
    backgroundColor: '#b23e3e',
  },
  gradeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  sectionText: {
    fontSize: 14,
    color: '#fff',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#737373',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  modalTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 55,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  addButton2: {
    width: '90%',
    height: 50,
    backgroundColor: '#5DB075',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingTop: 3,
  },
});
