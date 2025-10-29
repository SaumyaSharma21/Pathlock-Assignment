import { useState, useMemo, useEffect, useCallback } from 'react';
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
  const cachedTasks = useMemo(() => loadTasksFromStorage(), []);
  const hasCachedTasks = cachedTasks.length > 0;

  const [tasks, setTasks] = useState<TaskItem[]>(cachedTasks);
  const [loading, setLoading] = useState(!hasCachedTasks);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<Filter>('all');
  const [isClearing, setIsClearing] = useState(false);

  const fetchTasks = useCallback(
    async ({ showSpinner = true }: { showSpinner?: boolean } = {}) => {
      try {
        if (showSpinner) {
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
    },
    []
  );

  useEffect(() => {
    saveTasksToStorage(tasks);
  }, [tasks]);

  useEffect(() => {
    fetchTasks({ showSpinner: !hasCachedTasks });
  }, [fetchTasks, hasCachedTasks]);

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
  const completionRate = useMemo(() => (
    totalTasks === 0 ? 0 : Math.round((completedCount / totalTasks) * 100)
  ), [totalTasks, completedCount]);

  const headerMessage = hasTasks
    ? activeCount === 0
      ? 'All caught up, enjoy the momentum.'
      : `Focus on ${activeCount} open ${activeCount === 1 ? 'task' : 'tasks'} today.`
    : 'Set your priorities to start strong.';

  const nextActionCopy = useMemo(() => {
    if (!hasTasks) {
      return 'Create your first task to start tracking progress.';
    }
    if (activeCount === 0) {
      return 'All tasks are complete. Keep the streak going!';
    }
    return `Focus on ${activeCount === 1 ? 'the remaining task' : `${activeCount} open tasks`} today.`;
  }, [hasTasks, activeCount]);

  const goalCopy = useMemo(() => {
    if (!hasTasks) {
      return 'Capture at least three starter items for today.';
    }
    return completionRate >= 80
      ? 'Excellent momentum, aim to maintain the pace.'
      : 'Aim for at least 80% completion.';
  }, [hasTasks, completionRate]);

  const rateCopy = hasTasks
    ? `Completion rate: ${completionRate}%`
    : 'Completion rate will appear once tasks are added.';

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
      <div className="app-frame">
        <header className="app-header">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">TM</span>
            <div className="brand-copy">
              <h1>Task Manager</h1>
              <p>Your productivity dashboard</p>
            </div>
          </div>
          <div className="header-summary" aria-live="polite">
            <span className="summary-copy">{headerMessage}</span>
          </div>
        </header>

        <main className="main-grid">
          <section className="overview-card">
            <div className="overview-hero">
              <h2>Plan your day</h2>
              <p>Review priorities, track momentum, and keep the team aligned.</p>
            </div>

            <div className="metrics-grid" role="list">
              <article className="metric-card" role="listitem">
                <span className="metric-label">Total tasks</span>
                <span className="metric-value">{totalTasks}</span>
                <span className="metric-footnote">{completedCount} completed overall</span>
              </article>
              <article className="metric-card metric-card--secondary" role="listitem">
                <span className="metric-label">Active</span>
                <span className="metric-value">{activeCount}</span>
                <span className="metric-footnote">
                  {hasTasks ? 'Keep the momentum moving' : 'Start by adding tasks'}
                </span>
              </article>
              <article className="metric-card metric-card--accent" role="listitem">
                <span className="metric-label">Completion</span>
                <span className="metric-value">{completionRate}%</span>
                <span className="metric-footnote">
                  {hasTasks ? `${completedCount} done` : 'Track progress instantly'}
                </span>
              </article>
            </div>

            <ul className="insights-list">
              <li>{nextActionCopy}</li>
              <li>{goalCopy}</li>
              <li>{rateCopy}</li>
            </ul>
          </section>

          <section className="tasks-card">
            <div className="tasks-header">
              <div className="tasks-title">
                <h2>Workboard</h2>
                <span>
                  {hasTasks
                    ? `${activeCount} open · ${completedCount} done`
                    : "No tasks yet, let's create your plan"}
                </span>
              </div>
              <button
                type="button"
                className="refresh-btn"
                onClick={() => fetchTasks({ showSpinner: true })}
                disabled={loading}
              >
                {loading ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>

            {error && (
              <div className="banner banner-error" role="alert">
                {error}
              </div>
            )}

            <AddTask onAdd={handleAddTask} />

            <div className="task-toolbar" role="toolbar" aria-label="Task filters and actions">
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
                {isClearing ? 'Clearing...' : 'Clear completed'}
              </button>
            </div>

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
    </div>
  );
}

export default App;
