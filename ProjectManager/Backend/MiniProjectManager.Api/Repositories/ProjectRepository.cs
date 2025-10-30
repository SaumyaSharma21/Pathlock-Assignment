using Microsoft.EntityFrameworkCore;
using MiniProjectManager.Api.Data;
using MiniProjectManager.Api.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MiniProjectManager.Api.Repositories
{
    public class ProjectRepository : IProjectRepository
    {
        private readonly AppDbContext _db;

        public ProjectRepository(AppDbContext db)
        {
            _db = db;
        }

        public async Task AddAsync(Project project)
        {
            await _db.Projects.AddAsync(project);
        }

        public async Task<IEnumerable<Project>> GetAllByOwnerAsync(Guid ownerId)
        {
            return await _db.Projects.Where(p => p.OwnerId == ownerId).ToListAsync();
        }

        public async Task<Project?> GetByIdAsync(Guid id)
        {
            return await _db.Projects.Include(p => p.Tasks).FirstOrDefaultAsync(p => p.Id == id);
        }

        public void Remove(Project project)
        {
            _db.Projects.Remove(project);
        }

        public void Update(Project project)
        {
            _db.Projects.Update(project);
        }

        public async Task SaveChangesAsync()
        {
            await _db.SaveChangesAsync();
        }
    }
}
