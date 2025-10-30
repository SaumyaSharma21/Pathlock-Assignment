using Microsoft.EntityFrameworkCore;
using MiniProjectManager.Api.Models;

namespace MiniProjectManager.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Project> Projects { get; set; } = null!;
        public DbSet<TaskItem> Tasks { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(u =>
            {
                u.HasIndex(x => x.Username).IsUnique();
                u.HasIndex(x => x.Email).IsUnique();
            });

            modelBuilder.Entity<Project>(p =>
            {
                p.HasOne(x => x.Owner).WithMany(u => u.Projects).HasForeignKey(x => x.OwnerId).OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<TaskItem>(t =>
            {
                t.HasOne(x => x.Project).WithMany(p => p.Tasks).HasForeignKey(x => x.ProjectId).OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
