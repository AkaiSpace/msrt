// api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000'; // Zakładając, że backend działa na tym porcie

export const getCars = async () => {
  try {
    const response = await axios.get(`${API_URL}/cars`);
    return response.data;
  } catch (error) {
    console.error("Error fetching cars:", error);
    return [];
  }
};

// Możesz dodać inne funkcje do pobierania danych o częściach, typach części, itp.
