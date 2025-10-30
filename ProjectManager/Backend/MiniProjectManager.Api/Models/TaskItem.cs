using System;
using System.ComponentModel.DataAnnotations;

namespace MiniProjectManager.Api.Models
{
    public enum TaskStatus
    {
        Todo = 0,
        InProgress = 1,
        Done = 2
    }

    public class TaskItem
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [StringLength(300)]
        public string Title { get; set; } = null!;

        [StringLength(2000)]
        public string? Description { get; set; }

        public TaskStatus Status { get; set; } = TaskStatus.Todo;

        public DateTime? DueDate { get; set; }

        public Guid ProjectId { get; set; }
        public Project? Project { get; set; }

        public Guid? AssignedToUserId { get; set; }
    }
}
