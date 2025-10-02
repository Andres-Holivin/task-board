import { ApiResponse } from '@/types/auth';
import { apiClient } from './api';
import type { Task, CreateTaskDto, UpdateTaskDto, TaskSuggestion } from '@/types/task';

export const tasksApi = {
    getAll: async (): Promise<ApiResponse<Task[]>> => {
        return await apiClient.get<ApiResponse<Task[]>>('/tasks');
    },

    getOne: async (id: string): Promise<ApiResponse<Task>> => {
        return await apiClient.get<ApiResponse<Task>>(`/tasks/${id}`);
    },

    create: async (data: CreateTaskDto): Promise<ApiResponse<Task>> => {
        return await apiClient.post<ApiResponse<Task>>('/tasks', data);
    },

    update: async (id: string, data: UpdateTaskDto): Promise<ApiResponse<Task>> => {
        return await apiClient.patch<ApiResponse<Task>>(`/tasks/${id}`, data);
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/tasks/${id}`);
    },

    getSuggestions: async (context?: string): Promise<ApiResponse<TaskSuggestion[]>> => {
        return await apiClient.get<ApiResponse<TaskSuggestion[]>>('/tasks/suggestions', {
            params: { context },
        });
    },
};
