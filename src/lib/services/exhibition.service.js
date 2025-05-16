import api from '../api';

export const exhibitionService = {
  getExhibitions: async () => {
    const response = await api.get('/exhibitions');
    return response.data;
  },
  
  getExhibition: async (id) => {
    const response = await api.get(`/exhibitions/${id}`);
    return response.data;
  },
  
  getUpcomingExhibitions: async () => {
    const response = await api.get('/exhibitions/upcoming');
    return response.data;
  }
};

export default exhibitionService; 