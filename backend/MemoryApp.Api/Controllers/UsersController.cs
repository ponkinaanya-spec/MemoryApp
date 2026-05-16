using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MemoryApp.Api.Data;
using MemoryApp.Api.Dtos;

namespace MemoryApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _environment;

    public UsersController(AppDbContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    [HttpGet("{userId}")]
    public async Task<IActionResult> GetUser(int userId)
    {
        var user = await _context.Users
            .Where(u => u.Id == userId)
            .Select(u => new
            {
                u.Id,
                u.Email,
                u.Username,
                u.AvatarUrl,
                u.Bio,
                u.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (user == null)
        {
            return NotFound("Пользователь не найден.");
        }

        return Ok(user);
    }

    [HttpPut("{userId}")]
    public async Task<IActionResult> UpdateUser(int userId, UpdateUserDto dto)
    {
        var user = await _context.Users.FindAsync(userId);

        if (user == null)
        {
            return NotFound("Пользователь не найден.");
        }

        if (string.IsNullOrWhiteSpace(dto.Username))
        {
            return BadRequest("Имя не может быть пустым.");
        }

        user.Username = dto.Username;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Профиль обновлен",
            user.Id,
            user.Username,
            user.AvatarUrl
        });
    }

    [HttpPost("{userId}/avatar")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadAvatar(
        int userId,
        [FromForm] UploadAvatarDto dto)
    {
        var user = await _context.Users.FindAsync(userId);

        if (user == null)
        {
            return NotFound("Пользователь не найден.");
        }

        if (dto.File == null || dto.File.Length == 0)
        {
            return BadRequest("Файл не выбран.");
        }

        var uploadsPath = Path.Combine(
            _environment.WebRootPath,
            "uploads",
            "avatars"
        );

        if (!Directory.Exists(uploadsPath))
        {
            Directory.CreateDirectory(uploadsPath);
        }

        var extension = Path.GetExtension(dto.File.FileName);
        var fileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadsPath, fileName);

        await using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await dto.File.CopyToAsync(stream);
        }

        user.AvatarUrl = $"/uploads/avatars/{fileName}";

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Аватар обновлен",
            user.Id,
            user.Username,
            user.AvatarUrl
        });
    }

    [HttpGet("search")]
public async Task<IActionResult> SearchUsers(
    [FromQuery] string query)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return Ok(new List<object>());
        }

        var users = await _context.Users
            .Where(u =>
                (u.Username != null &&
                u.Username.ToLower().Contains(query.ToLower())) ||

                (u.Email != null &&
                u.Email.ToLower().Contains(query.ToLower())))
            .Select(u => new
            {
                u.Id,
                u.Username,
                u.Email,
                u.AvatarUrl
            })
            .Take(20)
            .ToListAsync();

        return Ok(users);
    }
    [HttpGet("{userId}/shared-photos")]
public async Task<IActionResult> GetSharedPhotos(
    int userId,
    [FromQuery] int viewerId)
    {
        var accessibleFolderIds = await _context.FolderAccesses
            .Where(a => a.UserId == viewerId)
            .Select(a => a.FolderId)
            .ToListAsync();

        var photos = await _context.Photos
            .Where(p =>
                p.OwnerId == userId &&
                _context.PhotoFolders.Any(pf =>
                    pf.PhotoId == p.Id &&
                    accessibleFolderIds.Contains(pf.FolderId)))
            .OrderByDescending(p => p.UploadedAt)
            .Select(p => new
            {
                p.Id,
                p.FileUrl,
                p.Note,
                p.UploadedAt
            })
            .ToListAsync();

        return Ok(photos);
    }
    [HttpDelete("{userId}")]
    public async Task<IActionResult> DeleteUser(int userId)
    {
        var user = await _context.Users.FindAsync(userId);

        if (user == null)
        {
            return NotFound("Пользователь не найден.");
        }

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Профиль удалён"
        });
    }
}