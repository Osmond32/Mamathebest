import api from './api';

export const getPesate = async (bambinoId) => {
  const response = await api.get(`/pesate/${bambinoId}`);
  return response.data;
};

export const createPesata = async (data) => {
  const response = await api.post('/pesate', data);
  return response.data;
};

export const updatePesata = async (id, data) => {
  const response = await api.put(`/pesate/${id}`, data);
  return response.data;
};

export const deletePesata = async (id) => {
  const response = await api.delete(`/pesate/${id}`);
  return response.data;
};
