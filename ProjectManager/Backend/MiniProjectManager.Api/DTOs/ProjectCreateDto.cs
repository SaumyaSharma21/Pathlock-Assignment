using System.ComponentModel.DataAnnotations;

namespace MiniProjectManager.Api.DTOs
{
    public class ProjectCreateDto
    {
        [Required]
        [StringLength(150)]
        public string Title { get; set; } = null!;

        [StringLength(2000)]
        public string? Description { get; set; }
    }
}
