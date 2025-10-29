import axios from 'axios';
import type { TaskItem, CreateTaskDto } from '../types/interfaces';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';
const TASKS_ENDPOINT = '/api/tasks';

const client = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const taskService = {
  getAllTasks: async (): Promise<TaskItem[]> => {
    const response = await client.get<TaskItem[]>(TASKS_ENDPOINT);
    return response.data;
  },

  createTask: async (taskDto: CreateTaskDto): Promise<TaskItem> => {
    const response = await client.post<TaskItem>(TASKS_ENDPOINT, taskDto);
    return response.data;
  },

  toggleTask: async (id: string): Promise<TaskItem> => {
    const response = await client.patch<TaskItem>(`${TASKS_ENDPOINT}/${id}/toggle`);
    return response.data;
  },

  deleteTask: async (id: string): Promise<void> => {
    await client.delete(`${TASKS_ENDPOINT}/${id}`);
  },
};
