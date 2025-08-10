import { axiosInstance } from './axiosInstance';

export interface AiResponse {
  recipe: {
    title: string;
    description: string;
    imageUrl: string;
    ingredients: string[];
    instructions: string;
  };
}

export const apiGenerateRecipe = async (prompt: string): Promise<AiResponse> => {
  const response = await axiosInstance.post('/ai/generate-recipe', { prompt });
  return response.data;
};

