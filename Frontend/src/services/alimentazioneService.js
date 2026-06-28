import api from './api';

export const getAlimentazione = async (bambinoId) => {
  const response = await api.get(`/alimentazione/${bambinoId}`);
  return response.data;
};

export const createAlimentazione = async (data) => {
  const response = await api.post('/alimentazione', data);
  return response.data;
};

export const updateAlimentazione = async (id, data) => {
  const response = await api.put(`/alimentazione/${id}`, data);
  return response.data;
};

export const deleteAlimentazione = async (id) => {
  const response = await api.delete(`/alimentazione/${id}`);
  return response.data;
};
