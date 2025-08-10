import { axiosInstance } from './axiosInstance';

interface AuthResponse {
  user: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  accessToken: string;
  refreshToken: string;
}


export const apiLogin = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await axiosInstance.post('/auth/login', { email, password });
  return response.data;
};


export const apiRegister = async (formData: FormData) => {
  const response = await axiosInstance.post('/auth/register', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data; 
};

export const apiLogout = async (refreshToken: string): Promise<void> => {
  await axiosInstance.post('/auth/logout', { refreshToken });
};


export const apiRefresh = async (refreshToken: string) => {
    const response = await axiosInstance.post('/auth/refresh', { refreshToken });
    return response.data; 
}