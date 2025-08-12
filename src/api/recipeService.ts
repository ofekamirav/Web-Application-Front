import { axiosInstance } from './axiosInstance';

export interface Author {
  _id: string;
  name: string;
  profilePicture?: string;
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

type ListParams = Partial<{ page: number; limit: number; author: string; title: string }>;


export const apiGetRecipes = async (params?: ListParams): Promise<PaginatedRecipes> => {
  const { data } = await axiosInstance.get<PaginatedRecipes>('/recipes', { params });
  return data;
};

export const apiGetRecipeById = async (id: string): Promise<Recipe> => {
  const { data } = await axiosInstance.get<Recipe>(`/recipes/${id}`);
  return data;
};

export const apiCreateRecipe = async (formData: FormData): Promise<Recipe> => {
  const { data } = await axiosInstance.post<Recipe>('/recipes', formData);
  return data;
};

export const apiUpdateRecipe = async (
  id: string,
  recipeData: Partial<Omit<Recipe, '_id' | 'createdAt'>>
): Promise<Recipe> => {
  const { data } = await axiosInstance.put<Recipe>(`/recipes/${id}`, recipeData);
  return data;
};

export const apiLikeRecipe = async (id: string): Promise<Recipe> => {
  const { data } = await axiosInstance.post<Recipe>(`/recipes/${id}/like`);
  return data;
};

export const apiGetMyRecipes = async (params?: ListParams): Promise<PaginatedRecipes> => {
  const { data } = await axiosInstance.get<PaginatedRecipes>('/recipes/mine', { params });
  return data;
};

export const apiDeleteRecipe = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/recipes/${id}`);
};
