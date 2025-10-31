using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiniProjectManager.Api.DTOs;
using MiniProjectManager.Api.Models;
using MiniProjectManager.Api.Repositories;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace MiniProjectManager.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProjectsController : ControllerBase
    {
        private readonly IProjectRepository _projects;
        private readonly ITaskRepository _tasks;

        public ProjectsController(IProjectRepository projects, ITaskRepository tasks)
        {
            _projects = projects;
            _tasks = tasks;
        }

        private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? Guid.Empty.ToString());

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _projects.GetAllByOwnerAsync(CurrentUserId);
            var dto = list.Select(p => new ProjectDto { Id = p.Id, Title = p.Title, Description = p.Description, CreatedAt = p.CreatedAt, UpdatedAt = p.UpdatedAt });
            return Ok(dto);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(Guid id)
        {
            var p = await _projects.GetByIdAsync(id);
            if (p == null || p.OwnerId != CurrentUserId) return NotFound();
            var dto = new ProjectDto { Id = p.Id, Title = p.Title, Description = p.Description, CreatedAt = p.CreatedAt, UpdatedAt = p.UpdatedAt };
            return Ok(dto);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ProjectCreateDto dto)
        {
            var project = new Project { Title = dto.Title, Description = dto.Description, OwnerId = CurrentUserId };
            await _projects.AddAsync(project);
            await _projects.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = project.Id }, new ProjectDto { Id = project.Id, Title = project.Title, Description = project.Description, CreatedAt = project.CreatedAt });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] ProjectCreateDto dto)
        {
            var project = await _projects.GetByIdAsync(id);
            if (project == null || project.OwnerId != CurrentUserId) return NotFound();
            project.Title = dto.Title;
            project.Description = dto.Description;
            project.UpdatedAt = DateTime.UtcNow;
            _projects.Update(project);
            await _projects.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var project = await _projects.GetByIdAsync(id);
            if (project == null || project.OwnerId != CurrentUserId) return NotFound();
            _projects.Remove(project);
            await _projects.SaveChangesAsync();
            return NoContent();
        }

        // Tasks endpoints (nested)
        [HttpGet("{projectId}/tasks")]
        public async Task<IActionResult> GetTasks(Guid projectId)
        {
            var project = await _projects.GetByIdAsync(projectId);
            if (project == null || project.OwnerId != CurrentUserId) return NotFound();
            var tasks = await _tasks.GetByProjectIdAsync(projectId);
            var dto = tasks.Select(t => new TaskDto { 
                Id = t.Id, 
                Title = t.Title, 
                Description = t.Description, 
                Status = t.Status, 
                DueDate = t.DueDate, 
                EstimatedHours = t.EstimatedHours,
                Dependencies = t.GetDependencies(),
                ProjectId = t.ProjectId, 
                AssignedToUserId = t.AssignedToUserId,
                ScheduledOrder = t.ScheduledOrder
            });
            return Ok(dto);
        }

        // Smart scheduler: generates a suggested schedule for project tasks
        [HttpPost("/api/v1/projects/{projectId}/schedule")]
        public async Task<IActionResult> ScheduleProject(Guid projectId, [FromBody] DTOs.ScheduleRequestDto? dto)
        {
            var project = await _projects.GetByIdAsync(projectId);
            if (project == null || project.OwnerId != CurrentUserId) return NotFound();

            var startDate = dto?.StartDate?.ToUniversalTime().Date ?? DateTime.UtcNow.Date;

            // Use tasks from request if provided, otherwise use existing project tasks
            List<(string title, int hours, DateTime? due, List<string> deps)> tasksToSchedule;

            if (dto?.Tasks?.Any() == true)
            {
                // Use tasks from request body (for planning new work)
                tasksToSchedule = dto.Tasks.Select(t => (
                    title: t.Title,
                    hours: t.EstimatedHours,
                    due: t.DueDate,
                    deps: t.Dependencies ?? new List<string>()
                )).ToList();
            }
            else
            {
                // Use existing project tasks
                var existingTasks = await _tasks.GetByProjectIdAsync(projectId);
                tasksToSchedule = existingTasks
                    .Where(t => t.Status != Models.TaskStatus.Completed) // Only schedule incomplete tasks
                    .Select(t => (
                        title: t.Title,
                        hours: t.EstimatedHours,
                        due: t.DueDate,
                        deps: t.GetDependencies()
                    )).ToList();
            }

            // Advanced scheduling algorithm with dependency resolution
            var scheduledTasks = ScheduleTasksWithDependencies(tasksToSchedule, startDate);
            
            var response = new DTOs.ScheduleResponseDto
            {
                RecommendedOrder = scheduledTasks.Select(t => t.Title).ToList(),
                DetailedSchedule = scheduledTasks
            };

            return Ok(response);
        }

        private List<DTOs.ScheduledTaskDto> ScheduleTasksWithDependencies(
            List<(string title, int hours, DateTime? due, List<string> deps)> tasks, 
            DateTime startDate)
        {
            var result = new List<DTOs.ScheduledTaskDto>();
            var completed = new HashSet<string>();
            var taskMap = tasks.ToDictionary(t => t.title, t => t);
            var currentDate = startDate;

            // Topological sort with scheduling
            while (completed.Count < tasks.Count)
            {
                var readyTasks = tasks
                    .Where(t => !completed.Contains(t.title) && 
                               t.deps.All(dep => completed.Contains(dep)))
                    .OrderBy(t => t.due ?? DateTime.MaxValue) // Priority by due date
                    .ThenBy(t => t.hours) // Then by estimated time
                    .ToList();

                if (!readyTasks.Any())
                {
                    // Circular dependency or missing dependency - schedule remaining tasks anyway
                    readyTasks = tasks.Where(t => !completed.Contains(t.title)).ToList();
                }

                var taskToSchedule = readyTasks.First();
                
                // Calculate end date based on estimated hours (assuming 8 work hours per day)
                var workDays = Math.Max(1, (int)Math.Ceiling(taskToSchedule.hours / 8.0));
                var endDate = currentDate.AddDays(workDays - 1);

                // If task has due date and we're past it, schedule on due date
                if (taskToSchedule.due.HasValue && currentDate > taskToSchedule.due.Value.Date)
                {
                    currentDate = taskToSchedule.due.Value.Date;
                    endDate = currentDate.AddDays(workDays - 1);
                }

                result.Add(new DTOs.ScheduledTaskDto
                {
                    Title = taskToSchedule.title,
                    ScheduledStartDate = currentDate,
                    ScheduledEndDate = endDate,
                    EstimatedHours = taskToSchedule.hours,
                    Dependencies = taskToSchedule.deps,
                    AssignedToUserId = null,
                    OriginalDueDate = taskToSchedule.due
                });

                completed.Add(taskToSchedule.title);
                currentDate = endDate.AddDays(1); // Next task starts the day after current ends
            }

            return result;
        }

        [HttpPost("{projectId}/tasks/reorder")]
        public async Task<IActionResult> ReorderTasks(Guid projectId, [FromBody] TaskReorderRequestDto request)
        {
            if (request?.Tasks == null)
            {
                return BadRequest("Task order payload is required.");
            }

            var project = await _projects.GetByIdAsync(projectId);
            if (project == null || project.OwnerId != CurrentUserId) return NotFound();

            var orderLookup = request.Tasks
                .GroupBy(t => t.TaskId)
                .Select(g => g.First())
                .ToDictionary(t => t.TaskId, t => t.Order);

            var projectTasks = (await _tasks.GetByProjectIdAsync(projectId)).ToList();

            foreach (var task in projectTasks)
            {
                if (orderLookup.TryGetValue(task.Id, out var order))
                {
                    task.ScheduledOrder = order;
                }
                else
                {
                    task.ScheduledOrder = null;
                }

                _tasks.Update(task);
            }

            await _tasks.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("{projectId}/tasks")]
        public async Task<IActionResult> CreateTask(Guid projectId, [FromBody] DTOs.TaskCreateDto dto)
        {
            var project = await _projects.GetByIdAsync(projectId);
            if (project == null || project.OwnerId != CurrentUserId) return NotFound();
            var task = new TaskItem { 
                Title = dto.Title, 
                Description = dto.Description, 
                DueDate = dto.DueDate, 
                EstimatedHours = dto.EstimatedHours,
                ProjectId = projectId, 
                AssignedToUserId = dto.AssignedToUserId 
            };
            task.SetDependencies(dto.Dependencies ?? new List<string>());
            await _tasks.AddAsync(task);
            await _tasks.SaveChangesAsync();
            return CreatedAtAction(nameof(GetTasks), new { projectId }, new TaskDto { 
                Id = task.Id, 
                Title = task.Title, 
                Description = task.Description, 
                Status = task.Status, 
                DueDate = task.DueDate, 
                EstimatedHours = task.EstimatedHours,
                Dependencies = task.GetDependencies(),
                ProjectId = task.ProjectId,
                AssignedToUserId = task.AssignedToUserId,
                ScheduledOrder = task.ScheduledOrder
            });
        }

        // Direct task endpoints (without project nesting)
        [HttpPut("/api/tasks/{taskId}")]
        public async Task<IActionResult> UpdateTask(Guid taskId, [FromBody] DTOs.TaskUpdateDto dto)
        {
            var task = await _tasks.GetByIdAsync(taskId);
            if (task == null) return NotFound();
            
            // Verify the task's project belongs to current user
            var project = await _projects.GetByIdAsync(task.ProjectId);
            if (project == null || project.OwnerId != CurrentUserId) return NotFound();
            
            task.Title = dto.Title;
            task.Description = dto.Description;
            task.Status = dto.Status;
            task.DueDate = dto.DueDate;
            task.EstimatedHours = dto.EstimatedHours;
            task.SetDependencies(dto.Dependencies ?? new List<string>());
            task.AssignedToUserId = dto.AssignedToUserId;
            _tasks.Update(task);
            await _tasks.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("/api/tasks/{taskId}")]
        public async Task<IActionResult> DeleteTask(Guid taskId)
        {
            var task = await _tasks.GetByIdAsync(taskId);
            if (task == null) return NotFound();
            
            // Verify the task's project belongs to current user
            var project = await _projects.GetByIdAsync(task.ProjectId);
            if (project == null || project.OwnerId != CurrentUserId) return NotFound();
            
            _tasks.Remove(task);
            await _tasks.SaveChangesAsync();
            return NoContent();
        }
    }
}
