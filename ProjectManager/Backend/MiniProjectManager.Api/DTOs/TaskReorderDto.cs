using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MiniProjectManager.Api.DTOs
{
    public class TaskReorderRequestDto
    {
        [Required]
        public List<TaskOrderUpdateDto> Tasks { get; set; } = new();
    }

    public class TaskOrderUpdateDto
    {
        [Required]
        public Guid TaskId { get; set; }

        [Range(0, int.MaxValue)]
        public int Order { get; set; }
    }
}
