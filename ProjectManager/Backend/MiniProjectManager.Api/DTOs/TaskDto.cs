using System;
using System.Collections.Generic;
using MiniProjectManager.Api.Models;

namespace MiniProjectManager.Api.DTOs
{
    public class TaskDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public Models.TaskStatus Status { get; set; }
        public DateTime? DueDate { get; set; }
        public int EstimatedHours { get; set; }
        public List<string>? Dependencies { get; set; }
        public Guid ProjectId { get; set; }
        public Guid? AssignedToUserId { get; set; }
        public int? ScheduledOrder { get; set; }
    }
}
