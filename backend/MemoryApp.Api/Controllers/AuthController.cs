using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MemoryApp.Api.Data;
using MemoryApp.Api.Dtos;
using MemoryApp.Api.Models;

namespace MemoryApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuthController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) ||
            string.IsNullOrWhiteSpace(dto.Username) ||
            string.IsNullOrWhiteSpace(dto.Password))
        {
            return BadRequest("Заполните все поля.");
        }

        var emailExists = await _context.Users
            .AnyAsync(u => u.Email == dto.Email);

        if (emailExists)
        {
            return BadRequest("Пользователь уже существует.");
        }

        var user = new User
        {
            Email = dto.Email,
            Username = dto.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Регистрация успешна",
            user.Id,
            user.Email,
            user.Username
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (user == null)
        {
            return Unauthorized("Неверная почта или пароль.");
        }

        var validPassword = BCrypt.Net.BCrypt.Verify(
            dto.Password,
            user.PasswordHash
        );

        if (!validPassword)
        {
            return Unauthorized("Неверная почта или пароль.");
        }

        return Ok(new
        {
            message = "Вход выполнен",
            user.Id,
            user.Email,
            user.Username
        });
    }
}