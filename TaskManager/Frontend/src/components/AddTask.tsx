import { useState } from 'react';
import './AddTask.css';

interface AddTaskProps {
  onAdd: (description: string) => void;
}

export default function AddTask({ onAdd }: AddTaskProps) {
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) {
      onAdd(description.trim());
      setDescription('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-task-form" aria-label="Add new task">
      <div className="input-wrapper">
        <span aria-hidden className="input-icon">✏️</span>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What would you like to get done?"
          className="task-input"
          aria-label="Task description"
        />
      </div>
      <button type="submit" className="add-btn">
        Add Task
      </button>
    </form>
  );
}
