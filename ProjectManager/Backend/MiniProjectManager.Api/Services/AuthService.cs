using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using MiniProjectManager.Api.DTOs;
using MiniProjectManager.Api.Helpers;
using MiniProjectManager.Api.Models;
using MiniProjectManager.Api.Repositories;

namespace MiniProjectManager.Api.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _users;
        private readonly JwtSettings _jwt;

        public AuthService(IUserRepository users, IOptions<JwtSettings> jwtOptions)
        {
            _users = users;
            _jwt = jwtOptions.Value;
        }

        public async Task RegisterAsync(UserRegisterDto dto)
        {
            var existing = await _users.GetByUsernameAsync(dto.Username);
            if (existing != null) throw new InvalidOperationException("Username already exists");

            using var hmac = new HMACSHA512();
            var user = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(dto.Password)),
                PasswordSalt = hmac.Key
            };

            await _users.AddAsync(user);
            await _users.SaveChangesAsync();
        }

        public async Task<string> LoginAsync(UserLoginDto dto)
        {
            var user = await _users.GetByUsernameAsync(dto.Username);
            if (user == null) throw new InvalidOperationException("Invalid credentials");

            using var hmac = new HMACSHA512(user.PasswordSalt);
            var computed = hmac.ComputeHash(Encoding.UTF8.GetBytes(dto.Password));
            if (!CryptographicOperations.FixedTimeEquals(computed, user.PasswordHash))
                throw new InvalidOperationException("Invalid credentials");

            // generate token
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_jwt.SecretKey);
            var claims = new[] { new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), new Claim(ClaimTypes.Name, user.Username) };
            var creds = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature);
            var token = new JwtSecurityToken(
                issuer: _jwt.Issuer,
                audience: _jwt.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(_jwt.ExpiryMinutes),
                signingCredentials: creds
            );

            return tokenHandler.WriteToken(token);
        }
    }
}
