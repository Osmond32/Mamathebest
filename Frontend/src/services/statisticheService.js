import api from './api';

export const getStatistiche = async (bambinoId, data) => {
  const query = data ? `?data=${data}` : '';
  const response = await api.get(`/bambini/${bambinoId}/statistiche${query}`);
  return response.data;
};
