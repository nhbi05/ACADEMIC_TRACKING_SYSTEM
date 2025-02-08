import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const login = async (username, password) => {
    try {
        const response = await axios.post(`${API_URL}/token/`, {
            username,
            password
        });
        
        if (response.data.access) {
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            return true;
        }
    } catch (error) {
        throw error;
    }
};