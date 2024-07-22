

import React, { useEffect } from 'react';
import { View, Text, Image } from 'react-native';

export default function LoaderScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Image
        source={require('./LOGO1.png')}
        style={{ width: 500, height: 100, marginBottom: 80 }} // Adjust the width and height as needed
      />

      <View
        style={{
          position: 'absolute',
          bottom: 100,
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 15, fontWeight: 'bold' }}>By</Text>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 10 }}>QWERTY</Text>
      </View>
    </View>
  );
}
