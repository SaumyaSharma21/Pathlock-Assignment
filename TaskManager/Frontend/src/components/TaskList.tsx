import type { TaskItem } from '../types/interfaces';
import './TaskList.css';

interface TaskListProps {
  tasks: TaskItem[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TaskList({ tasks, onToggle, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return <p className="no-tasks">No tasks yet. Add one above!</p>;
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
          <div className="task-content">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggle(task.id)}
              className="task-checkbox"
            />
            <span className="task-description">{task.description}</span>
          </div>
          <button 
            onClick={() => onDelete(task.id)} 
            className="delete-btn"
            aria-label="Delete task"
          >
            🗑️
          </button>
        </li>
      ))}
    </ul>
  );
}
