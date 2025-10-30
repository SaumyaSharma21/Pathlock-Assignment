using System;

namespace MiniProjectManager.Api.DTOs
{
    public class ScheduledTaskDto
    {
        public Guid TaskId { get; set; }
        public DateTime ScheduledDate { get; set; }
        public Guid? AssignedToUserId { get; set; }
    }
}
