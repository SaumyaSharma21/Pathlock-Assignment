using System;
using System.Collections.Generic;
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
        
        [Range(1, 1000)]
        public int EstimatedHours { get; set; } = 8;
        
        public List<string>? Dependencies { get; set; }
        
        public Guid? AssignedToUserId { get; set; }
    }
}
