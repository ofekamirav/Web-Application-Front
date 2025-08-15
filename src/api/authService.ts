import { axiosInstance } from './axiosInstance';
import { apiUploadFile } from './fileService';

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


export const apiRegister = async (payload: {
  name: string;
  email: string;
  password: string;
  profilePicture?: string;
}): Promise<AuthResponse> => {
  const response = await axiosInstance.post('/auth/register', payload);
  return response.data;
};

export const apiRegisterWithFile = async (
  name: string,
  email: string,
  password: string,
  file?: File
): Promise<AuthResponse> => {
  let profilePicture: string | undefined;
  if (file) {
    const { url } = await apiUploadFile(file, 'profile_pictures');
    profilePicture = url;
  }
  return apiRegister({ name, email, password, profilePicture });
};

export const apiLogout = async (refreshToken: string): Promise<void> => {
  await axiosInstance.post('/auth/logout', { refreshToken });
};


export const apiRefresh = async (refreshToken: string) => {
    const response = await axiosInstance.post('/auth/refresh', { refreshToken });
    return response.data; 
}

export const apiGoogleSignin = async (credential: string): Promise<AuthResponse> => {
  const res = await axiosInstance.post('/auth/google-signin', { credential });
  return res.data;
};