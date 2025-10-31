using System;
using System.Collections.Generic;

namespace MiniProjectManager.Api.DTOs
{
    public class ScheduleRequestDto
    {
        // Optional start date for scheduling. If not provided, server will use UTC today.
        public DateTime? StartDate { get; set; }
        
        // Tasks with their details for advanced scheduling
        public List<TaskScheduleInput>? Tasks { get; set; }
    }
    
    public class TaskScheduleInput
    {
        public string Title { get; set; } = null!;
        public int EstimatedHours { get; set; }
        public DateTime? DueDate { get; set; }
        public List<string>? Dependencies { get; set; }
    }
}
