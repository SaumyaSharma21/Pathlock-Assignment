import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/api'

type TaskDto = {
  id: string
  title: string
  description?: string
  status: string
}

export default function ProjectDetailsPage() {
  const { id } = useParams()
  const [tasks, setTasks] = useState<TaskDto[]>([])

  useEffect(() => {
    if (!id) return
    api.get(`/api/projects/${id}/tasks`).then((r) => setTasks(r.data)).catch(() => setTasks([]))
  }, [id])

  return (
    <div style={{ padding: 24 }}>
      <h2>Project</h2>
      <h3>Tasks</h3>
      <ul>
        {tasks.map((t) => (
          <li key={t.id}>{t.title} — {t.status}</li>
        ))}
      </ul>
    </div>
  )
}
