import { useState, useEffect } from 'react';
import type { TaskItem } from './types/interfaces';
import { taskService } from './services/taskService';
import AddTask from './components/AddTask';
import TaskList from './components/TaskList';
import './App.css';

function App() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await taskService.getAllTasks();
      setTasks(data);
    } catch (err) {
      setError('Failed to fetch tasks. Make sure the backend is running.');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (description: string) => {
    try {
      setError(null);
      const newTask = await taskService.createTask({ description });
      setTasks([newTask, ...tasks]);
    } catch (err) {
      setError('Failed to add task.');
      console.error('Error adding task:', err);
    }
  };

  const handleToggleTask = async (id: string) => {
    try {
      setError(null);
      const updatedTask = await taskService.toggleTask(id);
      setTasks(tasks.map(task => task.id === id ? updatedTask : task));
    } catch (err) {
      setError('Failed to update task.');
      console.error('Error toggling task:', err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      setError(null);
      await taskService.deleteTask(id);
      setTasks(tasks.filter(task => task.id !== id));
    } catch (err) {
      setError('Failed to delete task.');
      console.error('Error deleting task:', err);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>📝 Task Manager</h1>
        <p>Stay organized and productive</p>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <AddTask onAdd={handleAddTask} />

        {loading ? (
          <p className="loading">Loading tasks...</p>
        ) : (
          <TaskList 
            tasks={tasks} 
            onToggle={handleToggleTask} 
            onDelete={handleDeleteTask} 
          />
        )}
      </main>

      <footer className="app-footer">
        <p>Total: {tasks.length} | Completed: {tasks.filter(t => t.completed).length}</p>
      </footer>
    </div>
  );
}

export default App;
