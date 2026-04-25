import axios from 'axios';

const defaultApiBaseUrl = 'http://localhost:5000';
const authStorageKey = 'cloud-file-auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl
});

export const getStoredAuth = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawAuth = window.localStorage.getItem(authStorageKey);

  if (!rawAuth) {
    return null;
  }

  try {
    const parsedAuth = JSON.parse(rawAuth);
    const token = typeof parsedAuth?.token === 'string' ? parsedAuth.token : '';
    const user = parsedAuth?.user;

    if (!token || !user?.id || !user?.name || !user?.email) {
      return null;
    }

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    };
  } catch {
    return null;
  }
};

export const saveAuth = (auth) => {
  window.localStorage.setItem(authStorageKey, JSON.stringify(auth));
  return auth;
};

export const clearStoredAuth = () => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(authStorageKey);
  }
};

const getRequestConfig = (token) => ({
  headers: {
    authorization: `Bearer ${token}`
  }
});

export const signup = async (payload) => {
  const response = await api.post('/api/auth/signup', payload);
  return response.data;
};

export const login = async (payload) => {
  const response = await api.post('/api/auth/login', payload);
  return response.data;
};

export const fetchCurrentUser = async (token) => {
  const response = await api.get('/api/auth/me', getRequestConfig(token));
  return response.data;
};

export const fetchFiles = async (token) => {
  const response = await api.get('/api/files', getRequestConfig(token));

  if (!Array.isArray(response.data)) {
    throw new Error('Invalid files response from API. Expected an array.');
  }

  return response.data;
};

export const uploadFile = async (file, token, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  const requestConfig = getRequestConfig(token);

  const response = await api.post('/api/files/upload', formData, {
    ...requestConfig,
    headers: {
      ...requestConfig.headers,
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress
  });

  return response.data;
};

export const deleteFile = async (fileId, token) => {
  const response = await api.delete(`/api/files/${fileId}`, getRequestConfig(token));
  return response.data;
};
