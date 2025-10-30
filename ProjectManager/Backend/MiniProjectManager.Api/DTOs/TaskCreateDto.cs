using System;
using System.ComponentModel.DataAnnotations;

namespace MiniProjectManager.Api.DTOs
{
    public class TaskCreateDto
    {
        [Required]
        [StringLength(300)]
        public string Title { get; set; } = null!;

        [StringLength(2000)]
        public string? Description { get; set; }

        public DateTime? DueDate { get; set; }
        public Guid? AssignedToUserId { get; set; }
    }
}
