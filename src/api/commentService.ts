import { axiosInstance } from './axiosInstance';
import type { Author } from './recipeService';

export interface Comment {
    _id: string;
    text: string;
    author: Author;
    recipe: string;
    createdAt: string;
}


export const apiGetCommentsByRecipeId = async (recipeId: string): Promise<Comment[]> => {
    const response = await axiosInstance.get('/comments', { params: { recipe: recipeId } });
    return response.data.data;
};


export const apiCreateComment = async (text: string, recipeId: string): Promise<Comment> => {
    const response = await axiosInstance.post('/comments', { text, recipe: recipeId });
    return response.data;
};

export const apiDeleteComment = async (commentId: string): Promise<void> => {
    await axiosInstance.delete(`/comments/${commentId}`);
};

export const apiUpdateComment = async (id: string, text: string): Promise<Comment> => {
  const { data } = await axiosInstance.put<Comment>(`/comments/${id}`, { text });
  return data;
};

