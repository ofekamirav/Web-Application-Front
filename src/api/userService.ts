import { axiosInstance } from './axiosInstance';
import type { Recipe } from './recipeService'; 

export interface PublicUserProfile {
  user: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  recipes: Recipe[];
}

export interface CurrentUser {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
    location?: string;
}


export const apiGetUserProfile = async (userId: string): Promise<PublicUserProfile> => {
  const response = await axiosInstance.get(`/users/${userId}`);
  return response.data;
};


export const apiGetCurrentUserProfile = async (): Promise<CurrentUser> => {
    const response = await axiosInstance.get('/users/me');
    return response.data;
};


export const apiUpdateCurrentUserProfile = async (formData: FormData): Promise<CurrentUser> => {
    const response = await axiosInstance.put('/users/me', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};


export const apiDeleteCurrentUser = async (): Promise<void> => {
    await axiosInstance.delete('/users/me');
};

export const apiUpdateCurrentUserPassword = async (oldPassword: string, newPassword: string): Promise<void> => {
    await axiosInstance.put('/users/me/password', { oldPassword, newPassword });
};
