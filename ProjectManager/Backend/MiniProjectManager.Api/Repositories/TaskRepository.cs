using Microsoft.EntityFrameworkCore;
using MiniProjectManager.Api.Data;
using MiniProjectManager.Api.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MiniProjectManager.Api.Repositories
{
    public class TaskRepository : ITaskRepository
    {
        private readonly AppDbContext _db;

        public TaskRepository(AppDbContext db)
        {
            _db = db;
        }

        public async Task AddAsync(TaskItem task)
        {
            await _db.Tasks.AddAsync(task);
        }

        public async Task<TaskItem?> GetByIdAsync(Guid id)
        {
            return await _db.Tasks.FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<IEnumerable<TaskItem>> GetByProjectIdAsync(Guid projectId)
        {
            return await _db.Tasks.Where(t => t.ProjectId == projectId).ToListAsync();
        }

        public void Remove(TaskItem task)
        {
            _db.Tasks.Remove(task);
        }

        public void Update(TaskItem task)
        {
            _db.Tasks.Update(task);
        }

        public async Task SaveChangesAsync()
        {
            await _db.SaveChangesAsync();
        }
    }
}
