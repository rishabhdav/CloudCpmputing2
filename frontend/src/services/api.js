import axios from 'axios';

const defaultApiBaseUrl = 'http://localhost:5000';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl
});

export const fetchFiles = async () => {
  const response = await api.get('/api/files');

  if (!Array.isArray(response.data)) {
    throw new Error('Invalid files response from API. Expected an array.');
  }

  return response.data;
};

export const uploadFile = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/api/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress
  });

  return response.data;
};

export const deleteFile = async (fileId) => {
  const response = await api.delete(`/api/files/${fileId}`);
  return response.data;
};
