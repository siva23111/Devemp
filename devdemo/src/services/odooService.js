// src/services/odooService.js
import axios from 'axios';

const ODOO_URL = 'https://developers4.odoo.com'; // Your Odoo instance URL
const DATABASE = 'developers4'; // Your Odoo database name

export const loginToOdoo = async (username, password) => {
  try {
    const authResponse = await axios.post(`${ODOO_URL}/web/session/authenticate`, {
      params: {
        db: DATABASE,
        login: username,
        password: password,
      },
    });

    if (!authResponse.data.result) {
      throw new Error("Authentication failed. Please check your credentials.");
    }

    const userName = authResponse.data.result.name || "Guest";
    const userId = authResponse.data.result.user_id; // Assuming this gives us user_id

    return {
      username: authResponse.data.result.username,
      name: userName,
      userId, // Include userId in the return object
    };
  } catch (error) {
    if (error.response) {
      console.error("Login failed with status:", error.response.status);
      console.error("Error details:", error.response.data);
      throw new Error(error.response.data.error || "Login failed");
    } else {
      console.error("Login failed with message:", error.message);
      throw new Error("Network error or server not responding");
    }
  }
};

export const fetchEmployeeIdByUsername = async (username) => {
  try {
    const payload = {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        model: 'hr.employee',
        method: 'search_read',
        args: [[['name', '=', username]], ['id']], // Fetch employee ID using the username
        kwargs: {},
      },
    };

    const response = await axios.post(`${ODOO_URL}/web/dataset/call_kw`, payload);
    
    if (response.data && response.data.result.length > 0) {
      return response.data.result[0].id; // Return the employee ID
    } else {
      throw new Error('Employee not found');
    }
  } catch (error) {
    console.error("Error fetching employee ID:", error);
    throw new Error("Could not fetch employee ID");
  }
};

// Other functions (e.g., fetchEmployeeId, etc.) can remain as they are.
