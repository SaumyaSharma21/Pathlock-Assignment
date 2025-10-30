using System.ComponentModel.DataAnnotations;

namespace MiniProjectManager.Api.DTOs
{
    public class UserLoginDto
    {
        [Required]
        public string Username { get; set; } = null!;

        [Required]
        public string Password { get; set; } = null!;
    }
}
