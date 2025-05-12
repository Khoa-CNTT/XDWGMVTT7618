import api from './api';

export const fetchStallRevenue = async (stall_id) => {
  try {
    // Use body parameter with POST request
    const response = await api.post('/s2d/foodstall/numberofproduct', { stall_id });
    return response.data;
  } catch (error) {
    console.error('Error fetching stall revenue:', error);
    throw error;
  }
};

export const fetchMonthlyRevenue = async (stall_id) => {
  try {
    // Use body parameter with POST request
    const response = await api.post('/s2d/foodstall/month', { stall_id });
    return response.data;
  } catch (error) {
    console.error('Error fetching monthly revenue:', error);
    throw error;
  }
};
export const fetchOrderStats = async (stallId) => {
  try {
    const response = await api.get('/s2d/foodstall/DayWeakMonth', {
      params: { stall_id: stallId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching order stats:', error);
    throw error;
  }
};
export const fetchInputMonthYear = async (month, year) => {
  try {
    const response = await api.post('/s2d/foodstall/inputMonthYear', { month, year });
    return response.data;
  } catch (error) {
    console.error('Error fetching input month/year stats:', error);
    throw error;
  }
};