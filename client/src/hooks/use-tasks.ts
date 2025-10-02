import { create } from 'zustand';
import { tasksApi } from '@/services/tasks';
import type { Task, CreateTaskDto, UpdateTaskDto, TaskSuggestion } from '@/types/task';

interface TasksState {
    tasks: Task[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchTasks: () => Promise<void>;
    createTask: (data: CreateTaskDto) => Promise<Task>;
    updateTask: (id: string, data: UpdateTaskDto) => Promise<Task>;
    deleteTask: (id: string) => Promise<void>;
    getSuggestions: (context?: string) => Promise<TaskSuggestion[]>;
}

export const useTasksStore = create<TasksState>((set, get) => ({
    tasks: [],
    isLoading: false,
    error: null,

    fetchTasks: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await tasksApi.getAll();
            // Ensure tasks is always an array
            set({ tasks: Array.isArray(response.data) ? response.data : [], isLoading: false });
        } catch (error) {
            set({
                tasks: [], // Keep tasks as empty array on error
                error: error instanceof Error ? error.message : 'Failed to fetch tasks',
                isLoading: false
            });
            throw error;
        }
    },

    createTask: async (data: CreateTaskDto) => {
        set({ isLoading: true, error: null });
        try {
            const response = await tasksApi.create(data);
            set((state) => ({
                tasks: [response.data, ...state.tasks],
                isLoading: false
            }));
            return response.data;
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to create task',
                isLoading: false
            });
            throw error;
        }
    },

    updateTask: async (id: string, data: UpdateTaskDto) => {
        set({ isLoading: true, error: null });
        try {
            const response = await tasksApi.update(id, data);
            set((state) => ({
                tasks: state.tasks.map((task) =>
                    task.id === id ? response.data : task
                ),
                isLoading: false
            }));
            return response.data;
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to update task',
                isLoading: false
            });
            throw error;
        }
    },

    deleteTask: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            await tasksApi.delete(id);
            set((state) => ({
                tasks: state.tasks.filter((task) => task.id !== id),
                isLoading: false
            }));
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to delete task',
                isLoading: false
            });
            throw error;
        }
    },

    getSuggestions: async (context?: string) => {
        try {
            const response = await tasksApi.getSuggestions(context);
            return response.data;
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to get suggestions'
            });
            throw error;
        }
    },
}));
