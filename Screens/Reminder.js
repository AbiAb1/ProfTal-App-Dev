import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, ScrollView, Image, TouchableOpacity, Modal, Animated, Alert } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBuilding, faUserCheck, faChevronLeft, faCalendarDays, faPlus, faClose } from '@fortawesome/free-solid-svg-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';

const logoImage = require('../Images/LOGO1.png');
const userIcon = require('../Images/Vernon.jpg'); // Replace with your user icon image

const ReminderScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [departmentName, setDepartmentName] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [departments, setDepartments] = useState([]);

  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('http://192.168.0.238:5000/departments');
      setDepartments(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to fetch departments. Please try again later.");
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

  const handlePublish = async () => {
    try {
      await axios.post('http://192.168.0.238:5000/addDepartment', {
        dept_name: departmentName,
        dept_info: additionalInfo,
      });
      fetchDepartments();
      handleCloseModal();
      setDepartmentName('');
      setAdditionalInfo('');
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to add department. Please try again later.");
    }
  };

  const handleCreateReminder = () => {
    // Handle the logic for creating a reminder here
    console.log('Reminder Created:', { title, description, dueDate });
    setTitle('');
    setDescription('');
    setDueDate(new Date());
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dueDate;
    setShowDatePicker(false);
    setDueDate(currentDate);
  };

  const modalStyle = {
    transform: [
      {
        scale: animation,
      },
    ],
    opacity: animation,
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
        <Text style={styles.title}>Reminder</Text>
      </View>

      {/* Button to open the add reminder modal */}
      <TouchableOpacity style={styles.addButton} onPress={handleOpenModal}>
        <FontAwesomeIcon icon={faPlus} size={25} color="#fff" />
      </TouchableOpacity>

      {/* Modal for adding a new department */}
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
            <Text style={styles.modalTitle}>Create New Reminder!</Text>
            <Text style={styles.description}>Fill in the details to create a new reminder.</Text>
            <TextInput
              style={styles.input}
              placeholder="Reminder Title"
              value={title}
              onChangeText={setDepartmentName}
            />
            <TextInput
              style={[styles.input, { height: 150, marginTop: 10, marginBottom: 40 }]}
              placeholder="Reminder Description"
              value={description}
              onChangeText={setAdditionalInfo}
            />
            <TouchableOpacity style={styles.publishButton} onPress={handlePublish}>
              <Text style={styles.publishButtonText}>Publish</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
    marginBottom: 16,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  goBackButton: {
    marginTop: 20,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarIcon: {
    marginLeft: 8,
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
  publishButton: {
    width: '90%',
    height: 50,
    backgroundColor: '#5DB075',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 5,
  },
  publishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingTop: 3,
  },
});

export default ReminderScreen;
