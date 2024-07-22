import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeUserID = async (userID) => {
  try {
    await AsyncStorage.setItem('UserID', userID.toString());
  } catch (error) {
    console.error('Error storing UserID:', error);
  }
};

export const getUserID = async () => {
  try {
    const storedUserID = await AsyncStorage.getItem('UserID');
    if (storedUserID !== null) {
      return parseInt(storedUserID);
    }
    return null; // or handle if UserID is not found
  } catch (error) {
    console.error('Error retrieving UserID:', error);
    return null; // or handle error
  }
};