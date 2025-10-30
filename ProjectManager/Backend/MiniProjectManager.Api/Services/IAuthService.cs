using MiniProjectManager.Api.DTOs;
using System.Threading.Tasks;

namespace MiniProjectManager.Api.Services
{
    public interface IAuthService
    {
        Task RegisterAsync(UserRegisterDto dto);
        Task<string> LoginAsync(UserLoginDto dto);
    }
}
