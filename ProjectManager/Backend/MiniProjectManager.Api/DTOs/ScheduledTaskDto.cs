using System;
using System.Collections.Generic;

namespace MiniProjectManager.Api.DTOs
{
    public class ScheduledTaskDto
    {
        public Guid? TaskId { get; set; }  // Nullable for new tasks from request
        public string Title { get; set; } = null!;
        public DateTime ScheduledStartDate { get; set; }
        public DateTime ScheduledEndDate { get; set; }
        public int EstimatedHours { get; set; }
        public List<string>? Dependencies { get; set; }
        public Guid? AssignedToUserId { get; set; }
        public DateTime? OriginalDueDate { get; set; }  // Original due date from task
    }
    
    public class ScheduleResponseDto
    {
        public List<string> RecommendedOrder { get; set; } = new();
        public List<ScheduledTaskDto> DetailedSchedule { get; set; } = new();
    }
}
