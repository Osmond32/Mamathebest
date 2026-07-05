import api from './api';

export const getEvacuazioni = async (bambinoId) => {
  const response = await api.get(`/evacuazioni/${bambinoId}`);
  return response.data;
};

export const createEvacuazione = async (data) => {
  const response = await api.post('/evacuazioni', data);
  return response.data;
};

export const deleteEvacuazione = async (id) => {
  const response = await api.delete(`/evacuazioni/${id}`);
  return response.data;
};
