import { axiosInstance } from './axiosInstance';

export interface Author {
  _id: string;
  name: string;
  profilePictureUrl?: string;
}

export interface Recipe {
  _id: string;
  title: string;
  description: string;
  imageUrl: string; 
  ingredients: string[]; 
  instructions: string; 
  author: Author;
  likes: string[];
  createdAt: string;
}

export interface PaginatedRecipes {
  data: Recipe[];
  totalPages: number;
  currentPage: number;
}


export const apiGetRecipes = async (params?: Record<string, unknown>): Promise<PaginatedRecipes> => {
  const response = await axiosInstance.get('/recipes', { params });
  return response.data;
};

export const apiGetRecipeById = async (id: string): Promise<Recipe> => {
  const response = await axiosInstance.get(`/recipes/${id}`);
  return response.data;
};

export const apiCreateRecipe = async (formData: FormData): Promise<Recipe> => {
  const response = await axiosInstance.post('/recipes', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',  
    },
  });
  return response.data;
};

export const apiUpdateRecipe = async (id: string, recipeData: Partial<Omit<Recipe, '_id' | 'createdAt'>>): Promise<Recipe> => {
  const response = await axiosInstance.put(`/recipes/${id}`, recipeData);
  return response.data;
};

export const apiDeleteRecipe = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/recipes/${id}`);
};

export const apiLikeRecipe = async (id: string): Promise<Recipe> => {
  const response = await axiosInstance.post(`/recipes/${id}/like`);
  return response.data;
};
