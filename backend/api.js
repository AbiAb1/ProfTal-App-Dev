// api.js
import axios from 'axios';

const API_BASE_URL = 'http://192.168.254.176:5000/addtasks'; // Change to your server URL if different

// Function to create a new task
export const createTask = async (taskData) => {
    try {
      const response = await axios.post(API_BASE_URL, taskData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };