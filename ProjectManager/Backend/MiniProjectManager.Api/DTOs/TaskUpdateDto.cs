using System;
using System.ComponentModel.DataAnnotations;
using MiniProjectManager.Api.Models;

namespace MiniProjectManager.Api.DTOs
{
    public class TaskUpdateDto
    {
        [Required]
        [StringLength(300)]
        public string Title { get; set; } = null!;

        [StringLength(2000)]
        public string? Description { get; set; }

    public MiniProjectManager.Api.Models.TaskStatus Status { get; set; }
        public DateTime? DueDate { get; set; }
        public Guid? AssignedToUserId { get; set; }
    }
}
