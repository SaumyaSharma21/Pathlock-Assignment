using System.Collections.Concurrent;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace TaskManagerApi
{
    public class TaskItem
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public string Description { get; set; } = string.Empty;

        public bool Completed { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public record CreateTaskDto(string Description);

    public static class TaskStore
    {
        private static readonly ConcurrentDictionary<Guid, TaskItem> _tasks = new();

        public static IEnumerable<TaskItem> GetAll() => _tasks.Values.OrderByDescending(t => t.CreatedAt);

        public static TaskItem Add(TaskItem task)
        {
            _tasks[task.Id] = task;
            return task;
        }

        public static TaskItem? Toggle(Guid id)
        {
            if (_tasks.TryGetValue(id, out var task))
            {
                task.Completed = !task.Completed;
                return task;
            }
            return null;
        }

        public static bool Delete(Guid id) => _tasks.TryRemove(id, out _);
    }

    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Register services (CORS)
            builder.Services.AddCors();

            var app = builder.Build();

            app.UseCors(policy =>
                policy.AllowAnyHeader()
                      .AllowAnyMethod()
                      .WithOrigins("http://localhost:5173")
            );

            // Endpoints
            app.MapGet("/api/tasks", () => Results.Ok(TaskStore.GetAll()));

            app.MapPost("/api/tasks", async (HttpRequest req) =>
            {
                var data = await req.ReadFromJsonAsync<CreateTaskDto>();
                if (data == null || string.IsNullOrWhiteSpace(data.Description))
                    return Results.BadRequest(new { error = "Description is required" });

                var task = new TaskItem { Description = data.Description.Trim() };
                TaskStore.Add(task);
                return Results.Created($"/api/tasks/{task.Id}", task);
            });

            app.MapPatch("/api/tasks/{id:guid}/toggle", (Guid id) =>
            {
                var updated = TaskStore.Toggle(id);
                return updated is not null ? Results.Ok(updated) : Results.NotFound();
            });

            app.MapDelete("/api/tasks/{id:guid}", (Guid id) =>
            {
                return TaskStore.Delete(id) ? Results.NoContent() : Results.NotFound();
            });

            app.Run("http://localhost:5000");
        }
    }
}
