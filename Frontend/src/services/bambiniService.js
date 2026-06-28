import api from './api';

export const getBambini = async () => {
  const response = await api.get('/bambini');
  return response.data;
};

export const getBambino = async (id) => {
  const response = await api.get(`/bambini/${id}`);
  return response.data;
};

export const createBambino = async (data) => {
  const response = await api.post('/bambini', data);
  return response.data;
};

export const updateBambino = async (id, data) => {
  const response = await api.put(`/bambini/${id}`, data);
  return response.data;
};

export const deleteBambino = async (id) => {
  const response = await api.delete(`/bambini/${id}`);
  return response.data;
};
