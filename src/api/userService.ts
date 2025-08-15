import type { User } from '../interfaces/iUser';
import { axiosInstance } from './axiosInstance';
import { apiUploadFile } from './fileService';
import type { Recipe } from './recipeService'; 

export interface PublicUserProfile {
  user: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  recipes: Recipe[];
}


export const apiGetUserProfile = async (userId: string): Promise<PublicUserProfile> => {
  const response = await axiosInstance.get(`/users/${userId}`);
  return response.data;
};
  

export const apiGetCurrentUserProfile = async (): Promise<User> => {
    const response = await axiosInstance.get('/users/me');
    return response.data;
};


export const apiUpdateCurrentUserProfile = async (payload: {
  name?: string;
  email?: string;          
  profilePicture?: string; 
}): Promise<User> => {
  const { data } = await axiosInstance.put('/users/me', payload);
  return data;
};

export const apiUpdateCurrentUserProfileWithFile = async (
  name?: string,
  file?: File,
  email?: string            
): Promise<User> => {
  let profilePicture: string | undefined;
  if (file) {
    const { url } = await apiUploadFile(file, 'profile_pictures');
    profilePicture = url; 
  }
  return apiUpdateCurrentUserProfile({ name, email, profilePicture });
};

export const apiDeleteCurrentUser = async (): Promise<void> => {
    await axiosInstance.delete('/users/me');
};

export const apiUpdateCurrentUserPassword = async (oldPassword: string, newPassword: string): Promise<void> => {
    await axiosInstance.put('/users/me/password', { oldPassword, newPassword });
};
