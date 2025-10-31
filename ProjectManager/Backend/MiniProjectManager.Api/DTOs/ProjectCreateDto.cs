using System.ComponentModel.DataAnnotations;

namespace MiniProjectManager.Api.DTOs
{
    public class ProjectCreateDto
    {
        [Required]
        [StringLength(100, MinimumLength = 3)]
        public string Title { get; set; } = null!;

        [StringLength(500)]
        public string? Description { get; set; }
    }
}
