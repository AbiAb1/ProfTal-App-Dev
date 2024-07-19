import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBuilding, faUserCheck } from '@fortawesome/free-solid-svg-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';

const logoImage = require('../Images/LOGO1.png');
const userIcon = require('../Images/Vernon.jpg'); // Replace with your user icon image

export default function DashboardScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={logoImage} style={styles.logo} />
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('Department')}>
            <FontAwesomeIcon 
              icon={faBuilding} 
              size={25} 
              style={styles.icon} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Users')}>
          <FontAwesomeIcon 
            icon={faUserCheck} 
            size={35} 
            style={styles.icon} 
          />
          </TouchableOpacity>
          <Image source={userIcon} style={styles.userIcon} />
        </View>
      </View>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.greeting}>Good afternoon, ADMIN!</Text>
      </View>
      <View style={styles.kpiContainer}>
        <View style={styles.kpiRow}>
          <View style={styles.kpiItem}>
            <Text style={styles.kpiTitle}>KPI 1</Text>
            <Text style={styles.kpiValue}>Value</Text>
          </View>
          <View style={styles.kpiItem}>
            <Text style={styles.kpiTitle}>KPI 2</Text>
            <Text style={styles.kpiValue}>Value</Text>
          </View>
        </View>
        <View style={styles.kpiRow}>
          <View style={styles.kpiItem}>
            <Text style={styles.kpiTitle}>KPI 3</Text>
            <Text style={styles.kpiValue}>Value</Text>
          </View>
          <View style={styles.kpiItem}>
            <Text style={styles.kpiTitle}>KPI 4</Text>
            <Text style={styles.kpiValue}>Value</Text>
          </View>
        </View>
      </View>
      <View style={styles.chartWrapper}>
        <Text style={styles.chartTitle}>Line Chart</Text>
        <LineChart
          data={{
            labels: ['January', 'February', 'March', 'April', 'May', 'June'],
            datasets: [
              {
                data: [20, 45, 28, 80, 99, 43],
              },
            ],
          }}
          width={330} // Adjust width according to your layout
          height={200}
          yAxisLabel="$"
          chartConfig={{
            backgroundColor: '#e26a00',
            backgroundGradientFrom: '#8c0a0a',
            backgroundGradientTo: '#ffa726',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </View>
      <View style={styles.chartWrapper}>
        <Text style={styles.chartTitle}>Bar Chart</Text>
        <BarChart
          data={{
            labels: ['January', 'February', 'March', 'April', 'May', 'June'],
            datasets: [
              {
                data: [20, 45, 28, 80, 99, 43],
              },
            ],
          }}
          width={330} // Adjust width according to your layout
          height={200}
          yAxisLabel="$"
          chartConfig={{
            backgroundColor: '#e26a00',
            backgroundGradientFrom: '#8c0a0a',
            backgroundGradientTo: '#ffa726',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </View>
      <View style={styles.largeChart}>
        <Text style={styles.chartTitle}>Large Line Chart</Text>
        <LineChart
          data={{
            labels: ['January', 'February', 'March', 'April', 'May', 'June'],
            datasets: [
              {
                data: [20, 45, 28, 80, 99, 43],
              },
            ],
          }}
          width={330} // Adjust width according to your layout
          height={200}
          yAxisLabel="$"
          chartConfig={{
            backgroundColor: '#e26a00',
            backgroundGradientFrom: '#8c0a0a',
            backgroundGradientTo: '#ffa726',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </View>
    </ScrollView>
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
  titleContainer: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: -40,
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  kpiContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    height: 90,
  },
  kpiItem: {
    width: '48%',
    backgroundColor: '#b23e3e',
    borderRadius: 10,
    padding: 10,
  },
  kpiTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  kpiValue: {
    fontSize: 14,
    color: 'white',
  },
  chartWrapper: {
    marginBottom: 24,
    alignItems: 'flex-start', // Align contents (including title) to the left
  },
  largeChart: {
    alignItems: 'flex-start', // Align contents (including title) to the left
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'left', // Ensure text aligns left within its container
  },
});
