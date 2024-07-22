import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as DocumentPicker from 'expo-document-picker';
import { getUserID } from './utils/asyncStorage';
import axios from 'axios';

const logoImage = require('./LOGO1.png');
const userIcon = require('./jurin.jpg');

const TaskDetailsScreen = ({ route }) => {
  const { task = {}, ContentID, TaskID } = route.params;
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [submittedDocuments, setSubmittedDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [Status, setStatus] = useState(false);
  const [userID, setUserID] = useState(null);
  const [unsubmittedDocuments, setUnsubmittedDocuments] = useState([]);
  
  useEffect(() => {
    const fetchUserID = async () => {
      const storedUserID = await getUserID();
      if (storedUserID) {
        setUserID(storedUserID);
        fetchSubmittedDocuments(storedUserID);
        fetchUnsubmittedDocuments(storedUserID);
      } else {
        console.error('UserID not found');
      }
    };

    fetchUserID();
  }, []); 

  const fetchSubmittedDocuments = async (userID) => {
    try {
      const response = await fetch(`http://192.168.1.187:3000/submittedDocuments/${userID}/${ContentID}/${TaskID}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch submitted documents. Status: ${response.status}`);
      }
      const data = await response.json();
      setSubmittedDocuments(data);
      setStatus(data.length > 0);
    } catch (err) {
      console.error('Error fetching submitted documents:', err);
    }
  };
  
  const fetchUnsubmittedDocuments = async (userID) => {
    setLoading(true); // Optional: Set loading state if needed
    try {
      const response = await fetch(`http://192.168.1.187:3000/unsubmittedDocuments/${userID}/${ContentID}/${TaskID}/`);
      const data = await response.json();
      const unsubmittedDocs = data.filter(doc => doc.Status === 0); // Filter documents where Status = 0
      setUnsubmittedDocuments(unsubmittedDocs); // Update state with filtered unsubmitted documents
    } finally {
      setLoading(false); // Optional: Reset loading state if needed
    }
  };

  const openDocumentPicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ multiple: true });
      console.log('Selected document:', result);
      if (result.type !== 'cancel') {
        const newDocuments = result.assets ? result.assets : [result];
        setSelectedDocuments([...selectedDocuments, ...newDocuments]);
      }
    } catch (err) {
      console.error('Error picking document:', err);
    }
  };

  const handleSubmit = async () => {
    try {
      if (selectedDocuments.length === 0) {
        Alert.alert('Submit', 'Are you sure you want to submit?', [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Submit',
            onPress: async () => {
              try {
                const formData = new FormData();
  
                // Append metadata
                formData.append('UserID', userID);
                formData.append('ContentID', ContentID);
                formData.append('TaskID', TaskID);
  
                // Submit the documents
                const response = await fetch('http://192.168.1.187:3000/insertDocuments', {
                  method: 'POST',
                  body: formData,
                  headers: {
                    'Content-Type': 'multipart/form-data',
                  },
                });
  
                if (!response.ok) {
                  const errorText = await response.text();
                  throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
                }
  
                // Update status to true (documents submitted successfully)
                setStatus(true);
  
                // Fetch updated lists of documents
                fetchUnsubmittedDocuments(userID);
                fetchSubmittedDocuments(userID);
  
                setSelectedDocuments([]);
              } catch (err) {
                console.error('Error submitting documents:', err);
              }
            },
          },
        ]);
      } else {
        // Append selected documents if there are any
        const formData = new FormData();
        selectedDocuments.forEach(doc => {
          formData.append('documents', {
            uri: doc.uri,
            name: doc.name,
            type: doc.mimeType,
          });
        });
  
        // Append metadata
        formData.append('UserID', userID);
        formData.append('ContentID', ContentID);
        formData.append('TaskID', TaskID);
  
        // Submit the documents
        const response = await fetch('http://192.168.1.187:3000/insertDocuments', {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
  
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
        }
  
        // Update status to true (documents submitted successfully)
        setStatus(true);
  
        // Fetch updated lists of documents
        fetchUnsubmittedDocuments(userID);
        fetchSubmittedDocuments(userID);
  
        setSelectedDocuments([]);
      }
    } catch (err) {
      console.error('Error submitting documents:', err);
    }
  };

  const handleUnsubmit = async () => {
    if (submittedDocuments.length > 0) {
      Alert.alert(
        'Unsubmit',
        'Are you sure you want to unsubmit?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Unsubmit',
            onPress: async () => {
              try {
                const response = await fetch('http://192.168.1.187:3000/unsubmitDocument', {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    UserID: userID,
                    ContentID: ContentID,
                    TaskID: TaskID,
                  }),
                });

                if (!response.ok) {
                  throw new Error(`Failed to unsubmit document. Status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Unsubmit successful:', data.message);

                setStatus(false); // Update status to false (no submitted documents)
                fetchSubmittedDocuments(userID); // Refresh the submitted documents list
                fetchUnsubmittedDocuments(userID); // Refresh the unsubmitted documents list

              } catch (err) {
                console.error('Error unsubmitting document:', err.message);
              }
            },
          },
        ],
        { cancelable: false }
      );
    }
  };

  const handleRemoveDocument = async (userID, contentID, taskID, documentID) => {
    const url = `http://192.168.1.187:3000/deleteDocument/${userID}/${contentID}/${taskID}/${documentID}`;
    try {
      const response = await axios.delete(url);
      // Assuming your backend API returns some data upon successful deletion
      // You may handle the response data or log it for verification
      console.log('Document removed successfully:', response.data);
      
      // After successful deletion, update the documents list
      fetchUnsubmittedDocuments(userID);
      fetchSubmittedDocuments(userID);

      // Alternatively, update the state directly if needed
      // const updatedUnsubmittedDocs = unsubmittedDocuments.filter(doc => doc.id !== documentID);
      // setUnsubmittedDocuments(updatedUnsubmittedDocs);
      
      // You can also clear selectedDocuments if it matches the removed document
      const updatedSelectedDocuments = selectedDocuments.filter(doc => doc.id !== documentID);
      setSelectedDocuments(updatedSelectedDocuments);
      
    } catch (error) {
      console.error('Error removing document:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={logoImage} style={styles.logo} />
        <TouchableOpacity>
          <Image source={userIcon} style={styles.userIcon} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Content</Text>
          <View style={styles.line} />
        </View>
        <View style={styles.taskTitleContainer}>
          <Text style={styles.taskTitle} numberOfLines={2}>{task.Title}</Text>
          {/* Render task icon function */}
        </View>
        <View style={styles.dueDateContainer}>
          <Text style={styles.footerText}>Due: {task.Duedate}</Text>
        </View>
        <View style={styles.taskDetails}>
          <Text style={styles.taskContent}>{task.taskContent}</Text>
        </View>
        {task.Type === 'Task' && (
          <View style={styles.outputContainer}>
            <View style={styles.outputBox}>
              <View style={styles.outputTitleContainer}>
                <Text style={styles.outputTitle}>Documents</Text>
                <TouchableOpacity style={styles.plusIconContainer} onPress={openDocumentPicker}>
                  <Icon name="plus" size={20} color="#666" />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {submittedDocuments.length === 0 && unsubmittedDocuments.length === 0 ? (
                  <Text style={styles.noDocumentText}>No documents available.</Text>
                ) : (
                  <View>
                    {Status ? (
                      <View style={styles.sectionContainer}>
                        <View style={styles.documentList}>
                          {submittedDocuments.map((document, index) => (
                            <View key={index} style={styles.documentContainer}>
                              <Text style={styles.documentName}>{document.name}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    ) : (
                      <View style={styles.sectionContainer}>
                        <View style={styles.documentList}>
                          {unsubmittedDocuments.map((document, index) => (
                            <View key={index} style={styles.documentContainer}>
                              <Text style={styles.documentName}>{document.name}</Text>
                              <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => handleRemoveDocument(userID, ContentID, TaskID, document.id)}
                              >
                                <Icon name="times-circle" size={20} color="#fff" />
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        )}
      </ScrollView>
      {task.Type === 'Task' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={Status ? handleUnsubmit : handleSubmit}
            // Always keep it enabled
          >
            <Text style={styles.submitButtonText}>{Status ? 'Unsubmit' : 'Submit'}</Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  logo: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
    marginLeft: -50,
    marginRight: -50,
    marginBottom: -105,
    marginTop: -30,
  },
  userIcon: {
    marginTop: 48,
    marginBottom: -20,
    width: 35,
    height: 35,
    borderRadius: 35 / 2,
  },
  scrollContainer: {
    paddingHorizontal: 20,
  },
  titleContainer: {
    marginTop: 10,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  line: {
    width: '100%',
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 20,
  },
  taskTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  taskTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  taskDetails: {
    marginBottom: 10,
  },
  taskContent: {
    fontSize: 20,
    color: '#666',
  },
  footerText: {
    fontSize: 16,
    color: '#999',
    paddingBottom: 20,
  },
  outputContainer: {
    marginTop: 50,
    width: '100%', // Adjust the width as needed
    alignItems: 'center',
  },
  outputBox: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    width: '100%',
  },
  outputTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  outputTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#A01F36',
    flex: 1,
  },
  plusIconContainer: {
    padding: 5,
    borderRadius: 20,
    backgroundColor: 'transparent',
    marginLeft: 10,
  },
  documentList: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  documentContainer: {
    backgroundColor: '#A9A9A9',
    padding: 10,
    borderRadius: 50,
    marginVertical: 5,
    alignItems: 'center',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  documentName: {
    fontSize: 18,
    color: '#fff',
    flex: 1,
    marginLeft:10,
  },
  removeButton: {
    marginLeft: 10,
  },
  noDocumentText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 30,
    margin: 5,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#A01F36',
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TaskDetailsScreen;
