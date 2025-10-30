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
            var dto = tasks.Select(t => new TaskDto { Id = t.Id, Title = t.Title, Description = t.Description, Status = t.Status, DueDate = t.DueDate, ProjectId = t.ProjectId, AssignedToUserId = t.AssignedToUserId });
            return Ok(dto);
        }

        [HttpPost("{projectId}/tasks")]
        public async Task<IActionResult> CreateTask(Guid projectId, [FromBody] DTOs.TaskCreateDto dto)
        {
            var project = await _projects.GetByIdAsync(projectId);
            if (project == null || project.OwnerId != CurrentUserId) return NotFound();
            var task = new TaskItem { Title = dto.Title, Description = dto.Description, DueDate = dto.DueDate, ProjectId = projectId, AssignedToUserId = dto.AssignedToUserId };
            await _tasks.AddAsync(task);
            await _tasks.SaveChangesAsync();
            return CreatedAtAction(nameof(GetTasks), new { projectId }, new TaskDto { Id = task.Id, Title = task.Title, Description = task.Description, Status = task.Status, DueDate = task.DueDate, ProjectId = task.ProjectId });
        }

        [HttpPut("{projectId}/tasks/{taskId}")]
        public async Task<IActionResult> UpdateTask(Guid projectId, Guid taskId, [FromBody] DTOs.TaskUpdateDto dto)
        {
            var project = await _projects.GetByIdAsync(projectId);
            if (project == null || project.OwnerId != CurrentUserId) return NotFound();
            var task = await _tasks.GetByIdAsync(taskId);
            if (task == null || task.ProjectId != projectId) return NotFound();
            task.Title = dto.Title;
            task.Description = dto.Description;
            task.Status = dto.Status;
            task.DueDate = dto.DueDate;
            task.AssignedToUserId = dto.AssignedToUserId;
            _tasks.Update(task);
            await _tasks.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{projectId}/tasks/{taskId}")]
        public async Task<IActionResult> DeleteTask(Guid projectId, Guid taskId)
        {
            var project = await _projects.GetByIdAsync(projectId);
            if (project == null || project.OwnerId != CurrentUserId) return NotFound();
            var task = await _tasks.GetByIdAsync(taskId);
            if (task == null || task.ProjectId != projectId) return NotFound();
            _tasks.Remove(task);
            await _tasks.SaveChangesAsync();
            return NoContent();
        }
    }
}
