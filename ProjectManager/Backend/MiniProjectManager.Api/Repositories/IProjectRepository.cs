using MiniProjectManager.Api.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MiniProjectManager.Api.Repositories
{
    public interface IProjectRepository
    {
        Task<IEnumerable<Project>> GetAllByOwnerAsync(Guid ownerId);
        Task<Project?> GetByIdAsync(Guid id);
        Task AddAsync(Project project);
        void Update(Project project);
        void Remove(Project project);
        Task SaveChangesAsync();
    }
}
