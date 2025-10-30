using MiniProjectManager.Api.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MiniProjectManager.Api.Repositories
{
    public interface ITaskRepository
    {
        Task<IEnumerable<TaskItem>> GetByProjectIdAsync(Guid projectId);
        Task<TaskItem?> GetByIdAsync(Guid id);
        Task AddAsync(TaskItem task);
        void Update(TaskItem task);
        void Remove(TaskItem task);
        Task SaveChangesAsync();
    }
}
