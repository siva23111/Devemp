// src/components/Home.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Header from './Header';

const Home = ({ route, navigation }) => {
  const { name, employeeId } = route.params; // Get name and employeeId from route params

  <TouchableOpacity
  style={styles.box}
  onPress={() => navigation.navigate('Attendance', { employeeId, name })} // Pass employeeId and name
>
  <Text style={styles.boxText}>Attendance</Text>
</TouchableOpacity>

  return (
    <View style={styles.container}>
      <Header name={name} />
      <View style={styles.boxContainer}>
        <TouchableOpacity
          style={styles.box}
          onPress={() => navigation.navigate('Attendance', { employeeId, name })} // Pass employeeId and name
        >
          <Text style={styles.boxText}>Attendance</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.box}
          onPress={() => navigation.navigate('Calendar', { employeeId })} // Navigate to Calendar screen
        >
          <Text style={styles.boxText}>Calendar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  boxContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: 20,
  },
  box: {
    width: '80%',
    height: 100,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 10,
  },
  boxText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default Home;
