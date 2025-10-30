import React, { useEffect, useState } from 'react'
import api from '../api/api'
import { Link } from 'react-router-dom'

type ProjectDto = {
  id: string
  title: string
  description?: string
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectDto[]>([])

  useEffect(() => {
    api.get('/api/projects').then((r) => setProjects(r.data)).catch(() => setProjects([]))
  }, [])

  return (
    <div style={{ padding: 24 }}>
      <h2>Your Projects</h2>
      <ul>
        {projects.map((p) => (
          <li key={p.id}>
            <Link to={`/projects/${p.id}`}>{p.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
