import axios from 'axios';
import type { TaskItem, CreateTaskDto } from '../types/interfaces';

const API_URL = 'http://localhost:5000/api/tasks';

export const taskService = {
  // Get all tasks
  getAllTasks: async (): Promise<TaskItem[]> => {
    const response = await axios.get<TaskItem[]>(API_URL);
    return response.data;
  },

  // Create a new task
  createTask: async (taskDto: CreateTaskDto): Promise<TaskItem> => {
    const response = await axios.post<TaskItem>(API_URL, taskDto);
    return response.data;
  },

  // Toggle task completion status
  toggleTask: async (id: string): Promise<TaskItem> => {
    const response = await axios.patch<TaskItem>(`${API_URL}/${id}/toggle`);
    return response.data;
  },

  // Delete a task
  deleteTask: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  },
};
