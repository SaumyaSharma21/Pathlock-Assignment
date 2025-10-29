import { useState, useMemo, useEffect } from 'react';
import type { TaskItem } from './types/interfaces';
import { taskService } from './services/taskService';
import AddTask from './components/AddTask';
import TaskList from './components/TaskList';
import './App.css';

type Filter = 'all' | 'active' | 'completed';

function App() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<Filter>('all');

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
      setTasks((prev) => [newTask, ...prev]);
    } catch (err) {
      setError('Failed to add task.');
      console.error('Error adding task:', err);
    }
  };

  const handleToggleTask = async (id: string) => {
    try {
      setError(null);
      const updatedTask = await taskService.toggleTask(id);
      setTasks((prev) => prev.map(task => task.id === id ? updatedTask : task));
    } catch (err) {
      setError('Failed to update task.');
      console.error('Error toggling task:', err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      setError(null);
      await taskService.deleteTask(id);
      setTasks((prev) => prev.filter(task => task.id !== id));
    } catch (err) {
      setError('Failed to delete task.');
      console.error('Error deleting task:', err);
    }
  };

  const filteredTasks = useMemo(() => {
    switch (activeFilter) {
      case 'active':
        return tasks.filter((task) => !task.completed);
      case 'completed':
        return tasks.filter((task) => task.completed);
      default:
        return tasks;
    }
  }, [tasks, activeFilter]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const hasTasks = totalTasks > 0;

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero-content">
          <h1>Task Manager</h1>
          <p>Capture, organize, and celebrate your progress.</p>
        </div>
      </header>

      <main className="dashboard">
        <section className="panel">
          <div className="panel-header">
            <h2>Your tasks</h2>
            <button type="button" className="refresh-btn" onClick={fetchTasks}>
              Refresh
            </button>
          </div>

          {error && (
            <div className="banner banner-error" role="alert">
              {error}
            </div>
          )}

          <AddTask onAdd={handleAddTask} />

          <div className="status-bar" aria-live="polite">
            <div className="status-pill">
              <span className="status-count">{totalTasks}</span>
              Total
            </div>
            <div className="status-pill">
              <span className="status-count">{completedTasks}</span>
              Completed
            </div>
            <div className="status-pill">
              <span className="status-count">{totalTasks - completedTasks}</span>
              Active
            </div>
          </div>

          {hasTasks && (
            <div className="filter-chips" role="tablist" aria-label="Filter tasks">
              {(['all', 'active', 'completed'] as Filter[]).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === filter}
                  className={`filter-chip ${activeFilter === filter ? 'is-active' : ''}`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter === 'all' ? 'All' : filter === 'active' ? 'Active' : 'Completed'}
                </button>
              ))}
            </div>
          )}

          <section className="tasks-section">
            {loading ? (
              <div className="loading-card">Loading tasks...</div>
            ) : filteredTasks.length > 0 ? (
              <TaskList tasks={filteredTasks} onToggle={handleToggleTask} onDelete={handleDeleteTask} />
            ) : hasTasks ? (
              <div className="empty-state">
                <h3>No tasks match this filter</h3>
                <p>Try switching filters or create something new.</p>
              </div>
            ) : (
              <div className="empty-state">
                <h3>Welcome! Ready to be productive?</h3>
                <p>Add your first task to get started.</p>
              </div>
            )}
          </section>
        </section>
      </main>

      <footer className="app-footer">
        <p>Made with care · Stay on top of your day</p>
      </footer>
    </div>
  );
}

export default App;
