import type { TaskItem } from '../types/interfaces';
import './TaskList.css';

interface TaskListProps {
  tasks: TaskItem[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

const formatTimestamp = (timestamp: string) => {
  try {
    return dateFormatter.format(new Date(timestamp));
  } catch {
    return timestamp;
  }
};

export default function TaskList({ tasks, onToggle, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
          <label className="task-content">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggle(task.id)}
              className="task-checkbox"
            />
            <div className="task-text">
              <span className="task-description">{task.description}</span>
              <span className="task-meta">
                Added {formatTimestamp(task.createdAt)}
              </span>
            </div>
          </label>
          <button
            onClick={() => onDelete(task.id)}
            className="delete-btn"
            aria-label="Delete task"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
