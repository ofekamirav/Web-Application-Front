import { axiosInstance } from "./axiosInstance";

export type AiSuggestion = {
  title: string;
  description: string;
  instructions: string[]; 
};

export async function apiSuggestRecipe(ingredients: string[]): Promise<AiSuggestion> {
  const { data } = await axiosInstance.post("/ai/suggest-recipe", { ingredients });
  return data as AiSuggestion;
}
