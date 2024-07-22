// FileUploadScreen.js

import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TextInput } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import axios from 'axios';

export default function FileUploadScreen() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const pickFile = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      setFile(res);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        setMessage('User canceled the file picker');
      } else {
        setMessage('Unknown error: ' + JSON.stringify(err));
      }
    }
  };

  const uploadFile = async () => {
    if (file) {
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.type,
        name: file.name,
      });

      try {
        const response = await axios.post('http://192.168.1.187/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setMessage(response.data.message);
      } catch (error) {
        setMessage('File upload failed: ' + error.message);
      }
    } else {
      setMessage('Please select a file first');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>File Upload Screen</Text>
      <Button title="Pick a File" onPress={pickFile} />
      {file && (
        <View style={styles.fileInfo}>
          <Text>File Name: {file.name}</Text>
          <Text>File Type: {file.type}</Text>
          <Text>File Size: {file.size}</Text>
        </View>
      )}
      <Button title="Upload File" onPress={uploadFile} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  fileInfo: {
    marginVertical: 16,
  },
  message: {
    marginTop: 16,
    color: 'red',
  },
});
