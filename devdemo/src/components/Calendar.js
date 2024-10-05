// src/components/Calendar.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import axios from 'axios';

const ODOO_URL = 'https://developers4.odoo.com'; // Your Odoo instance URL

const CalendarComponent = ({ route }) => {
  const { employeeId } = route.params; // Get employeeId from route params
  const [markedDates, setMarkedDates] = useState({}); // State to hold marked dates
  const [attendanceRecords, setAttendanceRecords] = useState([]); // State to hold attendance records

  useEffect(() => {
    fetchEmployeeAttendance();
  }, [employeeId]);

  const fetchEmployeeAttendance = async () => {
    try {
      const payload = {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          model: 'hr.attendance',
          method: 'search_read',
          args: [[['employee_id', '=', employeeId]], ['check_in', 'check_out']], // Modify based on your model's fields
          kwargs: {},
        },
      };

      const response = await axios.post(`${ODOO_URL}/web/dataset/call_kw`, payload);
      if (response.data && response.data.result) {
        const records = response.data.result;
        setAttendanceRecords(records); // Store attendance records
        const marked = {};

        // Mark dates based on check-in and check-out status
        records.forEach(record => {
          const date = record.check_in.split(' ')[0]; // Get the date part of check_in

          // If the employee has checked out
          if (record.check_out) {
            marked[date] = {
              marked: true,
              color: 'blue', // Blue for checked in and checked out
            };
          } else {
            marked[date] = {
              marked: true,
              color: 'red', // Red for checked in but not checked out
            };
          }

          // Calculate worked hours and assign it to the next day
          const workedHours = calculateWorkedHours(record.check_in, record.check_out);
          if (workedHours && record.check_out) {
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1); // Get the next day
            const nextDayString = nextDay.toISOString().split('T')[0]; // Format it to YYYY-MM-DD

            // Store worked hours in the next day's marked dates
            marked[nextDayString] = {
              ...marked[nextDayString],
              marked: true,
              dotColor: 'green', // Optional: Mark next day with a dot
              workedHours: workedHours, // Store worked hours
            };
          }
        });

        setMarkedDates(marked); // Set marked dates
      } else {
        console.error('No attendance records found for this employee.');
      }
    } catch (error) {
      console.error("Error fetching employee attendance:", error);
    }
  };

  // Calculate worked hours
  const calculateWorkedHours = (checkIn, checkOut) => {
    if (!checkOut) return 0; // If not checked out, return 0
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const hoursWorked = (checkOutDate - checkInDate) / (1000 * 60 * 60); // Convert milliseconds to hours
    return hoursWorked.toFixed(2); // Return hours worked rounded to 2 decimal places
  };

  // Handle day press
  const handleDayPress = (day) => {
    const selectedDate = day.dateString;
    const record = attendanceRecords.find(record => {
      const recordDate = record.check_in.split(' ')[0]; // Extract the date part from check_in
      return recordDate === selectedDate; // Check if the date matches
    });

    // Check for worked hours on the selected date (which is the next day after check-in)
    const nextDayRecord = markedDates[selectedDate];

    if (nextDayRecord && nextDayRecord.workedHours) {
      Alert.alert(`Worked Hours for ${selectedDate}`, `You worked: ${nextDayRecord.workedHours} hours`);
    } else {
      Alert.alert("No Attendance Record", "You have not checked in or there are no worked hours recorded for this day.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendance Calendar</Text>
      <Calendar
        markedDates={markedDates}
        onDayPress={handleDayPress} // Use the handleDayPress function
        style={styles.calendar} // Apply the new style to add margin
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start', // Ensure content is aligned at the start
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20, // Adjust margin to move the title down slightly
    marginTop: 250, // Added margin to the top to move it further down
    textAlign: 'center', // Center align the title
  },
  calendar: {
    marginTop: 20, // Adds margin to move the calendar down slightly
  },
});

export default CalendarComponent;
