using System;

namespace MiniProjectManager.Api.DTOs
{
    public class ScheduleRequestDto
    {
        // Optional start date for scheduling. If not provided, server will use UTC today.
        public DateTime? StartDate { get; set; }
    }
}
