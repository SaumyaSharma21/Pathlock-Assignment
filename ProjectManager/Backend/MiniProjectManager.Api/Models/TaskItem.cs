using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MiniProjectManager.Api.Models
{
    public enum TaskStatus
    {
        NotStarted = 0,
        InProgress = 1,
        Completed = 2
    }

    public class TaskItem
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [StringLength(300)]
        public string Title { get; set; } = null!;

        [StringLength(2000)]
        public string? Description { get; set; }

        public TaskStatus Status { get; set; } = TaskStatus.NotStarted;

        public DateTime? DueDate { get; set; }

        // New properties for advanced scheduling
        public int EstimatedHours { get; set; } = 8; // Default 1 day

        // Dependencies stored as comma-separated task titles for simplicity
        [StringLength(1000)]
        public string? Dependencies { get; set; }

        public Guid ProjectId { get; set; }
        public Project? Project { get; set; }

        public Guid? AssignedToUserId { get; set; }
        
        // Helper method to get dependencies as list
        public List<string> GetDependencies()
        {
            if (string.IsNullOrWhiteSpace(Dependencies))
                return new List<string>();
            
            return Dependencies.Split(',', StringSplitOptions.RemoveEmptyEntries)
                             .Select(d => d.Trim())
                             .ToList();
        }

        // Helper method to set dependencies from list
        public void SetDependencies(List<string> deps)
        {
            Dependencies = deps?.Any() == true ? string.Join(",", deps) : null;
        }
    }
}
