using MiniProjectManager.Api.Models;
using System;
using System.Threading.Tasks;

namespace MiniProjectManager.Api.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(Guid id);
        Task<User?> GetByUsernameAsync(string username);
        Task AddAsync(User user);
        Task SaveChangesAsync();
    }
}
