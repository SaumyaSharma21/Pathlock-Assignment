export interface TaskItem {
  id: string;
  description: string;
  completed: boolean;
  createdAt: string;
}

export interface CreateTaskDto {
  description: string;
}
