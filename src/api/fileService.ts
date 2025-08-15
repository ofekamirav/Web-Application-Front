import { axiosInstance } from './axiosInstance';

export type UploadFolder = 'recipes' | 'profile_pictures' | 'defaults';

export const apiUploadFile = async (file: File, folder: UploadFolder = 'recipes') => {
  const fd = new FormData();
  fd.append('file', file);
  const { data } = await axiosInstance.post<{ url: string }>(`/file?folder=${folder}`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data; 
};
