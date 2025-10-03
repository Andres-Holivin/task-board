import { create } from 'zustand';
import { tasksApi } from '@/services/tasks';
import type { Task, CreateTaskDto, UpdateTaskDto, TaskSuggestion } from '@/types/task';
import { useMemo } from 'react';

interface TasksState {
    tasks: Task[];
    isLoading: TaskLoadingType | null;
    error: string | null;
    errorType: TaskErrorType | null;

    // Actions
    fetchTasks: () => Promise<void>;
    createTask: (data: CreateTaskDto) => Promise<Task>;
    updateTask: (id: string, data: UpdateTaskDto) => Promise<Task>;
    deleteTask: (id: string) => Promise<void>;
    getSuggestions: (context?: string) => Promise<TaskSuggestion[]>;
}
export enum TaskLoadingType {
    FETCH_TASKS,
    CREATE_TASK,
    UPDATE_TASK,
    DELETE_TASK,
    SUGGESTIONS
}
export enum TaskErrorType {
    FETCH_TASKS,
    CREATE_TASK,
    UPDATE_TASK,
    DELETE_TASK,
    SUGGESTIONS
}

const useTasksStore = create<TasksState>((set, get) => ({
    tasks: [],
    isLoading: null,
    error: null,
    errorType: null,


    fetchTasks: async () => {
        try {
            set({ isLoading: TaskLoadingType.FETCH_TASKS, error: null, errorType: null });
            const response = await tasksApi.getAll();
            set({ tasks: Array.isArray(response.data) ? response.data : [], isLoading: null, errorType: null });
        } catch (error) {
            set({
                tasks: [],
                error: error instanceof Error ? error.message : 'Failed to fetch tasks',
                errorType: TaskErrorType.FETCH_TASKS,
                isLoading: null
            });
            throw error;
        }
    },

    createTask: async (data: CreateTaskDto) => {
        set({ isLoading: TaskLoadingType.CREATE_TASK, error: null, errorType: null });
        try {
            const response = await tasksApi.create(data);
            set((state) => ({
                tasks: [response.data, ...state.tasks],
                isLoading: null,
                error: null,
                errorType: null
            }));
            return response.data;
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to create task',
                errorType: TaskErrorType.CREATE_TASK,
                isLoading: null
            });
            throw error;
        }
    },

    updateTask: async (id: string, data: UpdateTaskDto) => {
        set({ isLoading: TaskLoadingType.UPDATE_TASK, error: null, errorType: null });
        try {
            const response = await tasksApi.update(id, data);
            set((state) => ({
                tasks: state.tasks.map((task) =>
                    task.id === id ? response.data : task
                ),
                isLoading: null,
                error: null,
                errorType: null
            }));
            return response.data;
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to update task',
                errorType: TaskErrorType.UPDATE_TASK,
                isLoading: null
            });
            throw error;
        }
    },

    deleteTask: async (id: string) => {
        set({ isLoading: TaskLoadingType.DELETE_TASK, error: null, errorType: null });
        try {
            await tasksApi.delete(id);
            set((state) => ({
                tasks: state.tasks.filter((task) => task.id !== id),
                isLoading: null,
                error: null,
                errorType: null
            }));
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to delete task',
                errorType: TaskErrorType.DELETE_TASK,
                isLoading: null
            });
            throw error;
        }
    },

    getSuggestions: async (context?: string) => {
        try {
            set({ isLoading: TaskLoadingType.SUGGESTIONS, error: null, errorType: null });
            const response = await tasksApi.getSuggestions(context);
            set({ isLoading: null, error: null, errorType: null });
            return response.data;
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to get suggestions',
                errorType: TaskErrorType.SUGGESTIONS,
                isLoading: null
            });
            throw error;
        }
    },
}));
export const useTaksActions = () => {

    const tasks = useTasksStore((state) => state.tasks);
    const fetchTasks = useTasksStore((state) => state.fetchTasks);
    const createTask = useTasksStore((state) => state.createTask);
    const updateTask = useTasksStore((state) => state.updateTask);
    const deleteTask = useTasksStore((state) => state.deleteTask);
    const getSuggestions = useTasksStore((state) => state.getSuggestions);
    const isLoading = useTasksStore((state) => state.isLoading);
    const error = useTasksStore((state) => state.error);
    const errorType = useTasksStore((state) => state.errorType);

    return useMemo(() => ({
        tasks,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
        getSuggestions,
        isLoading,
        error,
        errorType
    }), [
        tasks,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
        getSuggestions,
        isLoading,
        error,
        errorType
    ])
}