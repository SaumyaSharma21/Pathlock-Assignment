using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using MiniProjectManager.Api.Models;

namespace MiniProjectManager.Api.Data
{
    public static class SeedData
    {
        public static async Task EnsureSeedDataAsync(IServiceProvider services)
        {
            using var scope = services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            // Apply migrations (if any)
            await db.Database.MigrateAsync();

            if (db.Users.Any()) return; // already seeded

            // create default user
            using var hmac = new HMACSHA512();
            var user = new User
            {
                Username = "demo",
                Email = "demo@example.com",
                PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes("password")),
                PasswordSalt = hmac.Key,
                FullName = "Demo User"
            };

            await db.Users.AddAsync(user);

            var project = new Project
            {
                Title = "Welcome Project",
                Description = "A sample project created during seeding.",
                Owner = user
            };

            await db.Projects.AddAsync(project);

            var t1 = new TaskItem { Title = "Setup project", Description = "Initial setup tasks", Project = project, Status = MiniProjectManager.Api.Models.TaskStatus.NotStarted };
            var t2 = new TaskItem { Title = "Create sample task", Description = "A completed example", Project = project, Status = MiniProjectManager.Api.Models.TaskStatus.Completed };

            await db.Tasks.AddRangeAsync(t1, t2);

            await db.SaveChangesAsync();
        }
    }
}
