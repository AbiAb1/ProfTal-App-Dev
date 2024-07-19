import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, TextInput, Alert, Modal, ActivityIndicator } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBuilding, faUserCheck, faChevronLeft, faCalendarDays, faFile, faTimes } from '@fortawesome/free-solid-svg-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';

const logoImage = require('../Images/LOGO1.png');
const userIcon = require('../Images/Vernon.jpg');

// Replace with your actual API URL
const API_URL = 'https://192.168.0.238:5000/tasks';
const FILE_UPLOAD_URL = 'https://192.168.0.238:5000/uploadfile';

const TaskScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dueDate;
    setShowDatePicker(false);
    setDueDate(currentDate);
  };

  const handleAttachFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({});
      if (!res.canceled && res.assets && res.assets.length > 0) {
        const { uri, name, type } = res.assets[0];
        setAttachments((prevAttachments) => [...prevAttachments, { uri, name, type }]);
        Alert.alert('Success', 'File attached successfully!');
      } else {
        Alert.alert('Info', 'No file selected.');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to attach file.');
      console.error('Error picking document:', err);
    }
  };

  const handleRemoveAttachment = (index) => {
    setAttachments((prevAttachments) => prevAttachments.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    if (!title || !content) {
      Alert.alert('Error', 'Title and Content are required');
      return;
    }

    setLoading(true);

    const taskData = {
      title,
      due_date: dueDate.toISOString().split('T')[0], // Format date to YYYY-MM-DD
      content,
    };

    try {
      // Create the task
      const response = await axios.post(API_URL, taskData);
      console.log('Task created:', response.data);

      // Process each attachment
      await Promise.all(attachments.map(async (attachment) => {
        const formData = new FormData();
        formData.append('task_ID', response.data.id); // Ensure your server accepts this field
        formData.append('file', {
          uri: attachment.uri,
          type: attachment.type || 'application/octet-stream',
          name: attachment.name,
        });

        // Upload the file
        await axios.post(FILE_UPLOAD_URL, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }));

      Alert.alert('Success', 'Task published successfully!');
      setTitle('');
      setDueDate(new Date());
      setContent('');
      setAttachments([]);
    } catch (error) {
      console.error('Error publishing task:', error);
      Alert.alert('Error', 'Failed to publish task');
    } finally {
      setLoading(false);
    }
  };

  const isImageFile = (uri) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
    const extension = uri.split('.').pop().toLowerCase();
    return imageExtensions.includes(extension);
  };

  const handleViewAttachment = (attachment) => {
    const { uri, name } = attachment;
    if (isImageFile(uri)) {
      setModalContent(<Image source={{ uri }} style={styles.modalImage} />);
    } else {
      setModalContent(
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>File: {name}</Text>
        </View>
      );
    }
    setModalVisible(true);
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
          <Text style={styles.backText}>Back to Contents</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Create A New Task!</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
          />
          <View style={styles.dueDateContainer}>
            <TextInput
              style={styles.input}
              placeholder="Due Date"
              value={dueDate.toLocaleDateString()}
              editable={false}
            />
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <FontAwesomeIcon icon={faCalendarDays} size={25} style={styles.calendarIcon} />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={dueDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
          </View>
          <TextInput
            style={styles.input}
            placeholder="Content"
            value={content}
            onChangeText={setContent}
            multiline
          />
          <View style={styles.attachmentContainer}>
            <View style={styles.attachmentTitleContainer}>
              <Text style={styles.attachmentTitle}>Attachments</Text>
            </View>
            {attachments.length > 0 ? (
              attachments.map((attachment, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.attachmentCard}
                  onPress={() => handleViewAttachment(attachment)}
                >
                  {isImageFile(attachment.uri) ? (
                    <Image source={{ uri: attachment.uri }} style={styles.attachmentImage} />
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faFile} size={24} style={styles.attachmentIcon} />
                      <Text style={styles.attachmentText}>{attachment.name}</Text>
                    </>
                  )}
                  <TouchableOpacity onPress={() => handleRemoveAttachment(index)}>
                    <FontAwesomeIcon icon={faTimes} size={20} style={styles.removeIcon} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noAttachmentText}>No Files Attached.</Text>
            )}
            <View style={styles.line} />
            <TouchableOpacity style={styles.addButton} onPress={handleAttachFile}>
              <Text style={styles.addButtonText}>Attach A File</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.publishButtonContainer}>
          <TouchableOpacity style={styles.publishButton} onPress={handlePublish}>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.publishButtonText}>Publish!!</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContentContainer}>
            {modalContent}
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

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
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarIcon: {
    marginLeft: 8,
  },
  attachmentContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  attachmentTitleContainer: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  attachmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#b30000',
  },
  addButton: {
    width: '80%',
    backgroundColor: '#b30000',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    marginVertical: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  attachmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginTop: 10,
    width: '100%',
  },
  attachmentImage: {
    width: 50,
    height: 50,
    marginRight: 8,
  },
  attachmentIcon: {
    marginRight: 8,
  },
  attachmentText: {
    flex: 1,
  },
  removeIcon: {
    marginLeft: 8,
  },
  noAttachmentText: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginVertical: 10,
  },
  publishButtonContainer: {
    marginBottom: 16,
  },
  publishButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  publishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  line: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 16,
    width: '100%', 
  },
});

export default TaskScreen;
