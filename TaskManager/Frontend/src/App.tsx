import { useState, useMemo, useEffect } from 'react';
import type { TaskItem } from './types/interfaces';
import { taskService } from './services/taskService';
import AddTask from './components/AddTask';
import TaskList from './components/TaskList';
import './App.css';

type Filter = 'all' | 'active' | 'completed';
const STORAGE_KEY = 'task-manager.tasks.v1';

const loadTasksFromStorage = (): TaskItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: TaskItem[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (error) {
    console.warn('Unable to parse cached tasks', error);
    return [];
  }
};

const saveTasksToStorage = (tasks: TaskItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.warn('Unable to persist tasks', error);
  }
};

function App() {
  const [tasks, setTasks] = useState<TaskItem[]>(() => loadTasksFromStorage());
  const [loading, setLoading] = useState(() => loadTasksFromStorage().length === 0);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<Filter>('all');
  const [isClearing, setIsClearing] = useState(false);

  // Fetch tasks on component mount
  useEffect(() => {
    if (tasks.length > 0) {
      setLoading(false);
    }
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist tasks whenever they change
  useEffect(() => {
    saveTasksToStorage(tasks);
  }, [tasks]);

  const fetchTasks = async () => {
    try {
      if (tasks.length === 0) {
        setLoading(true);
      }
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
  const completedCount = useMemo(
    () => tasks.filter((task) => task.completed).length,
    [tasks]
  );
  const hasTasks = totalTasks > 0;
  const activeCount = totalTasks - completedCount;
  const hasCompleted = completedCount > 0;

  const handleClearCompleted = async () => {
    const completedTasks = tasks.filter((task) => task.completed);
    if (completedTasks.length === 0) return;

    try {
      setIsClearing(true);
      setError(null);
      await Promise.all(
        completedTasks.map((task) => taskService.deleteTask(task.id))
      );
      setTasks((prev) => prev.filter((task) => !task.completed));
    } catch (err) {
      setError('Failed to clear completed tasks.');
      console.error('Error clearing completed tasks:', err);
    } finally {
      setIsClearing(false);
    }
  };

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
            <div className="panel-title">
              <h2>Your tasks</h2>
              <span>
                {hasTasks
                  ? `${activeCount} to go • ${completedCount} done`
                  : 'No tasks yet — let’s create your plan'}
              </span>
            </div>
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
              <span className="status-count">{completedCount}</span>
              Completed
            </div>
            <div className="status-pill">
              <span className="status-count">{activeCount}</span>
              Active
            </div>
          </div>

          {hasTasks && (
            <div className="toolbar" role="toolbar" aria-label="Task filters and actions">
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
              <button
                type="button"
                className="clear-completed-btn"
                onClick={handleClearCompleted}
                disabled={!hasCompleted || isClearing}
              >
                {isClearing ? 'Clearing…' : 'Clear completed'}
              </button>
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
