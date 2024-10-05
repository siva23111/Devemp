// src/components/Attendance.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import axios from 'axios';

const ODOO_URL = 'https://developers4.odoo.com'; // Your Odoo instance URL
const DATABASE = 'developers4'; // Your Odoo database name

const Attendance = ({ route }) => {
  const { name } = route.params; // Get name from route params
  const [checkInStatus, setCheckInStatus] = useState('');
  const [checkOutStatus, setCheckOutStatus] = useState('');
  const [attendanceRecord, setAttendanceRecord] = useState(null);
  const [employeeId, setEmployeeId] = useState(null); // Store the employee ID based on username

  useEffect(() => {
    fetchEmployeeIdByUsername(); // Fetch employee ID by username on component mount
  }, []);

  // Fetch employee ID using username
  const fetchEmployeeIdByUsername = async () => {
    try {
      const payload = {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          model: 'hr.employee',
          method: 'search_read',
          args: [[['name', '=', name]], ['id']], // Fetch employee ID using the username
          kwargs: {},
        },
      };

      const response = await axios.post(`${ODOO_URL}/web/dataset/call_kw`, payload);
      if (response.data && response.data.result.length > 0) {
        setEmployeeId(response.data.result[0].id); // Set the employee ID
        checkCurrentAttendance(response.data.result[0].id); // Check attendance for this employee
      } else {
        console.error('Employee not found');
      }
    } catch (error) {
      console.error("Error fetching employee ID:", error);
    }
  };

  // Format date and time to Odoo's expected format with -6 hours and +30 minutes conversion
  const formatDateToOdoo = (isoDate) => {
    const date = new Date(isoDate);
    
    // Calculate the offset: -6 hours (in milliseconds) and +30 minutes
    const offsetMilliseconds = (-6 * 60 * 60 * 1000) + (30 * 60 * 1000); // -6 hours + 30 minutes
    const adjustedDate = new Date(date.getTime() + offsetMilliseconds);

    const year = adjustedDate.getFullYear();
    const month = String(adjustedDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(adjustedDate.getDate()).padStart(2, '0');
    const hours = String(adjustedDate.getHours()).padStart(2, '0');
    const minutes = String(adjustedDate.getMinutes()).padStart(2, '0');
    const seconds = String(adjustedDate.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`; // Odoo format in adjusted time
  };

  const checkCurrentAttendance = async (id) => {
    try {
      const payload = {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          model: 'hr.attendance',
          method: 'search_read',
          args: [[['employee_id', '=', id], ['check_out', '=', false]]], // Use employeeId
          kwargs: {},
        },
      };

      const response = await axios.post(`${ODOO_URL}/web/dataset/call_kw`, payload);
      if (response.data && response.data.result.length > 0) {
        setAttendanceRecord(response.data.result[0]); // Set the attendance record if exists
      }
    } catch (error) {
      console.error("Error checking current attendance:", error);
    }
  };

  const handleCheckIn = async () => {
    if (attendanceRecord) {
      setCheckInStatus('Already checked in');
      return; // Do not allow check-in if already checked in
    }

    try {
      const currentDateTime = new Date().toISOString(); // Get current datetime in UTC
      const formattedCheckInTime = formatDateToOdoo(currentDateTime); // Format check-in time to adjusted time

      const payload = {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          model: 'hr.attendance',
          method: 'create',
          args: [{
            employee_id: employeeId, // Employee ID fetched using username
            check_in: formattedCheckInTime, // Current datetime in Odoo format
          }],
          kwargs: {},
        },
      };

      const response = await axios.post(`${ODOO_URL}/web/dataset/call_kw`, payload);
      if (response.data && response.data.result) {
        setCheckInStatus(`Check In Successful: ${name}`);
        console.log(`Check In Details: Employee ID: ${employeeId}, Name: ${name}, Check-In Time: ${formattedCheckInTime}`); // Log check-in details
        checkCurrentAttendance(employeeId); // Refresh attendance status

        // Clear the message after 5 seconds
        setTimeout(() => {
          setCheckInStatus('');
        }, 5000);
      } else {
        setCheckInStatus('Check In Failed');
        console.log('Check In Failed:', response.data.error);
      }
    } catch (error) {
      console.error("Check In Error:", error);
      setCheckInStatus('Check In Error');
    }
  };

  const handleCheckOut = async () => {
    if (!attendanceRecord) {
      setCheckOutStatus('Not checked in');
      return; // Do not allow check-out if not checked in
    }

    try {
      const currentDateTime = new Date().toISOString(); // Get current datetime in UTC
      const formattedCheckOutTime = formatDateToOdoo(currentDateTime); // Format check-out time to adjusted time

      const payload = {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          model: 'hr.attendance',
          method: 'write',
          args: [[attendanceRecord.id], { check_out: formattedCheckOutTime }], // Use formatted time
          kwargs: {},
        },
      };

      const response = await axios.post(`${ODOO_URL}/web/dataset/call_kw`, payload);
      if (response.data && response.data.result) {
        setCheckOutStatus(`Check Out Successful: ${name}`);
        console.log(`Check Out Details: Employee ID: ${employeeId}, Name: ${name}, Check-Out Time: ${formattedCheckOutTime}`); // Log check-out details
        setAttendanceRecord(null); // Clear attendance record after check out

        // Clear the message after 5 seconds
        setTimeout(() => {
          setCheckOutStatus('');
        }, 5000);
      } else {
        setCheckOutStatus('Check Out Failed');
        console.log('Check Out Failed:', response.data.error);
      }
    } catch (error) {
      console.error("Check Out Error:", error);
      setCheckOutStatus('Check Out Error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendance</Text>
      <Text>{checkInStatus}</Text>
      <Text>{checkOutStatus}</Text>
      {!attendanceRecord ? (
        <Button title="Check In" onPress={handleCheckIn} />
      ) : (
        <Button title="Check Out" onPress={handleCheckOut} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});


export default Attendance
