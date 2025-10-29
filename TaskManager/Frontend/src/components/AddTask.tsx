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
    <form onSubmit={handleSubmit} className="add-task-form">
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Enter a new task..."
        className="task-input"
      />
      <button type="submit" className="add-btn">
        Add Task
      </button>
    </form>
  );
}
